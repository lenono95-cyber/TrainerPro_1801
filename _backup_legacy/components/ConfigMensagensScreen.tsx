
import React, { useState } from 'react';
import { useConfigMensagens } from '../hooks/useConfigMensagens';
import { AutoMessageConfig } from '../types';
import { replaceVariables, getVariablesDescription } from '../utils/messageUtils';
import { ArrowLeft, Save, RotateCcw, Clock, Calendar, AlertTriangle, Trophy, UserPlus, Info, Loader2 } from 'lucide-react';

interface ConfigMensagensScreenProps {
  primaryColor: string;
  onBack: () => void;
}

export const ConfigMensagensScreen: React.FC<ConfigMensagensScreenProps> = ({ primaryColor, onBack }) => {
  const { config, loading, saving, updateConfigField, saveConfig, restoreDefaults } = useConfigMensagens();
  const [activeSection, setActiveSection] = useState<string>('reminders');

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500">
        <Loader2 className="animate-spin mr-2" /> Carregando configurações...
      </div>
    );
  }

  // Helper para renderizar os botões do menu
  const renderSectionHeader = (id: string, icon: React.ReactNode, title: string) => (
    <button 
        onClick={() => setActiveSection(id)}
        className={`
            group flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 p-1.5 rounded-lg border transition-all relative overflow-hidden flex-shrink-0 min-w-[58px]
            md:w-full md:p-4 md:rounded-2xl md:gap-3
            ${activeSection === id 
            ? 'bg-zinc-800 border-zinc-600 shadow-md' 
            : 'bg-[#18181b] border-white/5 hover:bg-zinc-900'}
        `}
    >
        <div className={`p-1 md:p-2 rounded-md transition-colors ${activeSection === id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} style={{ backgroundColor: activeSection === id ? primaryColor : 'transparent' }}>
            {icon}
        </div>
        <span className={`font-bold text-[9px] md:text-sm text-center md:text-left whitespace-nowrap leading-tight ${activeSection === id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
            {title}
        </span>
    </button>
  );

  const renderToggle = (label: string, field: keyof AutoMessageConfig) => (
      <div className="flex justify-between items-center mb-4">
          <span className="text-white font-medium text-sm md:text-base">{label}</span>
          <button 
            onClick={() => updateConfigField(field, !config[field])}
            aria-label={`Alternar ${label}`}
            aria-pressed={!!config[field]}
            className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${config[field] ? 'bg-green-500' : 'bg-zinc-700'}`}
          >
              <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-md ${config[field] ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
      </div>
  );

  const renderTextArea = (field: keyof AutoMessageConfig, activeField: keyof AutoMessageConfig) => (
      <div className={`transition-all duration-300 ${config[activeField] ? 'opacity-100 max-h-[500px]' : 'opacity-40 max-h-0 overflow-hidden'}`}>
          <textarea 
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 min-h-[80px]"
            value={config[field] as string}
            onChange={(e) => updateConfigField(field, e.target.value)}
            disabled={!config[activeField]}
          />
          {/* Preview */}
          <div className="mt-2 p-3 bg-zinc-900/50 rounded-lg border border-white/5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Prévia:</span>
              <p className="text-xs text-zinc-300 italic break-words">
                  "{replaceVariables(config[field] as string, { 
                      nome: 'João', 
                      horario: '14:00', 
                      dia: 'Segunda', 
                      treino: 'Treino A', 
                      sequencia: 7, 
                      personal: 'Carlos' 
                  })}"
              </p>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#18181b] p-4 pt-safe border-b border-white/5 sticky top-0 z-30 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Voltar" className="p-2 -ml-2 text-zinc-400 hover:text-white">
                <ArrowLeft />
            </button>
            <h1 className="font-bold text-lg">Mensagens Auto</h1>
        </div>
        <button 
            onClick={restoreDefaults}
            className="p-2 text-zinc-500 hover:text-red-400"
            title="Restaurar Padrões"
            aria-label="Restaurar configurações padrão"
        >
            <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Navigation */}
          {/* FIX: Container ainda mais compacto */}
          <div className="w-full md:w-64 bg-[#09090b] border-b md:border-b-0 md:border-r border-white/5 p-1.5 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible flex-nowrap shrink-0 z-10 shadow-sm no-scrollbar items-center md:items-stretch">
             {renderSectionHeader('reminders', <Clock size={14} />, 'Lembretes')}
             {renderSectionHeader('alerts', <AlertTriangle size={14} />, 'Alertas')}
             {renderSectionHeader('assessments', <Calendar size={14} />, 'Avaliações')}
             {renderSectionHeader('motivational', <Trophy size={14} />, 'Motivação')}
             {renderSectionHeader('welcome', <UserPlus size={14} />, 'Boas-vindas')}
             
             {/* Spacer de segurança para o final do scroll */}
             <div className="min-w-[40px] h-1 shrink-0 md:hidden" aria-hidden="true" />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
              
              {/* Variables Legend */}
              <div className="mb-8 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                  <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                      <Info size={16} /> Variáveis Disponíveis
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {getVariablesDescription().map(v => (
                          <span key={v.key} className="text-xs bg-black/40 px-2 py-1 rounded text-zinc-300 border border-white/5 cursor-default hover:bg-black/60 transition-colors" title={v.desc}>
                              {v.key}
                          </span>
                      ))}
                  </div>
              </div>

              {/* REMINDERS SECTION */}
              {activeSection === 'reminders' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      {/* 24h Antes */}
                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Lembrete 24h antes', 'reminder_24h_active')}
                          <div className={`mb-4 transition-all ${config.reminder_24h_active ? 'block' : 'hidden'}`}>
                              <label className="text-xs text-zinc-500 uppercase font-bold block mb-1">Horário de Envio</label>
                              <input 
                                type="time" 
                                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500"
                                value={config.reminder_24h_time}
                                onChange={(e) => updateConfigField('reminder_24h_time', e.target.value)}
                              />
                          </div>
                          {renderTextArea('reminder_24h_text', 'reminder_24h_active')}
                      </div>

                      {/* 2h Antes */}
                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Lembrete 2h antes', 'reminder_2h_active')}
                          {renderTextArea('reminder_2h_text', 'reminder_2h_active')}
                      </div>

                      {/* Na Hora */}
                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Na hora do treino', 'reminder_now_active')}
                          {renderTextArea('reminder_now_text', 'reminder_now_active')}
                      </div>
                  </div>
              )}

              {/* ALERTS SECTION */}
              {activeSection === 'alerts' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Alerta ao Aluno (1h após falta)', 'alert_missed_student_active')}
                          {renderTextArea('alert_missed_student_text', 'alert_missed_student_active')}
                      </div>

                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Alertar Personal (Notificação Push)', 'alert_missed_trainer_active')}
                          <p className="text-xs text-zinc-500 mt-2">Você receberá uma notificação quando um aluno não fizer check-in no horário agendado.</p>
                      </div>

                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5 border-red-500/20">
                          {renderToggle('Alerta Crítico (3 faltas seguidas)', 'alert_missed_critical_active')}
                          {renderTextArea('alert_missed_critical_text', 'alert_missed_critical_active')}
                      </div>
                  </div>
              )}

              {/* ASSESSMENTS SECTION */}
              {activeSection === 'assessments' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Lembrete de Avaliação Física', 'assessment_reminder_active')}
                          <div className={`mb-4 transition-all ${config.assessment_reminder_active ? 'block' : 'hidden'}`}>
                              <label className="text-xs text-zinc-500 uppercase font-bold block mb-1">Frequência</label>
                              <select 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500"
                                value={config.assessment_reminder_days}
                                onChange={(e) => updateConfigField('assessment_reminder_days', parseInt(e.target.value))}
                              >
                                  <option value={15}>A cada 15 dias</option>
                                  <option value={30}>A cada 30 dias</option>
                                  <option value={60}>A cada 60 dias</option>
                                  <option value={90}>A cada 90 dias</option>
                              </select>
                          </div>
                          {renderTextArea('assessment_reminder_text', 'assessment_reminder_active')}
                      </div>

                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Lembrete de Foto de Progresso', 'photo_reminder_active')}
                          <div className={`mb-4 transition-all ${config.photo_reminder_active ? 'block' : 'hidden'}`}>
                              <label className="text-xs text-zinc-500 uppercase font-bold block mb-1">Frequência</label>
                              <select 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500"
                                value={config.photo_reminder_days}
                                onChange={(e) => updateConfigField('photo_reminder_days', parseInt(e.target.value))}
                              >
                                  <option value={15}>A cada 15 dias</option>
                                  <option value={30}>A cada 30 dias</option>
                              </select>
                          </div>
                          {renderTextArea('photo_reminder_text', 'photo_reminder_active')}
                      </div>
                  </div>
              )}

              {/* MOTIVATIONAL SECTION */}
              {activeSection === 'motivational' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Parabéns ao completar treino', 'motivational_workout_active')}
                          {renderTextArea('motivational_workout_text', 'motivational_workout_active')}
                      </div>

                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Sequência de Treinos (Streak)', 'motivational_streak_active')}
                          <div className={`mb-4 transition-all ${config.motivational_streak_active ? 'block' : 'hidden'}`}>
                              <label className="text-xs text-zinc-500 uppercase font-bold block mb-1">Notificar após</label>
                              <select 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500"
                                value={config.motivational_streak_days}
                                onChange={(e) => updateConfigField('motivational_streak_days', parseInt(e.target.value))}
                              >
                                  <option value={3}>3 dias seguidos</option>
                                  <option value={7}>7 dias seguidos</option>
                                  <option value={14}>14 dias seguidos</option>
                                  <option value={30}>30 dias seguidos</option>
                              </select>
                          </div>
                          {renderTextArea('motivational_streak_text', 'motivational_streak_active')}
                      </div>

                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Novo Recorde de Carga', 'motivational_record_active')}
                          {renderTextArea('motivational_record_text', 'motivational_record_active')}
                      </div>
                  </div>
              )}

              {/* WELCOME SECTION */}
              {activeSection === 'welcome' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                          {renderToggle('Mensagem de Boas-vindas', 'welcome_active')}
                          <p className="text-xs text-zinc-500 mb-4">Enviada automaticamente quando você cadastra um novo aluno.</p>
                          {renderTextArea('welcome_text', 'welcome_active')}
                      </div>
                  </div>
              )}

          </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-[#18181b] p-4 border-t border-white/10 sticky bottom-0 flex justify-end z-20">
          <button 
            onClick={saveConfig}
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
      </div>
    </div>
  );
};
