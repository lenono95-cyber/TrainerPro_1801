import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAuditLogs } from "@/actions/admin";
import { AuditLogsTable } from "@/components/admin/AuditLogsTable";

export default async function AuditLogsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/login");
    }

    const logs = await getAuditLogs(100);

    return (
        <AdminShell userName={session.user.name || "Admin"} onLogout={async () => { "use server"; }}>
            <div className="p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Logs de Auditoria</h1>
                    <p className="text-zinc-400">Todas as ações administrativas críticas são registradas aqui</p>
                </header>

                <AuditLogsTable logs={logs} />
            </div>
        </AdminShell>
    );
}
