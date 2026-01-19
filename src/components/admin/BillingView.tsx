"use client";

interface Payment {
    id: string;
    tenant_id: string;
    amount: number;
    status: string;
    method: string | null;
    paid_at: Date | null;
    invoice_url: string | null;
    created_at: Date;
}

interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    price: number;
    interval: string;
    features: string[];
    active: boolean;
    created_at: Date;
}

interface BillingViewProps {
    payments: Payment[];
    plans: SubscriptionPlan[];
}

export function BillingView({ payments, plans }: BillingViewProps) {
    const StatusBadge = ({ status }: { status: string }) => {
        let color = "bg-zinc-800 text-zinc-400 border-zinc-700";

        switch (status) {
            case "paid":
                color = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                break;
            case "open":
                color = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                break;
            case "void":
            case "uncollectible":
                color = "bg-red-500/10 text-red-500 border-red-500/20";
                break;
        }

        return (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${color}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Subscription Plans */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Planos de Assinatura</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl hover:border-[#ef4444]/30 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                {plan.active && (
                                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold">
                                        ATIVO
                                    </span>
                                )}
                            </div>

                            <div className="mb-6">
                                <p className="text-3xl font-bold text-white">
                                    R$ {plan.price.toFixed(2)}
                                </p>
                                <p className="text-sm text-zinc-500 capitalize">por {plan.interval === "monthly" ? "mês" : "ano"}</p>
                            </div>

                            <div className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-zinc-400">
                                        <span className="text-emerald-500">✓</span>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-zinc-500 bg-zinc-900/40 border border-white/5 rounded-3xl">
                            Nenhum plano cadastrado no sistema.
                        </div>
                    )}
                </div>
            </div>

            {/* Payment History */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Histórico de Pagamentos</h2>
                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-500 font-medium uppercase border-b border-white/5">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Tenant</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Método</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Fatura</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-zinc-900/50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-zinc-500">
                                        {payment.id.substring(0, 8)}...
                                    </td>
                                    <td className="p-4 font-bold text-white">{payment.tenant_id}</td>
                                    <td className="p-4 text-zinc-400">
                                        {payment.paid_at
                                            ? new Date(payment.paid_at).toLocaleDateString("pt-BR")
                                            : "-"}
                                    </td>
                                    <td className="p-4 capitalize text-zinc-400">
                                        {payment.method?.replace("_", " ") || "-"}
                                    </td>
                                    <td className="p-4 font-mono text-white">
                                        R$ {payment.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={payment.status} />
                                    </td>
                                    <td className="p-4 text-right">
                                        {payment.invoice_url ? (
                                            <a
                                                href={payment.invoice_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:underline text-xs"
                                            >
                                                Ver PDF
                                            </a>
                                        ) : (
                                            <span className="text-zinc-600 text-xs">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {payments.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            Nenhum pagamento registrado ainda.
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Total Recebido
                    </p>
                    <p className="text-3xl font-bold text-white">
                        R${" "}
                        {payments
                            .filter((p) => p.status === "paid")
                            .reduce((sum, p) => sum + p.amount, 0)
                            .toFixed(2)}
                    </p>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Pagamentos
                    </p>
                    <p className="text-3xl font-bold text-white">{payments.length}</p>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Planos Ativos
                    </p>
                    <p className="text-3xl font-bold text-white">
                        {plans.filter((p) => p.active).length}
                    </p>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Pendentes
                    </p>
                    <p className="text-3xl font-bold text-white">
                        {payments.filter((p) => p.status === "open").length}
                    </p>
                </div>
            </div>
        </div>
    );
}
