
import React, { useState } from 'react';
import { db } from '../services/supabaseService';
import { UserProfile } from '../types';
import { Lock, X, Check, Loader2, Key, ShieldAlert, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isForced?: boolean; // Se true, remove opção de fechar (fluxo de 1º acesso)
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, user, isForced = false, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }

    if (!allRequirementsMet) {
        setError('A senha não atende aos requisitos de segurança.');
        return;
    }

    setLoading(true);
    try {
      const result = await db.changePassword(user.id, currentPassword, newPassword);
      if (result.success) {
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onSuccess();
        if (!isForced) onClose();
      } else {
        setError(result.error || 'Erro ao alterar senha.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal_title"
        className="bg-[#18181b] w-full max-w-md rounded-[2rem] p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 id="modal_title" className="text-xl font-bold text-white flex items-center gap-2">
              {isForced ? <ShieldAlert className="text-yellow-500" /> : <Lock className="text-blue-500" />}
              {isForced ? 'Alteração Obrigatória' : 'Alterar Senha'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {isForced 
                ? 'Para sua segurança, você deve definir uma nova senha no primeiro acesso.' 
                : 'Atualize sua credencial de acesso.'}
            </p>
          </div>
          {!isForced && (
            <button onClick={onClose} aria-label="Fechar modal" className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="current_pass" className="text-xs font-bold text-zinc-500 uppercase block mb-2">Senha Atual</label>
            <div className="relative">
              <input 
                id="current_pass"
                type="password"
                required
                aria-required="true"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <Key size={16} className="absolute left-3 top-3.5 text-zinc-500" aria-hidden="true" />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <label htmlFor="new_pass" className="text-xs font-bold text-zinc-500 uppercase block mb-2">Nova Senha</label>
            <input 
              id="new_pass"
              type="password"
              required
              aria-required="true"
              minLength={8}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors mb-2"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            
            {/* Strength Meter & Checklist */}
            <div className="mb-4 space-y-3">
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
            
            <input 
              type="password"
              required
              aria-required="true"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors mt-2"
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center font-medium animate-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !allRequirementsMet}
            className={`w-full py-4 mt-2 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:grayscale ${isForced ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            {loading ? 'Validando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};
