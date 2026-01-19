
import React, { useState, useEffect } from 'react';
import { db } from '../services/supabaseService';
import { Dumbbell, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2, Check, Circle, ArrowRight } from 'lucide-react';

interface ActivationScreenProps {
  token: string;
  onSuccess: () => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({ token, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validação de Senha
  const requirements = [
      { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
      { label: 'Letra maiúscula', met: /[A-Z]/.test(password) },
      { label: 'Letra minúscula', met: /[a-z]/.test(password) },
      { label: 'Número', met: /[0-9]/.test(password) },
  ];
  const allMet = requirements.every(r => r.met);

  const handleActivate = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          return;
      }
      if (!allMet) {
          setError('A senha não atende aos requisitos de segurança.');
          return;
      }

      setLoading(true);
      try {
          const result = await db.activateAccount(token, password);
          
          if (result.success) {
              setSuccess(true);
              setTimeout(() => {
                  onSuccess(); // Redireciona para login
              }, 3000);
          } else {
              setError(result.error || 'Falha na ativação. O link pode ter expirado.');
          }
      } catch (err) {
          setError('Erro de conexão. Tente novamente.');
      } finally {
          setLoading(false);
      }
  };

  if (success) {
      return (
          <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 animate-in fade-in duration-500">
              <div className="bg-[#18181b] p-8 rounded-3xl border border-green-500/20 text-center max-w-sm w-full shadow-2xl">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                      <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Conta Ativada!</h2>
                  <p className="text-zinc-400 text-sm mb-6">Seu cadastro foi concluído com sucesso. Você será redirecionado para o login.</p>
                  <button onClick={onSuccess} className="text-green-500 font-bold hover:underline">
                      Ir para Login agora
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[40%] bg-blue-600 rounded-full blur-[150px] opacity-10 pointer-events-none" />
        
        <div className="w-full max-w-sm z-10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <Dumbbell size={32} className="text-white" />
                </div>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Ativar sua Conta</h1>
                <p className="text-zinc-500 text-sm">Defina sua senha para acessar o TrainerPro.</p>
            </div>

            <form onSubmit={handleActivate} className="space-y-5">
                {/* Password Field */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nova Senha</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            className="w-full bg-[#18181b] border border-zinc-800 focus:border-blue-500 rounded-2xl py-4 pl-4 pr-12 text-white placeholder-zinc-600 outline-none transition-all"
                            placeholder="Sua senha segura"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Confirmar Senha</label>
                    <input 
                        type="password"
                        className={`w-full bg-[#18181b] border rounded-2xl py-4 px-4 text-white placeholder-zinc-600 outline-none transition-all ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-blue-500'}`}
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                {/* Requirements Checklist */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 space-y-2">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Requisitos da Senha</p>
                    {requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            {req.met ? (
                                <CheckCircle2 size={14} className="text-green-500" />
                            ) : (
                                <Circle size={14} className="text-zinc-600" />
                            )}
                            <span className={`text-xs ${req.met ? 'text-zinc-300' : 'text-zinc-500'}`}>{req.label}</span>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs" role="alert">
                        <AlertTriangle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !allMet || !confirmPassword}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:grayscale"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                    {loading ? 'Ativando...' : 'Ativar Conta'}
                </button>
            </form>
        </div>
    </div>
  );
};
