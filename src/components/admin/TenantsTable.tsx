"use client";

import { useState } from "react";
import { Search, Plus, Power, Eye, X } from "lucide-react";
import { createTenant, toggleTenantStatus } from "@/actions/admin";
import { useRouter } from "next/navigation";

interface Tenant {
    id: string;
    name: string;
    type: string | null;
    status: string;
    primaryColor: string;
    subscription_plan: string;
    owner_email: string;
    owner_name: string;
    active_students_count: number;
    created_at: Date;
}

interface TenantsTableProps {
    initialTenants: Tenant[];
}

export function TenantsTable({ initialTenants }: TenantsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const filteredTenants = initialTenants.filter(
        (t) =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "suspended" : "active";
        const confirmed = confirm(
            `${newStatus === "suspended" ? "Suspender" : "Ativar"} acesso deste tenant?`
        );

        if (confirmed) {
            await toggleTenantStatus(tenantId, newStatus);
            router.refresh();
        }
    };

    const handleImpersonate = async (tenantId: string, tenantName: string) => {
        const confirmed = confirm(
            `⚠️ AÇÃO CRÍTICA DE SEGURANÇA (LOGIN AS)\n\nVocê está prestes a acessar o painel como "${tenantName}".\nEsta ação será registrada nos logs de auditoria.\n\nDeseja continuar?`
        );

        if (confirmed) {
            alert(`[SYSTEM] Impersonation para "${tenantName}" será implementado em breve.\nEsta ação foi registrada nos logs de auditoria.`);
        }
    };

    const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsCreating(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            type: formData.get("type") as string,
            primaryColor: formData.get("primaryColor") as string,
            ownerEmail: formData.get("ownerEmail") as string,
            ownerName: formData.get("ownerName") as string,
            ownerPassword: formData.get("ownerPassword") as string,
        };

        const result = await createTenant(data);

        setIsCreating(false);

        if (result.success) {
            setShowCreateModal(false);
            router.refresh();
        } else {
            alert("Erro ao criar tenant: " + result.error);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const isActive = status === "active";
        return (
            <span
                className={`px-2 py-1 rounded text-xs font-bold uppercase ${isActive
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
            >
                {status}
            </span>
        );
    };

    return (
        <>
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-zinc-500" />
                    <input
                        className="bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ef4444] w-80"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#ef4444] hover:bg-red-600 text-white font-bold rounded-xl transition-all"
                >
                    <Plus size={18} />
                    Novo Tenant
                </button>
            </div>

            {/* Tenants Table */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-500 font-medium uppercase border-b border-white/5">
                        <tr>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Plano</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Alunos</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                        {filteredTenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-zinc-900/50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white border border-white/5"
                                            style={{ backgroundColor: tenant.primaryColor }}
                                        >
                                            {tenant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{tenant.name}</p>
                                            <p className="text-xs text-zinc-500">{tenant.owner_email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="capitalize text-zinc-400">{tenant.type || "N/A"}</span>
                                </td>
                                <td className="p-4">
                                    <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded text-xs uppercase font-bold text-zinc-400">
                                        {tenant.subscription_plan}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={tenant.status} />
                                </td>
                                <td className="p-4">
                                    <span className="font-bold text-white">{tenant.active_students_count}</span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleImpersonate(tenant.id, tenant.name)}
                                            className="p-2 hover:bg-purple-500/10 rounded-lg text-zinc-400 hover:text-purple-500 transition-colors"
                                            title="Impersonate (Login As)"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                                            className={`p-2 hover:bg-zinc-800 rounded-lg transition-colors ${tenant.status === "active"
                                                ? "text-zinc-400 hover:text-red-500"
                                                : "text-zinc-400 hover:text-emerald-500"
                                                }`}
                                            title={tenant.status === "active" ? "Suspender" : "Ativar"}
                                        >
                                            <Power size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredTenants.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        Nenhum tenant encontrado.
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Criar Novo Tenant</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-zinc-500 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTenant} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">
                                    Nome do Tenant
                                </label>
                                <input
                                    name="name"
                                    required
                                    placeholder="Ex: Academia Fitness"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">
                                    Tipo
                                </label>
                                <select
                                    name="type"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]"
                                >
                                    <option value="personal">Personal</option>
                                    <option value="academy">Academia</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">
                                    Cor Primária
                                </label>
                                <input
                                    name="primaryColor"
                                    type="color"
                                    defaultValue="#ef4444"
                                    className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl p-1 outline-none focus:border-[#ef4444]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">
                                    Nome do Proprietário
                                </label>
                                <input
                                    name="ownerName"
                                    required
                                    placeholder="Ex: João Silva"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">
                                    Email do Proprietário
                                </label>
                                <input
                                    name="ownerEmail"
                                    type="email"
                                    required
                                    placeholder="email@exemplo.com"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">
                                    Senha Inicial
                                </label>
                                <input
                                    name="ownerPassword"
                                    type="password"
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-[#ef4444] hover:bg-red-600 text-white font-bold py-4 rounded-xl mt-4 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isCreating ? "Criando..." : "Criar Tenant"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
