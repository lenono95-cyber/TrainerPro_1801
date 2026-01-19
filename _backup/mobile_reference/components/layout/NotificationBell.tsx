"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

export function NotificationBell() {
    const [hasNotifications] = useState(false);

    return (
        <button className="relative p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:bg-zinc-800/50 transition-colors">
            <Bell size={20} className="text-zinc-400" />
            {hasNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] rounded-full animate-pulse" />
            )}
        </button>
    );
}
