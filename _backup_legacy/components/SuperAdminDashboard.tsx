
import React, { useEffect, useState } from 'react';
import { db } from '../services/supabaseService';
import { UserProfile, Tenant, Subscription, AuditLogDTO, Plan, InvoiceListDTO, Student, DashboardKPIs, TenantListDTO } from '../types';
import { 
    Shield, Users, Activity, Search, Filter, MoreVertical, LogOut, 
    CheckCircle2, AlertCircle, Building2, LayoutGrid, Zap, Plus, X, Edit, Trash2, 
    Package, RefreshCw, Lock, Mail, Key, UserCheck, UserX, Loader2, Save,
    Settings, Power, DollarSign, Wallet, ArrowUpRight, BarChart3, Globe,
    ChevronRight, Eye, AlertTriangle, FileText, Ban
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

interface SuperAdminDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

// Sub-Componentes para organização
const StatusBadge = ({ status }: { status: string }) => {
    // Cores padronizadas Stripe
    let color = 'bg-zinc-800 text-zinc-400 border-zinc-700';
    
    switch (status) {
        case 'active': 
            color = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'; 
            break;
        case 'trialing': 
            color = 'bg-blue-500/10 text-blue-500 border-blue-500/20'; 
            break;
        case 'past_due': 
            color = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'; 
            break;
        case 'canceled': 
            color = 'bg-zinc-800 text-zinc-500 border-zinc-700'; 
            break;
        case 'incomplete': 
            color = 'bg-red-500/10 text-red-500 border-red-500/20'; 
            break;
        case 'paid': // Invoice Status
            color = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'; 
            break;
        case 'open': // Invoice Status
            color = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'; 
            break;
        case 'void': // Invoice Status
        case 'uncollectible': // Invoice Status
            color = 'bg-red-500/10 text-red-500 border-red-500/20'; 
            break;
    }
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${color}`}>
            {status?.replace('_', ' ')}
        </span>
    );
};

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'academies' | 'personals' | 'students' | 'finance' | 'audit'>('dashboard');
  
  // Data States based on DTOs
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [academyTenants, setAcademyTenants] = useState<TenantListDTO[]>([]);
  const [personalTenants, setPersonalTenants] = useState<TenantListDTO[]>([]);
  const [invoices, setInvoices] = useState<InvoiceListDTO[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogDTO[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // "Impersonation" Real via Service
  const handleImpersonate = async (tenantId: string, tenantName: string, ownerName: string) => {
      if(confirm(`⚠️ AÇÃO CRÍTICA DE SEGURANÇA (LOGIN AS)\n\nVocê está prestes a acessar o painel como "${ownerName}".\nEsta ação será registrada nos logs de auditoria.\n\nDeseja continuar?`)) {
          setLoading(true);
          await db.adminImpersonate(tenantId); // Cria Log
          setLoading(false);
          // Em um app real, aqui redirecionaria. No mock, alertamos e atualizamos os logs.
          alert(`[SYSTEM] Contexto alterado para Tenant: ${tenantName}. Redirecionando para /dashboard...`);
          loadGlobalData(); // Recarrega para mostrar o novo log na aba audit
      }
  };

  useEffect(() => {
    loadGlobalData();
  }, []);

  const loadGlobalData = async () => {
    setLoading(true);
    const [kpiData, academies, personals, invs, logs, st] = await Promise.all([
      db.getDashboardKPIs(),
      db.getBackofficeTenants('academy'),
      db.getBackofficeTenants('personal'),
      db.getBackofficeInvoices(),
      db.getBackofficeAuditLogs(),
      db.getAllGlobalStudents()
    ]);
    
    setKpis(kpiData);
    setAcademyTenants(academies);
    setPersonalTenants(personals);
    setInvoices(invs);
    setAuditLogs(logs);
    setAllStudents(st);
    setLoading(false);
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
      <button 
        onClick={() => { setActiveTab(id as any); setSearchTerm(''); }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all font-medium text-xs group ${
            activeTab === id 
            ? 'bg-zinc-800 text-white' 
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
        }`}
      >
          <Icon size={16} className={activeTab === id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} />
          {label}
      </button>
  );

  // --- VIEWS ---

  const DashboardHome = () => {
      if (!kpis) return null;

      return (
          <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white">Visão Geral</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-[#18181b] border border-white/10 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-zinc-500 text-xs font-bold uppercase">MRR</p>
                          <DollarSign size={16} className="text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">R$ {kpis.mrr.toFixed(0)}</h3>
                      <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1"><ArrowUpRight size={10}/> +8%</p>
                  </div>
                  <div className="bg-[#18181b] border border-white/10 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-zinc-500 text-xs font-bold uppercase">Assinantes</p>
                          <Users size={16} className="text-blue-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{kpis.active_subscribers}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">Pagantes ativos</p>
                  </div>
                  <div className="bg-[#18181b] border border-white/10 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-zinc-500 text-xs font-bold uppercase">Trialing</p>
                          <Activity size={16} className="text-yellow-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{kpis.trialing_subscribers}</h3>
                      <p className="text-[10px] text-yellow-500 mt-1 flex items-center gap-1">Conv. pendente</p>
                  </div>
                  <div className="bg-[#18181b] border border-white/10 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-zinc-500 text-xs font-bold uppercase">Churn Rate</p>
                          <AlertTriangle size={16} className="text-red-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{kpis.churn_rate_percent}%</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">Mensal</p>
                  </div>
                  <div className="bg-[#18181b] border border-white/10 p-5 rounded-xl group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                          <BarChart3 size={40} />
                      </div>
                      <div className="flex justify-between items-start mb-2 relative z-10">
                          <p className="text-zinc-500 text-xs font-bold uppercase flex items-center gap-1">
                              LTV <span className="text-[8px] bg-zinc-800 px-1 rounded text-zinc-400 font-normal">Est.</span>
                          </p>
                          <Wallet size={16} className="text-purple-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white relative z-10">R$ {kpis.ltv_estimated.toFixed(0)}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1 relative z-10" title="ARPU / Churn Rate">Lifetime Value</p>
                  </div>
              </div>

              {/* Main Chart */}
              <div className="bg-[#18181b] border border-white/10 p-6 rounded-xl">
                  <h3 className="text-sm font-bold text-white mb-6">Faturamento Realizado (Invoices Paid)</h3>
                  <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={invoices.filter(i => i.status === 'paid').map((t, i) => ({ name: t.paid_at, value: t.amount + (i*150) }))}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#52525b'}} axisLine={false} tickLine={false} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#52525b'}} />
                              <Tooltip contentStyle={{backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px'}} itemStyle={{color: '#fff'}} />
                              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      );
  };

  const TenantsList = ({ type }: { type: 'academy' | 'personal' }) => {
      const data = type === 'academy' ? academyTenants : personalTenants;
      const filtered = data.filter(t => (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.owner_email.toLowerCase().includes(searchTerm.toLowerCase())));

      return (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white capitalize">{type === 'academy' ? 'Academias (B2B)' : 'Personais (Solo)'}</h2>
                  <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
                      <input 
                        className="bg-[#18181b] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-600 w-64"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#18181b]">
                  <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900 text-zinc-500 font-medium uppercase border-b border-white/5">
                          <tr>
                              <th className="p-4">Cliente</th>
                              <th className="p-4">Plano</th>
                              <th className="p-4">Assinatura</th>
                              <th className="p-4">Alunos Ativos</th>
                              <th className="p-4 text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                          {filtered.map(t => {
                              return (
                                  <tr key={t.id} className="hover:bg-zinc-900/50 transition-colors group">
                                      <td className="p-4">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center font-bold text-white border border-white/5" style={{ color: t.primaryColor }}>
                                                  {t.name.charAt(0)}
                                              </div>
                                              <div>
                                                  <p className="font-bold text-white">{t.name}</p>
                                                  <p className="text-zinc-500">{t.owner_email}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-4">
                                          <span className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-[10px] uppercase font-bold text-zinc-400">
                                              {t.plan || 'N/A'}
                                          </span>
                                      </td>
                                      <td className="p-4">
                                          <StatusBadge status={t.subscription_status} />
                                      </td>
                                      <td className="p-4">
                                          <span className="font-bold text-white">{t.active_students_count}</span>
                                      </td>
                                      <td className="p-4 text-right">
                                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => handleImpersonate(t.id, t.name, t.name)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" title="Login As"><Eye size={14} /></button>
                                              <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" title="Configurações"><Settings size={14} /></button>
                                              <button className="p-1.5 hover:bg-red-900/20 rounded-md text-zinc-400 hover:text-red-500 transition-colors" title="Bloquear Acesso" onClick={async () => { if(confirm('Suspender acesso deste cliente?')) { await db.adminToggleTenantStatus(t.id); loadGlobalData(); } }}><Power size={14} /></button>
                                          </div>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  const StudentsGlobalList = () => {
      const filtered = allStudents.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      const handleDelete = async (id: string, type: 'soft' | 'hard') => {
          if (type === 'soft') {
              if (confirm("Arquivar aluno?")) { await db.deleteStudent(id); loadGlobalData(); }
          } else {
              const c = prompt("⚠️ EXCLUSÃO PERMANENTE. Digite DELETE:");
              if (c === 'DELETE') { await db.adminHardDeleteStudent(id); loadGlobalData(); }
          }
      };
      
      // Helper para encontrar tenant name (mock)
      const getTenantName = (id: string) => {
          const t = academyTenants.find(t => t.id === id) || personalTenants.find(t => t.id === id);
          return t ? t.name : 'Unknown';
      };

      return (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Gestão Global de Alunos</h2>
                  <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
                      <input className="bg-[#18181b] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-600 w-64" placeholder="Buscar aluno globalmente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                  </div>
              </div>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#18181b]">
                  <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900 text-zinc-500 font-medium uppercase border-b border-white/5">
                          <tr><th className="p-4">Aluno</th><th className="p-4">Tenant (Origem)</th><th className="p-4">Status</th><th className="p-4 text-right">Ações</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                          {filtered.map(s => {
                              const isDeleted = !!s.deleted_at;
                              const tenantName = getTenantName(s.tenant_id);
                              return (
                                  <tr key={s.id} className={`hover:bg-zinc-900/50 transition-colors group ${isDeleted ? 'opacity-50 grayscale' : ''}`}>
                                      <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white border border-white/5 overflow-hidden">{s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover"/> : s.full_name.charAt(0)}</div><div><p className="font-bold text-white">{s.full_name}</p><p className="text-zinc-500">{s.email}</p></div></div></td>
                                      <td className="p-4"><span className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-[10px] font-bold text-zinc-400 flex items-center gap-1 w-fit">{tenantName}</span></td>
                                      <td className="p-4">{isDeleted ? <span className="text-red-500 font-bold flex items-center gap-1"><Trash2 size={12}/> Arquivado</span> : <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Ativo</span>}</td>
                                      <td className="p-4 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">{!isDeleted && <button onClick={() => handleDelete(s.id, 'soft')} className="p-1.5 hover:bg-yellow-500/10 rounded-md text-zinc-400 hover:text-yellow-500 transition-colors"><Ban size={14} /></button>}<button onClick={() => handleDelete(s.id, 'hard')} className="p-1.5 hover:bg-red-900/20 rounded-md text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></div></td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  const FinanceView = () => (
      <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl font-bold text-white">Invoices Recentes</h2>
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#18181b]">
              <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-500 font-medium uppercase border-b border-white/5">
                      <tr>
                          <th className="p-4">ID</th>
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Data</th>
                          <th className="p-4">Método</th>
                          <th className="p-4">Valor</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Fatura</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                      {invoices.map(tx => (
                          <tr key={tx.id} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="p-4 font-mono text-zinc-500">{tx.id}</td>
                              <td className="p-4 font-bold text-white">{tx.tenant_name}</td>
                              <td className="p-4">{new Date(tx.paid_at).toLocaleDateString()}</td>
                              <td className="p-4 capitalize">{tx.method ? tx.method.replace('_', ' ') : '-'}</td>
                              <td className="p-4 font-mono">R$ {tx.amount.toFixed(2)}</td>
                              <td className="p-4"><StatusBadge status={tx.status} /></td>
                              <td className="p-4 text-right">
                                  <button className="text-blue-400 hover:underline">PDF</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const AuditView = () => {
      const [filterAction, setFilterAction] = useState('ALL');
      const filteredLogs = auditLogs.filter(log => filterAction === 'ALL' || log.action === filterAction);
      const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action))) as string[];

      return (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3">
                    <Shield size={20} className="text-yellow-500 shrink-0" />
                    <div><h3 className="text-sm font-bold text-yellow-500">Logs de Segurança</h3><p className="text-xs text-yellow-200/70 mt-1">Todas as ações administrativas críticas são registradas aqui.</p></div>
                </div>
                <div className="bg-[#18181b] p-4 rounded-xl border border-white/10 flex items-center gap-3">
                    <Filter size={16} className="text-zinc-500" />
                    <div><label className="block text-[10px] font-bold text-zinc-500 uppercase">Filtrar Ação</label><select className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer pr-4" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}><option value="ALL">Todas as Ações</option>{uniqueActions.map(action => (<option key={action} value={action}>{action.toUpperCase()}</option>))}</select></div>
                </div>
            </div>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#18181b]">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 text-zinc-500 font-medium uppercase border-b border-white/5">
                        <tr><th className="p-4">Data/Hora</th><th className="p-4">Ator</th><th className="p-4">Ação</th><th className="p-4">Alvo</th><th className="p-4">IP</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-zinc-900/50 transition-colors">
                                <td className="p-4 font-mono text-zinc-500">{new Date(log.created_at).toLocaleString()}</td>
                                <td className="p-4"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">{log.actor_email.charAt(0).toUpperCase()}</div><span className="truncate max-w-[150px]">{log.actor_email}</span></div></td>
                                <td className="p-4"><span className={`border px-2 py-1 rounded text-[10px] font-mono font-bold ${log.action.includes('suspended') || log.action.includes('delete') ? 'bg-red-500/10 text-red-500 border-red-500/20' : log.action.includes('impersonated') ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>{log.action}</span></td>
                                <td className="p-4 text-zinc-400">{log.target_resource}</td>
                                <td className="p-4 font-mono text-zinc-500">{log.ip_address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      );
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-200 font-sans overflow-hidden selection:bg-zinc-800">
        <aside className="w-64 bg-[#0c0c0e] border-r border-white/5 flex flex-col shrink-0">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]"><Shield size={16} className="text-black fill-current" /></div>
                <div><h1 className="font-bold text-white text-sm tracking-tight">TrainerPro</h1><span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">BACKOFFICE</span></div>
            </div>
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-1"><p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Visão Geral</p><SidebarItem id="dashboard" icon={LayoutGrid} label="Dashboard" /></div>
                <div className="space-y-1"><p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Gestão de Usuários</p><SidebarItem id="academies" icon={Building2} label="Academias (B2B)" /><SidebarItem id="personals" icon={Users} label="Personais" /><SidebarItem id="students" icon={UserCheck} label="Alunos (Global)" /></div>
                <div className="space-y-1"><p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Negócio</p><SidebarItem id="finance" icon={Wallet} label="Financeiro" /><div className="px-3 py-2 text-zinc-600 text-xs flex items-center gap-2 cursor-not-allowed opacity-50"><Package size={16} /> Planos (Em breve)</div></div>
                <div className="space-y-1"><p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Sistema</p><SidebarItem id="audit" icon={FileText} label="Logs de Auditoria" /><div className="px-3 py-2 text-zinc-600 text-xs flex items-center gap-2 cursor-not-allowed opacity-50"><Settings size={16} /> Configurações</div></div>
            </nav>
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4 px-2"><div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold">{user.full_name.charAt(0)}</div><div className="overflow-hidden"><p className="text-xs font-bold text-white truncate">{user.full_name}</p><p className="text-zinc-500 text-[10px] truncate">Super Admin</p></div></div>
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-xs font-medium"><LogOut size={14} /> Sair do Painel</button>
            </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
            <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0c0c0e]">
                <div className="flex items-center gap-2 text-xs text-zinc-500"><Globe size={14} /><span>admin.trainerpro.com</span><ChevronRight size={12} /><span className="text-white capitalize">{activeTab}</span></div>
                <div className="flex items-center gap-4"><button onClick={loadGlobalData} className="p-2 text-zinc-500 hover:text-white transition-colors" title="Atualizar Dados"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button></div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'dashboard' && <DashboardHome />}
                    {activeTab === 'academies' && <TenantsList type="academy" />}
                    {activeTab === 'personals' && <TenantsList type="personal" />}
                    {activeTab === 'students' && <StudentsGlobalList />}
                    {activeTab === 'finance' && <FinanceView />}
                    {activeTab === 'audit' && <AuditView />}
                </div>
            </div>
        </main>
    </div>
  );
};
