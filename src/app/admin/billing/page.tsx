import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSubscriptionPlans } from "@/actions/billing";
import { BillingView } from "@/components/admin/BillingView";

export default async function BillingPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/login");
    }

    // Note: getPaymentHistory requires tenant_id from session
    // For SUPER_ADMIN, we'll need to modify the action or show all payments
    // For now, showing empty state as this is a global view
    const payments: never[] = []; // Will be populated when we have global payment query
    const plans = await getSubscriptionPlans();

    return (
        <AdminShell userName={session.user.name || "Admin"} onLogout={async () => { "use server"; }}>
            <div className="p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
                    <p className="text-zinc-400">Visão geral de pagamentos e planos de assinatura</p>
                </header>

                <BillingView payments={payments} plans={plans} />
            </div>
        </AdminShell>
    );
}
