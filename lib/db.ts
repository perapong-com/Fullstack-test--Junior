// 📁 lib/db.ts

// 1. กำหนด Types
export interface User {
  id: number;
  name: string;
}

export interface Conversation {
  id: number;
  participantIds: number[]; // id ของคนในห้อง
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  timestamp: string;
}

export interface Database {
  users: User[];
  conversations: Conversation[];
  messages: Message[];
}

// 2. *** Global Hack สำหรับ dev (ให้ state อยู่ข้าม hot-reload) ***
declare global {
  // eslint-disable-next-line no-var
  var __db: Database | undefined;
}

// 3. ข้อมูลเริ่มต้น
const initialDb: Database = {
  users: [
    { id: 1, name: "Ant" },
    { id: 2, name: "Bee" },
    { id: 3, name: "Cat" },
  ],
  conversations: [
    { id: 101, participantIds: [1, 2] }, // Ant – Bee
    { id: 102, participantIds: [1, 3] }, // Ant – Cat
  ],
  // 👇 ไม่มีข้อความตั้งต้นแล้ว
  messages: [],
};

// 4. ถ้ายังไม่มี __db ใน global (เช่น รันครั้งแรก) ให้สร้าง
const globalForDb = globalThis as typeof globalThis & {
  __db?: Database;
};

if (!globalForDb.__db) {
  globalForDb.__db = initialDb;
}

// 5. export 'db' ที่มาจาก global
export const db: Database = globalForDb.__db!;
