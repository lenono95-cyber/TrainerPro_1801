
import React, { useState, useEffect } from 'react';
import { Exercise, Student, WorkoutRoutine } from '../types';
import { Plus, Trash2, ArrowLeft, Save, Clock, Activity, FileText, Loader2, Video, Upload, Youtube, X } from 'lucide-react';
import { db } from '../services/supabaseService';

interface WorkoutBuilderProps {
  student?: Student; // Opcional: Se não vier, estamos criando um template
  existingWorkout?: WorkoutRoutine; // Para edição
  primaryColor: string;
  onBack: () => void;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ student, existingWorkout, primaryColor, onBack }) => {
  // Estado do cabeçalho
  const [workoutName, setWorkoutName] = useState(existingWorkout?.name || '');
  const [dayOfWeek, setDayOfWeek] = useState(existingWorkout?.day_of_week || 'Segunda-feira');
  const [description, setDescription] = useState(existingWorkout?.description || '');
  
  // Estado dos exercícios
  const [exercises, setExercises] = useState<Partial<Exercise>[]>(
    existingWorkout?.exercises || [
      { id: Date.now().toString(), name: '', sets: 3, reps: '10', weight: 0, rest_seconds: 60, rpe: 7 }
    ]
  );
  
  const [isSaving, setIsSaving] = useState(false);

  // VIDEO MODAL STATE
  const [videoModalExerciseId, setVideoModalExerciseId] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState({ type: 'youtube' as 'youtube' | 'upload', url: '' });
  const [isUploading, setIsUploading] = useState(false);

  const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'Qualquer Dia'];

  const addRow = () => {
    setExercises([...exercises, { 
      id: Date.now().toString() + Math.random(), // Random adicionado para evitar colisão
      name: '', 
      sets: 3, 
      reps: '10', 
      weight: 0, 
      rest_seconds: 60,
      rpe: 7
    }]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const removeRow = (id: string) => {
    if (exercises.length > 1) {
      setExercises(prev => prev.filter(ex => ex.id !== id));
    }
  };

  const handleSave = async () => {
    if (!workoutName) return alert("Por favor, nomeie o treino");
    setIsSaving(true);
    
    // Validar e Sanitizar
    const validExercises = exercises
        .filter(e => e.name?.trim())
        .map(e => ({
            ...e,
            sets: Number(e.sets) || 0,
            weight: Number(e.weight) || 0,
            rest_seconds: Number(e.rest_seconds) || 0,
            rpe: Number(e.rpe) || 0,
            // Reps mantemos como string
        })) as Exercise[];

    if (validExercises.length === 0) {
      setIsSaving(false);
      return alert("Adicione pelo menos um exercício");
    }

    const currentTenant = db.getCurrentTenant();
    
    // CRITICAL FIX: Usar o tenant_id do aluno se disponível para garantir consistência
    const targetTenantId = student?.tenant_id || currentTenant?.id || 'tenant_1';

    const workoutPayload: WorkoutRoutine = {
      id: existingWorkout?.id || `w_${Date.now()}`,
      tenant_id: targetTenantId,
      student_id: student?.id, // undefined se for template
      is_template: !student, // Se não tem aluno, é template
      name: workoutName,
      day_of_week: dayOfWeek,
      description: description,
      exercises: validExercises
    };

    console.log("Saving workout payload:", workoutPayload);

    await db.saveWorkout(workoutPayload);

    // Pequeno delay para garantir que a UI não pisque e o DB mockado atualize
    setTimeout(() => {
        setIsSaving(false);
        onBack();
    }, 500);
  };

  // --- VIDEO HANDLERS ---
  const openVideoModal = (exId: string) => {
      const ex = exercises.find(e => e.id === exId);
      setVideoModalExerciseId(exId);
      setVideoForm({
          type: ex?.video_type || 'youtube',
          url: ex?.video_url || ''
      });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const result = await db.uploadExerciseVideo(file);
      setIsUploading(false);

      if (result.success && result.url) {
          setVideoForm(prev => ({ ...prev, url: result.url! }));
      } else {
          alert(result.error || "Erro no upload");
      }
  };

  const saveVideoToExercise = () => {
      if (!videoModalExerciseId) return;
      
      // Auto convert YouTube links to embed
      let finalUrl = videoForm.url;
      if (videoForm.type === 'youtube' && finalUrl) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = finalUrl.match(regExp);
          if (match && match[2].length === 11) {
              finalUrl = `https://www.youtube.com/embed/${match[2]}`;
          }
      }

      setExercises(prev => prev.map(ex => ex.id === videoModalExerciseId ? { 
          ...ex, 
          video_url: finalUrl,
          video_type: videoForm.type
      } : ex));

      setVideoModalExerciseId(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col animate-in fade-in slide-in-from-right duration-300">
      {/* Cabeçalho Fixo */}
      <div className="bg-[#18181b]/90 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-30 border-b border-white/5">
        <button onClick={onBack} disabled={isSaving} aria-label="Voltar" className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
           <ArrowLeft />
        </button>
        <div className="text-center">
            <h2 className="font-bold text-lg">{student ? 'Atribuir Treino' : 'Editar Template'}</h2>
            <span className="text-xs text-zinc-500">{student ? student.full_name : 'Modelo Geral'}</span>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 rounded-xl text-white font-semibold text-sm disabled:opacity-50 shadow-lg transition-all active:scale-95 flex items-center gap-2"
          style={{ 
             background: primaryColor,
             boxShadow: `0 0 15px ${primaryColor}40`
          }}
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto pb-safe">
        {/* Bloco de Configurações Gerais */}
        <div className="bg-[#18181b] rounded-3xl border border-white/5 p-5 mb-6 space-y-4 shadow-sm">
            {/* Nome do Treino */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">Nome da Ficha</label>
              <input 
                type="text" 
                placeholder="Ex: Treino A - Pernas"
                className="w-full text-lg font-bold bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:bg-zinc-900 transition-all"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>

            {/* Dia da Semana e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">Divisão (Dia)</label>
                    <div className="relative">
                        <select 
                            value={dayOfWeek}
                            onChange={(e) => setDayOfWeek(e.target.value)}
                            className="w-full appearance-none bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1"
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        >
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-zinc-500">
                           <Activity size={14} />
                        </div>
                    </div>
                </div>
                
                <div>
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">Observações</label>
                   <div className="relative">
                        <textarea 
                            rows={1}
                            placeholder="Instruções especiais..."
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 resize-none"
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="absolute right-3 top-3.5 pointer-events-none text-zinc-500">
                           <FileText size={14} />
                        </div>
                   </div>
                </div>
            </div>
        </div>

        {/* Planilha de Exercícios */}
        <h3 className="text-zinc-400 text-sm font-semibold mb-3 ml-1 uppercase tracking-wider">Exercícios</h3>
        <div className="space-y-3">
          {exercises.map((ex, index) => (
            <div key={ex.id} className="bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden shadow-sm relative group animate-in slide-in-from-bottom-2 duration-300">
              
              {/* Linha 1: Nome e Remoção */}
              <div className="flex items-center gap-3 p-3 border-b border-white/5 bg-zinc-900/30">
                 <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                    {index + 1}
                 </div>
                 <input 
                    type="text" 
                    placeholder="Nome do Exercício..."
                    aria-label={`Nome do exercício ${index + 1}`}
                    className="flex-1 bg-transparent font-semibold text-white placeholder-zinc-600 focus:outline-none text-sm"
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id!, 'name', e.target.value)}
                 />
                 
                 {/* Video Button */}
                 <button 
                    onClick={() => openVideoModal(ex.id!)}
                    title="Adicionar Vídeo"
                    className={`p-1.5 rounded-lg transition-colors ${ex.video_url ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                 >
                     <Video size={16} />
                 </button>

                 <button onClick={() => removeRow(ex.id!)} aria-label="Remover exercício" className="text-zinc-600 hover:text-red-500 p-1">
                   <Trash2 size={16} />
                 </button>
              </div>

              {/* Linha 2: Campos Numéricos (Planilha) */}
              <div className="grid grid-cols-5 gap-px bg-zinc-800/50">
                {/* Séries */}
                <div className="bg-[#18181b] p-2 flex flex-col items-center">
                   <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1">Séries</label>
                   <input 
                    type="number" 
                    aria-label="Número de séries"
                    className="w-full bg-transparent text-center font-bold text-white text-sm focus:outline-none p-1 rounded hover:bg-zinc-800 focus:bg-zinc-800 transition-colors"
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.id!, 'sets', e.target.value)} // Mantém string no onChange para UX
                    onBlur={(e) => updateExercise(ex.id!, 'sets', parseInt(e.target.value) || 0)} // Converte no blur
                   />
                </div>
                
                {/* Reps */}
                <div className="bg-[#18181b] p-2 flex flex-col items-center border-l border-white/5">
                   <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1">Reps</label>
                   <input 
                    type="text" 
                    aria-label="Repetições"
                    className="w-full bg-transparent text-center font-bold text-white text-sm focus:outline-none p-1 rounded hover:bg-zinc-800 focus:bg-zinc-800 transition-colors"
                    value={ex.reps}
                    onChange={(e) => updateExercise(ex.id!, 'reps', e.target.value)}
                   />
                </div>

                {/* Carga */}
                <div className="bg-[#18181b] p-2 flex flex-col items-center border-l border-white/5">
                   <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1">Kg</label>
                   <input 
                    type="number" 
                    aria-label="Peso em kg"
                    className="w-full bg-transparent text-center font-bold text-white text-sm focus:outline-none p-1 rounded hover:bg-zinc-800 focus:bg-zinc-800 transition-colors"
                    value={ex.weight}
                    onChange={(e) => updateExercise(ex.id!, 'weight', e.target.value)}
                   />
                </div>

                {/* Descanso */}
                <div className="bg-[#18181b] p-2 flex flex-col items-center border-l border-white/5">
                   <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1"><Clock size={10} className="inline mr-0.5"/>(s)</label>
                   <input 
                    type="number" 
                    aria-label="Descanso em segundos"
                    className="w-full bg-transparent text-center font-bold text-white text-sm focus:outline-none p-1 rounded hover:bg-zinc-800 focus:bg-zinc-800 transition-colors"
                    value={ex.rest_seconds}
                    onChange={(e) => updateExercise(ex.id!, 'rest_seconds', e.target.value)}
                   />
                </div>

                {/* RPE */}
                <div className="bg-[#18181b] p-2 flex flex-col items-center border-l border-white/5 relative">
                   <div 
                     className="absolute inset-0 opacity-10 pointer-events-none"
                     style={{ backgroundColor: (ex.rpe || 0) > 8 ? 'red' : (ex.rpe || 0) > 6 ? 'yellow' : 'transparent' }}
                   />
                   <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1">RPE</label>
                   <input 
                    type="number" 
                    max={10}
                    aria-label="RPE (Percepção Subjetiva de Esforço)"
                    className="w-full bg-transparent text-center font-bold text-white text-sm focus:outline-none p-1 rounded hover:bg-zinc-800 focus:bg-zinc-800 transition-colors"
                    value={ex.rpe}
                    onChange={(e) => updateExercise(ex.id!, 'rpe', e.target.value)}
                   />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addRow}
          className="w-full mt-6 py-4 border border-dashed border-zinc-700 rounded-2xl text-zinc-400 font-medium flex items-center justify-center space-x-2 hover:bg-zinc-900 hover:text-white hover:border-zinc-500 transition-all active:scale-[0.99]"
        >
          <Plus size={20} />
          <span>Nova Linha</span>
        </button>
        
        {/* Espaçamento inferior */}
        <div className="h-20" />
      </div>

      {/* --- VIDEO CONFIG MODAL --- */}
      {videoModalExerciseId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#18181b] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Vídeo do Exercício</h3>
                      <button onClick={() => setVideoModalExerciseId(null)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-zinc-900 p-1 rounded-xl mb-6">
                      <button 
                        onClick={() => setVideoForm(prev => ({ ...prev, type: 'youtube' }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${videoForm.type === 'youtube' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}
                      >
                          <Youtube size={16} /> Link YouTube
                      </button>
                      <button 
                        onClick={() => setVideoForm(prev => ({ ...prev, type: 'upload' }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${videoForm.type === 'upload' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}
                      >
                          <Upload size={16} /> Upload
                      </button>
                  </div>

                  <div className="space-y-4">
                      {videoForm.type === 'youtube' ? (
                          <div>
                              <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">URL do Vídeo</label>
                              <input 
                                  type="url" 
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                                  placeholder="https://youtube.com/watch?v=..."
                                  value={videoForm.url}
                                  onChange={(e) => setVideoForm({...videoForm, url: e.target.value})}
                              />
                              <p className="text-[10px] text-zinc-500 mt-2">O link será convertido automaticamente para formato embed.</p>
                          </div>
                      ) : (
                          <div className="bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-2xl p-6 text-center">
                              {videoForm.url ? (
                                  <div className="space-y-3">
                                      <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                          <Video size={24} />
                                      </div>
                                      <p className="text-xs text-green-400 font-bold">Vídeo Carregado!</p>
                                      <button onClick={() => setVideoForm({...videoForm, url: ''})} className="text-[10px] text-zinc-500 underline">Remover</button>
                                  </div>
                              ) : (
                                  <>
                                      {isUploading ? (
                                          <div className="flex flex-col items-center text-zinc-500">
                                              <Loader2 className="animate-spin mb-2" />
                                              <span className="text-xs">Enviando...</span>
                                          </div>
                                      ) : (
                                          <label className="cursor-pointer block">
                                              <Upload size={32} className="text-zinc-600 mx-auto mb-3" />
                                              <p className="text-sm text-zinc-400 font-bold">Toque para Upload</p>
                                              <p className="text-[10px] text-zinc-600 mt-1">MP4, MOV (Max 100MB)</p>
                                              <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                                          </label>
                                      )}
                                  </>
                              )}
                          </div>
                      )}

                      <button 
                          onClick={saveVideoToExercise}
                          className="w-full py-4 rounded-xl font-bold text-black mt-2 active:scale-[0.98] transition-all"
                          style={{ backgroundColor: primaryColor }}
                      >
                          Confirmar Vídeo
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
