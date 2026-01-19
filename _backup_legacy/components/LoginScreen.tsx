
import React, { useState } from 'react';
import { Dumbbell, ArrowRight, Lock, Mail, ChevronLeft, Send, CheckCircle2, Loader2, Key, AlertTriangle, Check, Circle, Shield } from 'lucide-react';
import { db } from '../services/supabaseService';
import { UserProfile } from '../types';
import { RegistrationScreen } from './RegistrationScreen';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // Navigation State
  // 'login': Tela Principal
  // 'forgot': Tela de Solicitar E-mail
  // 'resetting': Tela de Nova Senha (Simulando clique no link)
  // 'register': Tela de Cadastro
  const [view, setView] = useState<'login' | 'forgot' | 'resetting' | 'register'>('login');
  
  // Registration Type State
  const [registerType, setRegisterType] = useState<'personal' | 'academy'>('personal');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // New Password State (Reset Flow)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingLoading, setResettingLoading] = useState(false);
  const [resettingError, setResettingError] = useState('');
  const [passwordChangedSuccess, setPasswordChangedSuccess] = useState(false);

  // Password Requirements Logic
  const requirements = [
      { label: 'Mínimo 8 caracteres', met: newPassword.length >= 8 },
      { label: 'Letras maiúsculas e minúsculas', met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
      { label: 'Números ou símbolos', met: /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const allRequirementsMet = requirements.every(r => r.met);

  // Calculate Score for Bar
  const calculateStrengthScore = () => {
      let score = 0;
      if (requirements[0].met) score += 40;
      if (requirements[1].met) score += 30;
      if (requirements[2].met) score += 30;
      return score;
  };
  
  const strengthScore = calculateStrengthScore();

  const getStrengthColor = (score: number) => {
      if (score < 50) return 'bg-red-500';
      if (score < 80) return 'bg-yellow-500';
      return 'bg-green-500';
  };

  const getStrengthLabel = (score: number) => {
      if (score === 0) return '';
      if (score < 50) return 'Fraca';
      if (score < 80) return 'Média';
      return 'Forte';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user, error } = await db.login(email);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError(error || 'Falha no login');
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!resetEmail) return;
      setResetLoading(true);
      
      try {
          const result = await db.resetPassword(resetEmail);
          setResetSuccess(true);
          // Armazenar token apenas para DEMO
          if (result.token) setGeneratedToken(result.token);
      } finally {
          setResetLoading(false);
      }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!generatedToken) return;
      
      if (newPassword !== confirmPassword) {
          setResettingError('As senhas não coincidem.');
          return;
      }
      if (!allRequirementsMet) {
          setResettingError('A senha não atende aos requisitos.');
          return;
      }

      setResettingLoading(true);
      setResettingError('');

      try {
          const result = await db.completePasswordReset(generatedToken, newPassword);
          if (result.success) {
              setPasswordChangedSuccess(true);
              setTimeout(() => {
                  setView('login');
                  setResetSuccess(false);
                  setPasswordChangedSuccess(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('Senha redefinida com sucesso! Faça login.');
              }, 2000);
          } else {
              setResettingError(result.error || 'Erro ao redefinir senha.');
          }
      } finally {
          setResettingLoading(false);
      }
  };

  // Helper para preencher rapidamente
  const fillCredentials = (type: 'trainer' | 'student' | 'admin') => {
    if (type === 'trainer') setEmail('personal@ironpump.com');
    if (type === 'student') setEmail('joao@email.com');
    if (type === 'admin') setEmail('rodrigo@trainerpro.app');
    setPassword('12345678');
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-[#ef4444] rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-[#ef4444] rounded-full blur-[120px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-sm z-10 transition-all duration-300 flex flex-col items-center">
        {view !== 'register' && (
            <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ef4444] to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/20">
                <Dumbbell size={40} className="text-white" />
            </div>
            </div>
        )}

        {/* --- REGISTER VIEW --- */}
        {view === 'register' && (
            <RegistrationScreen 
                onSuccess={onLoginSuccess}
                onGoToLogin={() => setView('login')}
                initialType={registerType}
            />
        )}

        {/* --- LOGIN VIEW --- */}
        {view === 'login' && (
            <div className="animate-in fade-in slide-in-from-left-8 duration-300 w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">TrainerPro</h1>
                    <p className="text-zinc-500 text-sm">Plataforma de gestão para Personal Trainers e Academias.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={18} className="text-zinc-500" />
                            </div>
                            <input
                                type="email"
                                required
                                aria-label="Endereço de e-mail"
                                placeholder="Seu e-mail de acesso"
                                className="w-full bg-[#18181b] border border-zinc-800 focus:border-[#ef4444] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={18} className="text-zinc-500" />
                            </div>
                            <input
                                type="password"
                                aria-label="Senha"
                                placeholder="Sua senha"
                                className="w-full bg-[#18181b] border border-zinc-800 focus:border-[#ef4444] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            type="button"
                            onClick={() => setView('forgot')}
                            className="text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                            Esqueci minha senha
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center flex items-center justify-center gap-2" role="alert">
                            {error.includes('sucesso') ? <CheckCircle2 size={16} className="text-green-500"/> : <AlertTriangle size={16}/>}
                            <span className={error.includes('sucesso') ? 'text-green-400' : 'text-red-400'}>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-white/10"
                    >
                        {loading ? (
                            <span className="opacity-50">Entrando...</span>
                        ) : (
                            <>
                                <span>Acessar Plataforma</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* --- REGISTER BUTTONS --- */}
                <div className="mt-8 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => { setRegisterType('personal'); setView('register'); }}
                            className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-300 font-bold text-xs hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all shadow-sm"
                        >
                            Criar conta Personal
                        </button>
                        <button 
                            onClick={() => { setRegisterType('academy'); setView('register'); }}
                            className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-300 font-bold text-xs hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all shadow-sm"
                        >
                            Criar conta Academia
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-zinc-600 uppercase font-medium tracking-wide">
                        Alunos acessam gratuitamente por convite
                    </p>
                </div>

                <div className="mt-10 space-y-3">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#09090b] px-2 text-zinc-600">Simulação Rápida</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => fillCredentials('trainer')}
                            className="py-3 px-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-[10px] hover:text-white hover:border-zinc-700 transition-colors"
                        >
                            Sou Personal
                        </button>
                        <button
                            type="button"
                            onClick={() => fillCredentials('student')}
                            className="py-3 px-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-[10px] hover:text-white hover:border-zinc-700 transition-colors"
                        >
                            Sou Aluno
                        </button>
                        <button
                            type="button"
                            onClick={() => fillCredentials('admin')}
                            className="py-3 px-2 bg-zinc-900 border border-zinc-800 rounded-xl text-yellow-500/80 text-[10px] font-bold hover:text-yellow-400 hover:border-yellow-500/30 transition-colors flex items-center justify-center gap-1"
                        >
                            <Shield size={12} />
                            Sou Admin
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- FORGOT PASSWORD VIEW --- */}
        {view === 'forgot' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300 w-full">
                <button 
                    onClick={() => {
                        setView('login');
                        setResetSuccess(false);
                        setResetEmail('');
                    }}
                    className="flex items-center text-zinc-400 text-sm hover:text-white mb-6"
                >
                    <ChevronLeft size={16} className="mr-1" /> Voltar
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h2>
                    <p className="text-zinc-500 text-sm">
                        Informe seu e-mail para receber um link de redefinição de senha.
                    </p>
                </div>

                {resetSuccess ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl text-center animate-in zoom-in duration-300" role="status">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-green-500">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="text-white font-bold mb-1">E-mail Enviado!</h3>
                        <p className="text-xs text-zinc-400 mb-6">
                            Verifique sua caixa de entrada (e spam) para redefinir sua senha. O link expira em 1 hora.
                        </p>
                        
                        {/* DEMO FEATURE: Simulate Clicking the Link */}
                        <button 
                            onClick={() => setView('resetting')}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 mb-3"
                        >
                            <Key size={16} /> Simular: Clicar no Link
                        </button>

                        <button 
                            onClick={() => setView('login')}
                            className="text-green-400 text-xs font-bold hover:underline"
                        >
                            Voltar para o Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={18} className="text-zinc-500" />
                            </div>
                            <input
                                type="email"
                                required
                                aria-label="E-mail de recuperação"
                                placeholder="Digite seu e-mail"
                                className="w-full bg-[#18181b] border border-zinc-800 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 outline-none transition-all"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={resetLoading || !resetEmail}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:grayscale"
                        >
                            {resetLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Enviar Link</span>
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        )}

        {/* --- RESETTING PASSWORD VIEW (SIMULATED LINK CLICK) --- */}
        {view === 'resetting' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300 w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Redefinir Senha</h2>
                    <p className="text-zinc-500 text-sm">Crie uma nova senha forte para sua conta.</p>
                </div>

                <form onSubmit={handleCompleteReset} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Nova Senha</label>
                        <div className="relative">
                            <input 
                                type="password"
                                required
                                aria-required="true"
                                aria-label="Nova senha"
                                minLength={8}
                                className="w-full bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-2xl py-4 px-4 text-white placeholder-zinc-600 outline-none transition-all"
                                placeholder="Mínimo 8 caracteres"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        
                        {/* Strength Meter & Requirements */}
                        <div className="mt-3 mb-2 space-y-3">
                            {/* Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500">Força da Senha</span>
                                    <span className={`text-[10px] font-bold ${strengthScore < 50 ? 'text-red-400' : strengthScore < 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {getStrengthLabel(strengthScore)}
                                    </span>
                                </div>
                                <div 
                                    role="progressbar" 
                                    aria-valuenow={strengthScore} 
                                    aria-valuemin={0} 
                                    aria-valuemax={100}
                                    aria-label="Indicador de força da senha"
                                    className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden"
                                >
                                    <div 
                                        className={`h-full transition-all duration-300 ${getStrengthColor(strengthScore)}`} 
                                        style={{ width: `${strengthScore}%` }}
                                    />
                                </div>
                            </div>

                            {/* Checklist */}
                            <div className="grid grid-cols-1 gap-1">
                                {requirements.map((req, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        {req.met ? (
                                            <CheckCircle2 size={12} className="text-green-500" />
                                        ) : (
                                            <Circle size={12} className="text-zinc-600" />
                                        )}
                                        <span className={`text-[10px] ${req.met ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Confirmar Senha</label>
                        <input 
                            type="password"
                            required
                            aria-required="true"
                            aria-label="Confirmar nova senha"
                            className="w-full bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-2xl py-4 px-4 text-white placeholder-zinc-600 outline-none transition-all"
                            placeholder="Repita a senha"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {resettingError && (
                        <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center">
                            {resettingError}
                        </div>
                    )}

                    {passwordChangedSuccess && (
                        <div role="status" className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-xl text-center flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> Sucesso! Redirecionando...
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={resettingLoading || passwordChangedSuccess || !allRequirementsMet}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:grayscale"
                    >
                        {resettingLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Salvando...</span>
                            </>
                        ) : (
                            <>
                                <span>Definir Nova Senha</span>
                                <CheckCircle2 size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        )}

      </div>
    </div>
  );
};
