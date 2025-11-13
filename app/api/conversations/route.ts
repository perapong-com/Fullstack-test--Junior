import { NextRequest, NextResponse } from "next/server";
import { db, Conversation } from "@/lib/db";

// GET /api/conversations?userId=1
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currentUserIdStr = searchParams.get("userId");

  if (!currentUserIdStr) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const currentUserId = Number(currentUserIdStr);

  // เอาแต่ห้องที่ user คนนี้อยู่
  const conversations = db.conversations.filter((c) =>
    c.participantIds.includes(currentUserId)
  );

  // เตรียมข้อมูล last message + another participant
  const result = conversations
    .map((c) => {
      const otherId = c.participantIds.find((id) => id !== currentUserId)!;
      const other = db.users.find((u) => u.id === otherId)!;

      const msgs = db.messages
        .filter((m) => m.conversationId === c.id)
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() -
            new Date(b.timestamp).getTime()
        );

      const last = msgs[msgs.length - 1] ?? null;

      return {
        id: c.id,
        otherParticipant: {
          id: other.id,
          name: other.name,
        },
        lastMessage: last
          ? {
              content: last.content,
              timestamp: last.timestamp,
            }
          : null,
      };
    })
    .sort((a, b) => {
      const ta = a.lastMessage
        ? new Date(a.lastMessage.timestamp).getTime()
        : 0;
      const tb = b.lastMessage
        ? new Date(b.lastMessage.timestamp).getTime()
        : 0;
      return tb - ta; // ล่าสุดอยู่บนสุด
    });

  return NextResponse.json(result);
}

// POST /api/conversations?userId=1
// body: { participantId: 2 }
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currentUserIdStr = searchParams.get("userId");

  if (!currentUserIdStr) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const currentUserId = Number(currentUserIdStr);
  const body = await request.json();
  const participantId = Number(body.participantId);

  if (!participantId || !Number.isFinite(participantId)) {
    return NextResponse.json(
      { error: "participantId is required" },
      { status: 400 }
    );
  }

  if (participantId === currentUserId) {
    return NextResponse.json(
      { error: "cannot start conversation with yourself" },
      { status: 400 }
    );
  }

  const otherUser = db.users.find((u) => u.id === participantId);
  if (!otherUser) {
    return NextResponse.json(
      { error: "participant not found" },
      { status: 404 }
    );
  }

  // กัน duplicate ห้องระหว่าง user เดิม 2 คน
  const existing = db.conversations.find((c) => {
    const ids = c.participantIds;
    return (
      ids.includes(currentUserId) && ids.includes(participantId)
    );
  });

  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const newId =
    db.conversations.reduce((max, c) => Math.max(max, c.id), 0) + 1;

  const newConv: Conversation = {
    id: newId,
    participantIds: [currentUserId, participantId],
  };

  db.conversations.push(newConv);

  return NextResponse.json(newConv, { status: 201 });
}
