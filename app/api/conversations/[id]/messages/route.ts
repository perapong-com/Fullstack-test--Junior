import { NextRequest, NextResponse } from "next/server";
import { db, User, Message } from "@/lib/db";

function mapMessage(m: Message, users: User[]) {
  const sender = users.find((u) => u.id === m.senderId)!;
  return {
    id: m.id,
    content: m.content,
    createdAt: m.timestamp,
    sender: {
      id: sender.id,
      name: sender.name,
    },
  };
}

// ---------- GET: list messages ----------
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 ต้อง await ก่อน
  const searchParams = request.nextUrl.searchParams;
  const currentUserIdStr = searchParams.get("userId");

  if (!currentUserIdStr) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const currentUserId = Number(currentUserIdStr);
  const conversationId = Number(id);

  if (Number.isNaN(conversationId)) {
    return NextResponse.json(
      { error: "Invalid conversation id format" },
      { status: 400 }
    );
  }

  const conversation = db.conversations.find(
    (c) =>
      c.id === conversationId && c.participantIds.includes(currentUserId)
  );

  if (!conversation) {
    return NextResponse.json(
      { error: "Forbidden: you are not in this conversation" },
      { status: 403 }
    );
  }

  const messages = db.messages
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    );

  const result = messages.map((m) => mapMessage(m, db.users));

  return NextResponse.json(result, { status: 200 });
}

// ---------- POST: send message ----------
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 await ตรงนี้ด้วย
  const searchParams = request.nextUrl.searchParams;
  const currentUserIdStr = searchParams.get("userId");

  if (!currentUserIdStr) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const currentUserId = Number(currentUserIdStr);
  const conversationId = Number(id);

  if (Number.isNaN(conversationId)) {
    return NextResponse.json(
      { error: "Invalid conversation id format" },
      { status: 400 }
    );
  }

  const conversation = db.conversations.find(
    (c) =>
      c.id === conversationId && c.participantIds.includes(currentUserId)
  );

  if (!conversation) {
    return NextResponse.json(
      { error: "Forbidden: you are not in this conversation" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const content = (body.content ?? "").toString().trim();

  if (!content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const newId =
    db.messages.reduce((max, m) => Math.max(max, m.id), 0) + 1;

  const newMsg: Message = {
    id: newId,
    conversationId,
    senderId: currentUserId,
    content,
    timestamp: new Date().toISOString(),
  };

  db.messages.push(newMsg);

  const result = mapMessage(newMsg, db.users);
  return NextResponse.json(result, { status: 201 });
}
