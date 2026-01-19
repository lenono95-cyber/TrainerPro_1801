
import React, { useState, useEffect } from 'react';
import { db } from '../services/supabaseService';
import { UserProfile, UserRole } from '../types';
import { ArrowLeft, UserPlus, Mail, Trash2, CheckCircle2, AlertCircle, Loader2, Users, Shield, Copy } from 'lucide-react';

interface AcademyPersonalsManagementScreenProps {
  primaryColor: string;
  onBack: () => void;
}

export const AcademyPersonalsManagementScreen: React.FC<AcademyPersonalsManagementScreenProps> = ({ primaryColor, onBack }) => {
  const [personals, setPersonals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    loadPersonals();
  }, []);

  const loadPersonals = async () => {
    setLoading(true);
    const data = await db.getAcademyPersonalsByTenant();
    setPersonals(data);
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteStatus(null);

    try {
      const result = await db.inviteAcademyPersonal(inviteName, inviteEmail);
      if (result.success) {
        setInviteStatus({ type: 'success', message: 'Convite enviado com sucesso!' });
        setInviteName('');
        setInviteEmail('');
        loadPersonals(); // Refresh list
      } else {
        setInviteStatus({ type: 'error', message: result.error || 'Erro ao enviar convite.' });
      }
    } catch (err) {
      setInviteStatus({ type: 'error', message: 'Erro de conexão.' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId: string, userName: string) => {
      if(confirm(`Tem certeza que deseja remover ${userName} da sua academia? O acesso será revogado imediatamente.`)) {
          // Implementação futura de remoção real
          alert("Funcionalidade de remoção simulada: Usuário removido.");
          // No mock, poderíamos filtrar a lista localmente para dar feedback visual
          setPersonals(prev => prev.filter(p => p.id !== userId));
      }
  };

  return (
    <div className="bg-[#09090b] text-white animate-in fade-in duration-300 min-h-full">
      {/* Header Sticky - Topo relativo ao scroll do Layout pai */}
      <div className="bg-[#18181b] p-4 pt-safe border-b border-white/5 sticky top-0 z-30 flex items-center gap-3 shadow-md">
        <button onClick={onBack} aria-label="Voltar" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft />
        </button>
        <div>
            <h1 className="font-bold text-lg leading-none">Gerenciar Equipe</h1>
            <p className="text-xs text-zinc-500 mt-1">Personais da Academia</p>
        </div>
      </div>

      <div className="p-5 pb-32 space-y-8">
          
          {/* Section: Invite Form */}
          <section>
              <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <UserPlus size={20} />
                  </div>
                  <h2 className="text-lg font-bold">Convidar Novo Personal</h2>
              </div>

              <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5 shadow-lg">
                  <form onSubmit={handleInvite} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Nome Completo</label>
                          <input 
                            type="text"
                            required
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Ex: Ana Souza"
                            value={inviteName}
                            onChange={e => setInviteName(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 ml-1">E-mail Corporativo</label>
                          <div className="relative">
                            <input 
                                type="email"
                                required
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="personal@suaacademia.com"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                            />
                            <Mail size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                          </div>
                      </div>

                      {inviteStatus && (
                          <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${inviteStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {inviteStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                              {inviteStatus.message}
                          </div>
                      )}

                      <button 
                        type="submit"
                        disabled={isInviting}
                        className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                      >
                          {isInviting ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                          {isInviting ? 'Enviando Convite...' : 'Enviar Convite'}
                      </button>
                  </form>
                  <p className="text-[10px] text-zinc-500 mt-3 text-center leading-relaxed">
                      O personal receberá um e-mail com uma senha temporária e instruções para baixar o aplicativo.
                  </p>
              </div>
          </section>

          {/* Section: List */}
          <section>
              <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                      <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                          <Users size={20} />
                      </div>
                      <h2 className="text-lg font-bold">Personais Ativos</h2>
                  </div>
                  <span className="text-xs font-bold bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-400 border border-white/5">
                      {personals.length}
                  </span>
              </div>

              {loading ? (
                  <div className="flex justify-center py-12 text-zinc-500">
                      <Loader2 className="animate-spin" />
                  </div>
              ) : personals.length === 0 ? (
                  <div className="text-center py-12 bg-[#18181b] rounded-3xl border border-dashed border-zinc-800">
                      <Shield size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-zinc-500 text-sm">Nenhum personal cadastrado neste tenant.</p>
                  </div>
              ) : (
                  <div className="bg-[#18181b] border border-white/5 rounded-3xl overflow-hidden shadow-inner bg-zinc-900/10">
                      {/* Container de Rolagem Explicito */}
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                          <div className="flex flex-col gap-2 p-3">
                              {personals.map((personal) => (
                                  <div key={personal.id} className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors shrink-0">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold shrink-0 border border-white/5">
                                              {personal.full_name.charAt(0)}
                                          </div>
                                          <div className="min-w-0">
                                              <h3 className="font-bold text-white text-sm truncate">{personal.full_name}</h3>
                                              <p className="text-xs text-zinc-500 truncate">{personal.email}</p>
                                              
                                              {/* Status Badges */}
                                              <div className="flex gap-2 mt-1.5">
                                                  {personal.must_change_password ? (
                                                      <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 whitespace-nowrap">
                                                          Pendente Acesso
                                                      </span>
                                                  ) : (
                                                      <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1 w-fit">
                                                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Ativo
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                      </div>

                                      <button 
                                        onClick={() => handleRemove(personal.id, personal.full_name)}
                                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        aria-label="Remover personal"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
          </section>
      </div>
    </div>
  );
};
