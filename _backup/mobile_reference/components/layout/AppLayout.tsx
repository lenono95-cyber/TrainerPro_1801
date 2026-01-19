"use client";

import React from "react";
import { MobileNav, MenuItem } from "./MobileNav";
import { Users, LayoutDashboard, MessageSquare, Dumbbell, Calendar, Settings } from "lucide-react";

interface AppLayoutProps {
    children: React.ReactNode;
    userRole: string; // Passed from server component
    primaryColor?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    userRole,
    primaryColor = "#ef4444",
}) => {
    // Define menu items based on Role
    const trainerMenuItems: MenuItem[] = [
        { id: "students", label: "Alunos", href: "/dashboard/students", icon: Users },
        { id: "tracking", label: "Tracking", href: "/dashboard/tracking", icon: LayoutDashboard },
        { id: "chat", label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
        { id: "workouts", label: "Treinos", href: "/dashboard/workouts", icon: Dumbbell },
        { id: "schedule", label: "Agenda", href: "/dashboard/schedule", icon: Calendar },
        { id: "settings", label: "Ajustes", href: "/dashboard/settings", icon: Settings },
    ];

    const studentMenuItems: MenuItem[] = [
        { id: "home", label: "Início", href: "/dashboard", icon: LayoutDashboard },
        { id: "workouts", label: "Treinar", href: "/dashboard/student/workouts", icon: Dumbbell },
        { id: "evolution", label: "Evolução", href: "/dashboard/student/evolution", icon: Users },
        { id: "schedule", label: "Agenda", href: "/dashboard/schedule", icon: Calendar },
        { id: "chat", label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
    ];

    const menuItems = userRole === "TRAINER" || userRole === "ADMIN" ? trainerMenuItems : studentMenuItems;

    return (
        <div className="flex flex-col min-h-screen bg-[#09090b] text-white overflow-hidden font-sans selection:bg-white/20">

            {/* Decorative Glow */}
            <div
                className="fixed top-[-10%] left-[-10%] w-[50%] h-[30%] rounded-full blur-[120px] pointer-events-none opacity-20"
                style={{ backgroundColor: primaryColor }}
            />

            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="flex items-center justify-end gap-3">
                    {/* Notification Bell */}
                    <button className="relative p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:bg-zinc-800/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24 no-scrollbar relative z-10">
                {children}
            </main>

            {/* Navigation */}
            <MobileNav menuItems={menuItems} primaryColor={primaryColor} />
        </div>
    );
};
