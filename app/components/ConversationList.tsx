"use client";

import { useEffect, useState } from "react";

interface ConversationListProps {
  currentUserId: number;
  onConversationSelect: (id: number) => void;
  trigger: number;
}

interface ConversationItem {
  id: number;
  otherParticipant: {
    id: number;
    name: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
  } | null;
}

// ฟอร์แมตเวลา relative เช่น 4h ago, 2m ago, Yesterday
function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return "Just now";
  if (diffMin < 1) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
  });
}

export function ConversationList({
  currentUserId,
  onConversationSelect,
  trigger,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPartnerId, setNewPartnerId] = useState<number | null>(null);

  // โหลดรายการห้องของ user ปัจจุบัน
  useEffect(() => {
    const fetchConvs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/conversations?userId=${currentUserId}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setError(body?.error || "Failed to load conversations");
          return;
        }
        const data = await res.json();
        setConversations(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConvs();
  }, [currentUserId, trigger]);

  // สร้างห้องใหม่กับ user ที่เลือก
  const handleStartConversation = async () => {
    if (!newPartnerId) return;
    try {
      const res = await fetch(
        `/api/conversations?userId=${currentUserId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId: newPartnerId }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to start conversation");
        return;
      }

      // เลือกห้องใหม่ทันที
      onConversationSelect(data.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ส่วนสร้างห้องใหม่ */}
      <div className="p-2 border-b border-gray-700 flex gap-2 items-center">
        <select
          className="bg-gray-800 text-sm px-2 py-1 rounded flex-1"
          value={newPartnerId ?? ""}
          onChange={(e) =>
            setNewPartnerId(
              e.target.value ? Number(e.target.value) : null
            )
          }
        >
          <option value="">New conversation with...</option>
          {[
            { id: 1, name: "Ant" },
            { id: 2, name: "Bee" },
            { id: 3, name: "Cat" },
          ]
            .filter((u) => u.id !== currentUserId)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
        </select>
        <button
          onClick={handleStartConversation}
          className="bg-blue-600 text-xs px-3 py-1 rounded"
        >
          Start
        </button>
      </div>

      {/* ส่วน list ห้องเดิม */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-sm text-gray-400">Loading…</div>
        )}
        {error && (
          <div className="p-4 text-xs text-red-400">{error}</div>
        )}

        {!loading &&
          !error &&
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onConversationSelect(c.id)}
              className="w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 flex justify-between gap-2"
            >
              <div>
                <div className="text-sm font-semibold">
                  {c.otherParticipant.name}
                </div>
                {c.lastMessage && (
                  <div className="text-xs text-gray-400 truncate">
                    {c.lastMessage.content}
                  </div>
                )}
              </div>
              {c.lastMessage && (
                <div className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                  {formatRelativeTime(c.lastMessage.timestamp)}
                </div>
              )}
            </button>
          ))}

        {!loading && !error && conversations.length === 0 && (
          <div className="p-4 text-sm text-gray-500">
            No conversations yet. Start one above 👆
          </div>
        )}
      </div>
    </div>
  );
}
