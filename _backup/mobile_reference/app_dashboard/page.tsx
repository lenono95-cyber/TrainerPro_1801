import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-zinc-400">Welcome back, <span className="text-white font-semibold">{session.user.name}</span></p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Cards Example using Legacy Style */}
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-2">My Role</p>
                    <p className="text-2xl font-bold text-white">{session.user.role}</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-2">Tenant ID</p>
                    <p className="font-mono text-xs text-zinc-400 break-all">{session.user.tenant_id}</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-2">Account</p>
                    <p className="text-white">{session.user.email}</p>
                </div>
            </div>
        </div>
    );
}
