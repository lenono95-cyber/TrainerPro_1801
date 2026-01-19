import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { signOut } from "next-auth/react";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/login");
    }

    async function handleLogout() {
        "use server";
        await signOut({ redirect: true, callbackUrl: "/login" });
    }

    return (
        <AdminShell userName={session.user.name || "Admin"} onLogout={handleLogout}>
            <div className="p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-zinc-400">Visão geral do sistema</p>
                </header>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* MRR */}
                    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">MRR</p>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-emerald-500 text-lg">💰</span>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">R$ 0</p>
                        <p className="text-xs text-zinc-500">Monthly Recurring Revenue</p>
                    </div>

                    {/* Active Subscribers */}
                    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Ativos</p>
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <span className="text-blue-500 text-lg">👥</span>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">0</p>
                        <p className="text-xs text-zinc-500">Assinantes ativos</p>
                    </div>

                    {/* Churn Rate */}
                    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Churn</p>
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <span className="text-red-500 text-lg">📉</span>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">0%</p>
                        <p className="text-xs text-zinc-500">Taxa de cancelamento</p>
                    </div>

                    {/* LTV */}
                    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">LTV</p>
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <span className="text-purple-500 text-lg">📊</span>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">R$ 0</p>
                        <p className="text-xs text-zinc-500">Lifetime Value estimado</p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <h2 className="text-xl font-bold text-white mb-4">Bem-vindo ao Painel Super Admin</h2>
                    <p className="text-zinc-400 mb-4">
                        Este é o painel de controle do sistema. Aqui você pode gerenciar tenants, visualizar logs de auditoria e monitorar métricas globais.
                    </p>
                    <div className="flex gap-4">
                        <a
                            href="/admin/tenants"
                            className="px-6 py-3 bg-[#ef4444] hover:bg-red-600 text-white font-bold rounded-xl transition-all"
                        >
                            Gerenciar Tenants
                        </a>
                        <a
                            href="/admin/logs"
                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all"
                        >
                            Ver Logs
                        </a>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
