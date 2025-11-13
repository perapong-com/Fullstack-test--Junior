// 📁 app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ConversationList } from "./components/ConversationList";
import { ChatRoom } from "./components/ChatRoom";

const USER_OPTIONS = [
  { id: 1, name: "Ant", color: "from-amber-500 to-orange-500", icon: "🐜" },
  { id: 2, name: "Bee", color: "from-yellow-400 to-amber-500", icon: "🐝" },
  { id: 3, name: "Cat", color: "from-purple-500 to-pink-500", icon: "🐱" },
];

function getUserInfo(id: number) {
  return USER_OPTIONS.find((u) => u.id === id) ?? { 
    name: `User ${id}`, 
    color: "from-gray-500 to-gray-600",
    icon: "👤"
  };
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userIdFromQuery = Number(searchParams.get("userId") ?? NaN);
  const initialUserId = [1, 2, 3].includes(userIdFromQuery) ? userIdFromQuery : 1;

  const [currentUserId, setCurrentUserId] = useState(initialUserId);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [sidebarTrigger, setSidebarTrigger] = useState(0);

  const currentUser = getUserInfo(currentUserId);

  useEffect(() => {
    router.replace(`/?userId=${currentUserId}`);
  }, [currentUserId, router]);

  const handleChangeUser = () => {
    router.push("/select-user");
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header with enhanced styling */}
      <header className="relative flex items-center justify-between px-6 py-4 border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/70">
        {/* Decorative gradient line */}
        <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${currentUser.color} opacity-60`}></div>
        
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${currentUser.color} shadow-lg`}>
            <span className="text-2xl">{currentUser.icon}</span>
            {/* Animated ring */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${currentUser.color} opacity-30 blur-md animate-pulse`}></div>
          </div>
          
          {/* User Info */}
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-semibold block">
              Current User
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {currentUser.name}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                ID:{currentUserId}
              </span>
            </div>
          </div>
        </div>

        {/* Change User Button */}
        <button
          onClick={handleChangeUser}
          className="group relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {/* Button gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentUser.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
          
          {/* Button border glow */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentUser.color} blur-xl opacity-0 group-hover:opacity-50 transition-opacity`}></div>
          
          {/* Button content */}
          <span className="relative flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch User
          </span>
        </button>
      </header>

      {/* Main layout with enhanced styling */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with gradient border */}
        <aside className="relative w-full max-w-xs overflow-hidden">
          {/* Gradient border effect */}
          <div className={`absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b ${currentUser.color} opacity-30`}></div>
          
          <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-900/50 to-gray-950/50 backdrop-blur-sm">
            <ConversationList
              currentUserId={currentUserId}
              onConversationSelect={setSelectedConversationId}
              trigger={sidebarTrigger}
            />
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-gray-950/20 pointer-events-none"></div>
          
          <div className="relative flex-1 flex flex-col">
            <ChatRoom
              currentUserId={currentUserId}
              selectedConversationId={selectedConversationId}
              onMessageSent={() => setSidebarTrigger((t) => t + 1)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}