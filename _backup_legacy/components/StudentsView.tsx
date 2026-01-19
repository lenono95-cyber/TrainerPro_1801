
import React, { useEffect, useState } from 'react';
import { db } from '../services/supabaseService';
import { Student, UserProfile } from '../types';
import { Search, ChevronRight, UserPlus, AlertCircle, Bell, X, Check, Loader2, CreditCard, Mail, User, Calendar, Ruler, Activity, Target, Layers } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

interface StudentsViewProps {
  user: UserProfile;
  primaryColor: string;
  onSelectStudent: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ user, primaryColor, onSelectStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Invite/Create Modal State
  const [isRegistering, setIsRegistering] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Initial Form State
  const initialFormState = {
      full_name: '',
      email: '',
      cpf: '',
      age: '',
      gender: 'M',
      weight: '',
      height: '',
      goal: 'Hipertrofia',
      level: 'Iniciante',
      skipValidation: false
  };
  const [regForm, setRegForm] = useState(initialFormState);

  useEffect(() => {
    loadStudents();
  }, []); 

  const loadStudents = async () => {
    setLoading(true);
    const data = await db.getStudents();
    setStudents(data);
    setLoading(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError('');
      setInviteSuccess(false);

      // Basic Validation
      if (!regForm.full_name.trim()) return setFormError('Nome é obrigatório.');
      if (!regForm.email.trim()) return setFormError('E-mail é obrigatório.');
      if (!regForm.age || Number(regForm.age) <= 0) return setFormError('Idade inválida.');
      
      setInviteLoading(true);

      try {
          // Chama o backend para criar o registro E enviar o convite
          const result = await db.inviteStudent({
              full_name: regForm.full_name,
              email: regForm.email,
              cpf: regForm.cpf,
              age: Number(regForm.age),
              gender: regForm.gender as 'M' | 'F',
              weight: Number(regForm.weight),
              height: Number(regForm.height),
              goal: regForm.goal as any,
              level: regForm.level as any
          });

          if (result.success) {
              setInviteSuccess(true);
              await loadStudents();
              setTimeout(() => {
                  setInviteSuccess(false);
                  setIsRegistering(false);
                  setRegForm(initialFormState);
              }, 2500);
          } else {
              setFormError(result.error || 'Erro ao criar conta.');
          }
      } catch (err) {
          setFormError('Erro de conexão.');
      } finally {
          setInviteLoading(false);
      }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <div className="p-5 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-start mt-2">
        <div className="flex-1 min-w-0 pr-4">
           <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Bem-vindo de volta,</p>
           <h1 className="text-2xl sm:text-3xl font-bold text-white mt-0.5 leading-tight truncate" title={user.full_name}>
             {user.full_name}
           </h1>
           <div className="flex items-center gap-2 mt-1.5 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs text-zinc-500 font-medium">Gestão de Alunos</p>
           </div>
        </div>
        <div className="flex gap-3 shrink-0">
             <button 
                onClick={() => setShowNotifications(true)}
                className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 active:scale-95 transition-transform hover:bg-zinc-700"
            >
                <Bell size={24} className="text-white" />
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 hover:brightness-110"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 8px 20px -6px ${primaryColor}80` 
              }}
            >
              <UserPlus size={24} />
            </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-zinc-500 group-focus-within:text-white transition-colors" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar atleta..." 
          className="w-full pl-12 pr-4 py-4 bg-[#18181b] border border-white/5 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all shadow-sm"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4 pb-20">
        <h2 className="text-lg font-semibold text-zinc-300">Lista de Alunos</h2>
        
