"use client";

import React, { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage } from "@/actions/chat";
import { Send, User } from "lucide-react";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: Date;
}

interface ChatWindowProps {
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
}

export function ChatWindow({ currentUserId, otherUserId, otherUserName }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch messages periodically (Polling)
    useEffect(() => {
        const fetch = async () => {
            const msgs = await getMessages(otherUserId);
            // Only update if length changed to avoid jitter, 
            // but ideally we should check for IDs. For MVP this is fine.
            setMessages(msgs);
        };

        fetch();
        const interval = setInterval(fetch, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [otherUserId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        // Optimistic update
        const tempMsg: Message = {
            id: "temp-" + Date.now(),
            sender_id: currentUserId,
            content: newMessage,
            created_at: new Date()
        };
        setMessages(prev => [...prev, tempMsg]);
        const msgToSend = newMessage;
        setNewMessage("");

        await sendMessage(otherUserId, msgToSend);

        // Refetch to get real ID and created_at
        const msgs = await getMessages(otherUserId);
        setMessages(msgs);
        setSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-zinc-900/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <User size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white">{otherUserName}</h3>
                    <p className="text-xs text-zinc-500">Online recentemente</p>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-zinc-600 mt-10">
                        <p>Inicie a conversa com {otherUserName}.</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-2xl p-4 ${isMe
                                    ? "bg-[#ef4444] text-white rounded-br-none"
                                    : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                                }`}>
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-zinc-900/60 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ef4444] outline-none transition-colors"
                />
                <button
                    disabled={sending}
                    type="submit"
                    className="bg-[#ef4444] hover:bg-red-600 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
