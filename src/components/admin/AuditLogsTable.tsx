"use client";

import { useState } from "react";
import { Filter, Shield } from "lucide-react";

interface AuditLog {
    id: string;
    actor_id: string;
    actor_email: string;
    action: string;
    target_resource: string;
    details: string | null;
    ip_address: string;
    created_at: Date;
}

interface AuditLogsTableProps {
    logs: AuditLog[];
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
    const [filterAction, setFilterAction] = useState("ALL");

    const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));
    const filteredLogs =
        filterAction === "ALL" ? logs : logs.filter((log) => log.action === filterAction);

    const getActionColor = (action: string) => {
        if (action.includes("DELETE") || action.includes("suspended")) {
            return "bg-red-500/10 text-red-500 border-red-500/20";
        }
        if (action.includes("CREATE")) {
            return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        }
        if (action.includes("UPDATE")) {
            return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        }
        if (action.includes("LOGIN")) {
            return "bg-purple-500/10 text-purple-500 border-purple-500/20";
        }
        return "bg-zinc-800 border-zinc-700 text-zinc-400";
    };

    return (
        <>
            {/* Alert Box */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 mb-6">
                <Shield size={20} className="text-yellow-500 shrink-0" />
                <div>
                    <h3 className="text-sm font-bold text-yellow-500">Logs de Segurança</h3>
                    <p className="text-xs text-yellow-200/70 mt-1">
                        Todas as ações administrativas críticas são registradas aqui para auditoria e compliance.
                    </p>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex items-center gap-3 mb-6">
                <Filter size={16} className="text-zinc-500" />
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                        Filtrar Ação
                    </label>
                    <select
                        className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer pr-4"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <option value="ALL">Todas as Ações</option>
                        {uniqueActions.map((action) => (
                            <option key={action} value={action}>
                                {action}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-500 font-medium uppercase border-b border-white/5">
                        <tr>
                            <th className="p-4">Data/Hora</th>
                            <th className="p-4">Ator</th>
                            <th className="p-4">Ação</th>
                            <th className="p-4">Alvo</th>
                            <th className="p-4">IP</th>
                            <th className="p-4">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-900/50 transition-colors">
                                <td className="p-4 font-mono text-xs text-zinc-500">
                                    {new Date(log.created_at).toLocaleString("pt-BR")}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                                            {log.actor_email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="truncate max-w-[200px]" title={log.actor_email}>
                                            {log.actor_email}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`border px-2 py-1 rounded text-xs font-mono font-bold ${getActionColor(
                                            log.action
                                        )}`}
                                    >
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4 text-zinc-400">{log.target_resource}</td>
                                <td className="p-4 font-mono text-xs text-zinc-500">{log.ip_address}</td>
                                <td className="p-4 text-xs text-zinc-500 truncate max-w-[200px]" title={log.details || ""}>
                                    {log.details || "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        Nenhum log encontrado.
                    </div>
                )}
            </div>
        </>
    );
}