        {loading ? (
           <div className="flex justify-center py-10 text-zinc-500 animate-pulse">Carregando dados...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-10 text-zinc-600">Nenhum aluno encontrado.</div>
        ) : (
          filteredStudents.map(student => (
            <div 
              key={student.id} 
              onClick={() => onSelectStudent(student)}
              className="group bg-[#18181b] hover:bg-[#27272a] p-4 rounded-3xl border border-white/5 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="flex items-center space-x-4 z-10">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner relative"
                  style={{ 
                    backgroundColor: `${primaryColor}20`, 
                    color: primaryColor,
                    border: `1px solid ${primaryColor}40`
                  }}
                >
                  {student.full_name.charAt(0)}
                  {student.enrollment_status === 'pending_activation' && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-[#18181b]" title="Pendente de Ativação"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-white/90">{student.full_name}</h3>
                  <div className="flex items-center text-xs text-zinc-400 space-x-2 mt-1">
                    {student.enrollment_status === 'pending_activation' ? (
                        <span className="text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <Mail size={10} /> Convite Enviado
                        </span>
                    ) : (
                        <span className="bg-zinc-800/80 border border-white/5 px-2.5 py-1 rounded-lg">{student.goal}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ChevronRight className="text-zinc-500 group-hover:text-white" size={20} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    
    {/* Full Create Student Modal */}
    {isRegistering && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#121214] w-full max-w-lg sm:rounded-3xl rounded-t-[2rem] p-6 border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#121214] z-10 py-2 border-b border-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-white">Criar Conta Cliente</h3>
                        <p className="text-xs text-zinc-500">Cadastro de novo aluno</p>
                    </div>
                    <button onClick={() => setIsRegistering(false)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                {inviteSuccess ? (
                    <div className="text-center py-12 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                            <Check size={40} />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">Conta Criada!</h4>
                        <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                            O aluno foi cadastrado e um e-mail de convite foi enviado para <strong>{regForm.email}</strong>.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleCreateStudent} className="space-y-5">
                        
                        {/* Nome */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Nome Completo *</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="Ex: Maria Silva"
                                    value={regForm.full_name}
                                    onChange={e => setRegForm({...regForm, full_name: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Email (Login) *</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                <input 
                                    required
                                    type="email" 
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="aluno@email.com"
                                    value={regForm.email}
                                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* CPF */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">CPF do Cliente</label>
                            <div className="relative mb-2">
                                <CreditCard size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                <input 
                                    type="text" 
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder="000.000.000-00"
                                    value={regForm.cpf}
                                    onChange={e => setRegForm({...regForm, cpf: e.target.value})}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <div 
                                    className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center ${regForm.skipValidation ? 'bg-red-500 border-red-500' : 'border-zinc-600'}`}
                                    onClick={() => setRegForm({...regForm, skipValidation: !regForm.skipValidation})}
                                >
                                    {regForm.skipValidation && <Check size={12} className="text-white" />}
                                </div>
                                <span className="text-xs text-zinc-400">Pular validação por enquanto</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Idade */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Idade</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                    <input 
                                        type="number"
                                        required 
                                        className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500"
                                        placeholder="Anos"
                                        value={regForm.age}
                                        onChange={e => setRegForm({...regForm, age: e.target.value})}
                                    />
                                </div>
                            </div>
                            {/* Gênero */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Gênero</label>
                                <select 
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 appearance-none"
                                    value={regForm.gender}
                                    onChange={e => setRegForm({...regForm, gender: e.target.value})}
                                >
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Peso */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Peso (Kg)</label>
                                <input 
                                    type="number"
                                    placeholder="kg"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                                    value={regForm.weight}
                                    onChange={e => setRegForm({...regForm, weight: e.target.value})}
                                />
                            </div>
                            {/* Altura */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Altura (cm)</label>
                                <input 
                                    type="number"
                                    placeholder="cm"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                                    value={regForm.height}
                                    onChange={e => setRegForm({...regForm, height: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Objetivo */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Objetivo</label>
                                <div className="relative">
                                    <Target size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                    <select 
                                        className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500 appearance-none text-sm"
                                        value={regForm.goal}
                                        onChange={e => setRegForm({...regForm, goal: e.target.value})}
                                    >
                                        <option value="Hipertrofia">Hipertrofia</option>
                                        <option value="Emagrecimento">Emagrecimento</option>
                                        <option value="Força">Força</option>
                                        <option value="Resistência">Resistência</option>
                                    </select>
                                </div>
                            </div>
                            {/* Nível */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Nível</label>
                                <div className="relative">
                                    <Layers size={18} className="absolute left-3 top-3.5 text-zinc-500" />
                                    <select 
                                        className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500 appearance-none text-sm"
                                        value={regForm.level}
                                        onChange={e => setRegForm({...regForm, level: e.target.value})}
                                    >
                                        <option value="Iniciante">Iniciante</option>
                                        <option value="Intermediário">Intermediário</option>
                                        <option value="Avançado">Avançado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {formError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs animate-in slide-in-from-bottom-2">
                                <AlertCircle size={16} />
                                {formError}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={inviteLoading}
                            className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 bg-[#ef4444] hover:bg-red-600 shadow-red-900/20"
                        >
                            {inviteLoading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                            {inviteLoading ? 'Criando...' : 'CRIAR CONTA CLIENTE'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )}

    <NotificationCenter 
        user={user} 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        primaryColor={primaryColor}
    />
    </>
  );
};
