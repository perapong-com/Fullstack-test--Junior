"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const USERS = [
  { 
    id: 1, 
    name: "Ant", 
    icon: "🐜",
    color: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/20",
    description: "The diligent worker"
  },
  { 
    id: 2, 
    name: "Bee", 
    icon: "🐝",
    color: "from-yellow-400 to-amber-500",
    bgGlow: "bg-yellow-500/20",
    description: "The social buzzer"
  },
  { 
    id: 3, 
    name: "Cat", 
    icon: "🐱",
    color: "from-purple-500 to-pink-500",
    bgGlow: "bg-purple-500/20",
    description: "The curious explorer"
  },
];

export default function SelectUserPage() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelectUser = (id: number) => {
    setSelectedId(id);
    // Small delay for animation before navigation
    setTimeout(() => {
      router.push(`/?userId=${id}`);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card with gradient border */}
        <div className="relative rounded-3xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 p-[2px] shadow-2xl backdrop-blur-xl">
          <div className="rounded-3xl bg-gray-950/95 backdrop-blur-xl">
            {/* Header section */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-500">
                    Select User
                  </h1>
                  <p className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Choose Your Identity
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Pick a character to start chatting
              </p>
            </div>

            {/* User selection cards */}
            <div className="px-6 py-6 space-y-3">
              {USERS.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user.id)}
                  onMouseEnter={() => setHoveredId(user.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  disabled={selectedId !== null}
                  className="group relative w-full rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideInUp 0.5s ease-out forwards',
                    opacity: 0
                  }}
                >
                  {/* Card glow effect on hover */}
                  <div 
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${user.color} opacity-0 blur-xl transition-opacity duration-300 ${
                      hoveredId === user.id ? 'opacity-30' : ''
                    } ${selectedId === user.id ? 'opacity-50 blur-2xl' : ''}`}
                  ></div>
                  
                  {/* Card border gradient */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${user.color} opacity-0 p-[1px] transition-opacity duration-300 ${
                    hoveredId === user.id || selectedId === user.id ? 'opacity-100' : ''
                  }`}>
                    <div className="w-full h-full rounded-2xl bg-gray-900"></div>
                  </div>

                  {/* Card content */}
                  <div className={`relative flex items-center gap-4 rounded-2xl border transition-all duration-300 px-5 py-4 ${
                    selectedId === user.id 
                      ? 'border-white/40 bg-white/10 scale-[0.98]' 
                      : hoveredId === user.id
                      ? 'border-white/30 bg-white/5'
                      : 'border-gray-800 bg-gray-900/50'
                  }`}>
                    {/* User avatar */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${user.color} flex items-center justify-center shadow-lg transition-transform duration-300 ${
                        hoveredId === user.id ? 'scale-110' : ''
                      } ${selectedId === user.id ? 'scale-95' : ''}`}>
                        <span className="text-3xl">{user.icon}</span>
                      </div>
                      
                      {/* Checkmark for selected */}
                      {selectedId === user.id && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Animated ring */}
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${user.color} opacity-0 blur-md transition-opacity duration-300 ${
                        hoveredId === user.id ? 'opacity-40 animate-pulse' : ''
                      }`}></div>
                    </div>

                    {/* User info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-lg font-bold transition-all duration-300 ${
                          hoveredId === user.id || selectedId === user.id
                            ? `bg-gradient-to-r ${user.color} bg-clip-text text-transparent`
                            : 'text-white'
                        }`}>
                          {user.name}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          #{user.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {user.description}
                      </p>
                    </div>

                    {/* Arrow icon */}
                    <div className={`transition-all duration-300 ${
                      hoveredId === user.id ? 'translate-x-1 opacity-100' : 'opacity-30'
                    }`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-800/50">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-400 leading-relaxed">
                  You can switch between users anytime from the chat screen using the button in the header.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}