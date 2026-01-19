"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, FileText, LogOut, Shield, Wallet } from "lucide-react";

interface AdminShellProps {
    children: React.ReactNode;
    userName: string;
    onLogout: () => void;
}

export function AdminShell({ children, userName, onLogout }: AdminShellProps) {
    const pathname = usePathname();

    const menuItems = [
        { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { id: "tenants", label: "Tenants", href: "/admin/tenants", icon: Users },
        { id: "billing", label: "Financeiro", href: "/admin/billing", icon: Wallet },
        { id: "logs", label: "Audit Logs", href: "/admin/logs", icon: FileText },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <div className="flex h-screen bg-[#09090b]">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ef4444] flex items-center justify-center">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Super Admin</h1>
                            <p className="text-xs text-zinc-500">TrainerPro</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                                    ? "bg-[#ef4444] text-white shadow-lg shadow-red-500/20"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{userName}</p>
                                <p className="text-xs text-zinc-500">Super Admin</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                    >
                        <LogOut size={16} />
                        <span className="text-sm font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
