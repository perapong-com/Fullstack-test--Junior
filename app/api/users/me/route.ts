// 📁 app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/users/me?userId=1
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userIdStr = searchParams.get("userId");

  if (!userIdStr) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const userId = Number(userIdStr);
  if (!Number.isFinite(userId)) {
    return NextResponse.json(
      { error: "Invalid userId" },
      { status: 400 }
    );
  }

  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(user, { status: 200 });
}
