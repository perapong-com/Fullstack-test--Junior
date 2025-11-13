"use client";

import { useEffect, useState } from "react";

interface ChatRoomProps {
  currentUserId: number;
  selectedConversationId: number | null;
  onMessageSent: () => void;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    name: string;
  };
}

// ฟอร์แมตเวลาเป็น HH:MM ตาม locale
function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// รองรับ response หลายรูปแบบ (array ตรง ๆ / {messages: []} ฯลฯ)
function extractMessages(raw: any): Message[] {
  if (Array.isArray(raw)) return raw as Message[];
  if (Array.isArray(raw?.messages)) return raw.messages as Message[];
  if (Array.isArray(raw?.data)) return raw.data as Message[];
  if (Array.isArray(raw?.conversation?.messages)) {
    return raw.conversation.messages as Message[];
  }
  return [];
}

export function ChatRoom({
  currentUserId,
  selectedConversationId,
  onMessageSent,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อความของห้องที่เลือก + polling
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/conversations/${selectedConversationId}/messages?userId=${currentUserId}`
        );

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          console.error("GET /messages ERROR:", res.status, errBody);
          if (!cancelled) {
            setError(
              errBody?.error ||
                `Failed to load messages (status ${res.status})`
            );
          }
          return;
        }

        const raw = await res.json();
        const data = extractMessages(raw);

        if (!cancelled) {
          setMessages(data);
          setError(null);
        }
      } catch (err: any) {
        console.error("GET /messages EXCEPTION:", err);
        if (!cancelled) {
          setError(err.message ?? "Failed to load messages");
        }
      }
    };

    // ดึงครั้งแรก
    fetchMessages();

    // Poll ทุก 2 วิ
    const intervalId = setInterval(fetchMessages, 2000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [selectedConversationId, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;
    if (!selectedConversationId) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversationId}/messages?userId=${currentUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("POST /messages ERROR:", response.status, errorData);
        setError(
          errorData?.error ||
            `Failed to send message (status ${response.status})`
        );
        setIsSending(false);
        return;
      }

      // message ใหม่ (เผื่ออยากใช้ต่อ แต่ตอนนี้เรา refetch อีกที)
      await response.json().catch(() => null);

      setContent("");

      // ดึงข้อความใหม่ทันทีหลังส่ง
      try {
        const refreshed = await fetch(
          `/api/conversations/${selectedConversationId}/messages?userId=${currentUserId}`
        );
        if (refreshed.ok) {
          const raw = await refreshed.json();
          const newMessages = extractMessages(raw);
          setMessages(newMessages);
        }
      } catch (err) {
        console.error("Refetch after send ERROR:", err);
      }

      onMessageSent();
      setError(null);
    } catch (err: any) {
      console.error("POST /messages EXCEPTION:", err);
      setError(err.message ?? "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // ยังไม่ได้เลือกห้อง
  if (!selectedConversationId) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* กล่องข้อความ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && !error && (
          <div className="text-center text-sm text-gray-500">
            No messages yet. Say hi!
          </div>
        )}

        {messages.map((m) => {
          const isMe = m.sender.id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-md rounded-lg bg-gray-800 px-3 py-2 text-sm">
                <div className="flex items-baseline gap-2 mb-1">
                  <div className="text-xs text-gray-400">
                    {m.sender.name}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {formatTime(m.createdAt)}
                  </div>
                </div>
                <div>{m.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ช่องพิมพ์ + ปุ่ม Send */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-800 p-3 flex gap-2"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 rounded bg-gray-800 px-3 py-2 text-sm text-white outline-none"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          disabled={!content.trim() || isSending || !selectedConversationId}
          className="px-4 py-2 rounded bg-blue-600 text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {error && (
        <div className="px-4 py-2 text-xs text-red-400 border-t border-gray-800">
          {error}
        </div>
      )}
    </div>
  );
}
