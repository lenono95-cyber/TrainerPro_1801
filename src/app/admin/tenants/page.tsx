import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAllTenants } from "@/actions/admin";
import { TenantsTable } from "@/components/admin/TenantsTable";

export const dynamic = 'force-dynamic';

export default async function TenantsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/login");
    }

    const tenants = await getAllTenants();

    return (
        <AdminShell userName={session.user.name || "Admin"} onLogout={async () => { "use server"; }}>
            <div className="p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Gestão de Tenants</h1>
                    <p className="text-zinc-400">Gerencie academias e personais cadastrados no sistema</p>
                </header>

                <TenantsTable initialTenants={tenants} />
            </div>
        </AdminShell>
    );
}
