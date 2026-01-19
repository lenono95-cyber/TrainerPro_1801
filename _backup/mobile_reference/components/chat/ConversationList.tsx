"use client";

import React from "react";
import Link from "next/link";
import { User, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";

interface ChatUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
}

interface ConversationListProps {
    users: ChatUser[];
}

export function ConversationList({ users }: ConversationListProps) {
    const pathname = usePathname();

    if (users.length === 0) {
        return (
            <div className="text-center py-10 opacity-50">
                <MessageSquare className="mx-auto mb-2" />
                <p>Nenhum contato encontrado.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {users.map((user) => {
                const isActive = pathname.includes(user.id);
                return (
                    <Link
                        key={user.id}
                        href={`/dashboard/chat/${user.id}`}
                        className={`p-4 rounded-xl flex items-center gap-3 transition-all border ${isActive
                                ? "bg-[#ef4444]/10 border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                : "bg-zinc-900/40 border-white/5 hover:bg-zinc-800 hover:border-white/10"
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? "bg-[#ef4444] text-white" : "bg-zinc-800 text-zinc-400"
                            }`}>
                            {user.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User size={18} />
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className={`font-bold truncate ${isActive ? "text-white" : "text-zinc-300"}`}>
                                {user.name}
                            </h4>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
