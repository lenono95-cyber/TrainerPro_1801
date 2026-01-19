
import React, { useState } from 'react';
import { db } from '../services/supabaseService';
import { UserProfile } from '../types';
import { User, Building2, ChevronLeft, Loader2, Eye, EyeOff, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

interface RegistrationScreenProps {
  onSuccess: (user: UserProfile) => void;
  onGoToLogin: () => void;
  initialType?: 'personal' | 'academy'; // Nova prop
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onSuccess, onGoToLogin, initialType = 'personal' }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: initialType // Usa a prop para inicializar
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password Validation Logic (Reused)
  const requirements = [
      { label: 'Mínimo 8 caracteres', met: formData.password.length >= 8 },
      { label: 'Letras maiúsculas e minúsculas', met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
      { label: 'Números ou símbolos', met: /[0-9]/.test(formData.password) || /[^A-Za-z0-9]/.test(formData.password) },
  ];
  const allRequirementsMet = requirements.every(r => r.met);

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

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      // Validation
      if (!formData.name || !formData.email || !formData.password) {
          setError('Preencha todos os campos obrigatórios.');
          return;
      }
      if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem.');
          return;
      }
      if (!allRequirementsMet) {
          setError('Sua senha não atende aos requisitos de segurança.');
          return;
      }
      if (!acceptedTerms) {
          setError('Você deve aceitar os Termos de Uso.');
          return;
      }

      setLoading(true);
      try {
          const { user, error } = await db.register({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              type: formData.type
          });

          if (user) {
              onSuccess(user);
          } else {
              setError(error || 'Erro ao criar conta.');
          }
      } catch (err) {
          setError('Ocorreu um erro inesperado. Tente novamente.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right duration-300 w-full max-w-sm">
        <button 
            onClick={onGoToLogin}
            className="flex items-center text-zinc-400 text-sm hover:text-white mb-6 transition-colors focus:outline-none focus:underline"
            aria-label="Voltar para a tela de login"
        >
            <ChevronLeft size={16} className="mr-1" /> Voltar para Login
        </button>

        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Criar Minha Conta</h1>
            <p className="text-zinc-500 text-sm">Comece sua jornada profissional no TrainerPro.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6" role="radiogroup" aria-label="Tipo de Conta">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'personal'})}
                    aria-checked={formData.type === 'personal'}
                    role="radio"
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.type === 'personal' 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                    }`}
                >
                    <User size={24} aria-hidden="true" />
                    <span className="text-xs font-bold">Sou Personal</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'academy'})}
                    aria-checked={formData.type === 'academy'}
                    role="radio"
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        formData.type === 'academy' 
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                    }`}
                >
                    <Building2 size={24} aria-hidden="true" />
                    <span className="text-xs font-bold">Sou Academia</span>
                </button>
            </div>

            {/* Inputs */}
            <div>
                <label htmlFor="name" className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Nome Completo</label>
                <input 
                    id="name"
                    type="text"
                    required
                    className="w-full bg-[#18181b] border border-zinc-800 focus:border-white/20 rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all"
                    placeholder={formData.type === 'personal' ? "Ex: Carlos Silva" : "Ex: Academia Iron Pump"}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>

            <div>
                <label htmlFor="email" className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 ml-1">E-mail</label>
                <input 
                    id="email"
                    type="email"
                    required
                    className="w-full bg-[#18181b] border border-zinc-800 focus:border-white/20 rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>

            <div className="relative">
                <label htmlFor="password" className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Senha</label>
                <input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-[#18181b] border border-zinc-800 focus:border-white/20 rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all pr-10"
                    placeholder="Crie uma senha forte"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
                <div className="space-y-2 bg-zinc-900/50 p-3 rounded-xl border border-white/5" role="status" aria-live="polite">
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={strengthScore} aria-valuemin={0} aria-valuemax={100} aria-label="Força da senha">
                        <div 
                            className={`h-full transition-all duration-300 ${getStrengthColor(strengthScore)}`} 
                            style={{ width: `${strengthScore}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                        {requirements.map((req, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {req.met ? (
                                    <CheckCircle2 size={10} className="text-green-500" aria-hidden="true" />
                                ) : (
                                    <Circle size={10} className="text-zinc-600" aria-hidden="true" />
                                )}
                                <span className={`text-[10px] ${req.met ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                    {req.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 ml-1">Confirmar Senha</label>
                <input 
                    id="confirmPassword"
                    type="password"
                    required
                    className={`w-full bg-[#18181b] border rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 outline-none transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white/20'}`}
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        id="terms"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-700 bg-zinc-900 transition-all checked:border-blue-500 checked:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        checked={acceptedTerms}
                        onChange={e => setAcceptedTerms(e.target.checked)}
                    />
                    <CheckCircle2 size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" aria-hidden="true" />
                </div>
                <label htmlFor="terms" className="text-xs text-zinc-400 cursor-pointer select-none">
                    Li e concordo com os <a href="#" onClick={e => e.preventDefault()} className="text-white hover:underline">Termos de Uso</a> e <a href="#" onClick={e => e.preventDefault()} className="text-white hover:underline">Política de Privacidade</a>.
                </label>
            </div>

            {error && (
                <div role="alert" className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex gap-2 items-center text-red-400 text-xs">
                    <AlertTriangle size={16} aria-hidden="true" />
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-white/10 mt-4 disabled:opacity-50 disabled:grayscale"
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                        <span>Criando conta...</span>
                    </>
                ) : (
                    <span>Criar Minha Conta</span>
                )}
            </button>
        </form>
    </div>
  );
};
