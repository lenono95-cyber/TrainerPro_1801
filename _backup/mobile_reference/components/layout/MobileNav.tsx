"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
    id: string; // id is used as the path segment
    href: string;
    label: string;
    icon: LucideIcon;
}

interface MobileNavProps {
    primaryColor?: string;
    menuItems: MenuItem[];
}

export const MobileNav: React.FC<MobileNavProps> = ({
    primaryColor = "#ef4444", // Default red
    menuItems,
}) => {
    const pathname = usePathname();
    const router = useRouter();

    // Helper to determine if tab is active
    const isActiveTab = (href: string) => {
        if (href === "/dashboard" && pathname === "/dashboard") return true;
        if (href !== "/dashboard" && pathname.startsWith(href)) return true;
        return false;
    };

    const getActiveStyle = (isActive: boolean) => {
        if (!isActive) return { color: "#71717a" }; // zinc-500
        return {
            color: primaryColor,
            textShadow: `0 0 10px ${primaryColor}40`,
        };
    };

    return (
        <nav className="fixed bottom-4 left-4 right-4 h-16 rounded-2xl glass border border-white/10 shadow-2xl flex justify-around items-center z-50">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveTab(item.href);

                return (
                    <button
                        key={item.id}
                        onClick={() => router.push(item.href)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? "-translate-y-1" : ""
                            }`}
                        style={getActiveStyle(isActive)}
                    >
                        <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                        {isActive && (
                            <span className="text-[10px] font-medium animate-in fade-in slide-in-from-bottom-1 duration-200">
                                {item.label}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
};
