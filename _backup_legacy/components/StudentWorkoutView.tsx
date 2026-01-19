
import React, { useState, useEffect } from 'react';
import { WorkoutRoutine, Student, Exercise } from '../types';
import { db } from '../services/supabaseService';
import { Play, Clock, CheckCircle2, ArrowLeft, Calendar, BarChart2, Dumbbell, ChevronDown, ChevronUp, Trophy, Loader2, WifiOff, AlertTriangle, X, RefreshCw, PlayCircle, ChevronLeft } from 'lucide-react';

interface StudentWorkoutViewProps {
  student: Student;
  primaryColor: string;
}

export const StudentWorkoutView: React.FC<StudentWorkoutViewProps> = ({ student, primaryColor }) => {
  const [workouts, setWorkouts] = useState<WorkoutRoutine[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Active Session State
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  
  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Video Player State
  const [videoPlayerUrl, setVideoPlayerUrl] = useState<string | null>(null);
  const [videoPlayerType, setVideoPlayerType] = useState<'upload' | 'youtube'>('youtube');

  useEffect(() => {
    loadWorkouts();
  }, [student]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadWorkouts = async () => {
    setLoading(true);
    const data = await db.getWorkouts(student.id);
    setWorkouts(data);
    setLoading(false);
  };

  const startWorkout = (workout: WorkoutRoutine) => {
    setActiveWorkout(workout);
    setIsTimerRunning(true);
    setTimer(0);
    setCompletedSets({});
    setFinished(false);
    setSavedOffline(false);
    setSaveError(false);
    // Expand first exercise by default
    if (workout.exercises.length > 0) {
        setExpandedExercise(workout.exercises[0].id!);
    }
  };

  const toggleSet = (exerciseId: string, setIndex: number) => {
    const key = `${exerciseId}-${setIndex}`;
    setCompletedSets(prev => ({
        ...prev,
        [key]: !prev[key]
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const finishWorkout = async () => {
      if (!activeWorkout) return;
      
      setIsTimerRunning(false);
      setIsSaving(true);
      setSaveError(false);
      
      // Preparar Payload do Log
      const exercisesDone = activeWorkout.exercises.map(ex => {
         let setsDone = 0;
         for(let i=0; i<ex.sets; i++) {
             if (completedSets[`${ex.id}-${i}`]) setsDone++;
         }
         return {
             name: ex.name,
             sets_done: setsDone,
             weight_used: ex.weight,
             difficulty: 'Normal' as const // Simplificado
         };
      }).filter(ex => ex.sets_done > 0);

      const logPayload = {
          student_id: student.id,
          workout_name: activeWorkout.name,
          date: new Date().toISOString().split('T')[0],
          duration_minutes: Math.ceil(timer / 60),
          calories_burned: Math.ceil(timer / 60 * 6), // Estimativa simples
          rating: 5 as any,
          exercises_done: exercisesDone
      };

      // Tentar salvar com Retry automático do Service
      const result = await db.saveWorkoutLog(logPayload);
      
      setIsSaving(false);
      if (result.success) {
          if (result.offline) setSavedOffline(true);
          setFinished(true);
      } else {
          setSaveError(true);
      }
  };

  const exitWorkout = () => {
      setActiveWorkout(null);
      setFinished(false);
      setIsTimerRunning(false);
  };

  const openVideo = (e: React.MouseEvent, url: string, type: 'upload' | 'youtube' = 'youtube') => {
      e.stopPropagation();
      setVideoPlayerUrl(url);
      setVideoPlayerType(type);
  };

  // --- TELA DE SUCESSO ---
  if (finished) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in zoom-in duration-300">
              <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  <Trophy size={48} className="text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Treino Concluído!</h2>
              <p className="text-zinc-400 mb-8">Parabéns! Você completou {activeWorkout?.name} em {formatTime(timer)}.</p>
              
              {savedOffline && (
                  <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 flex items-center gap-3 mb-6 max-w-sm">
                      <WifiOff className="text-zinc-400" size={24} />
                      <div className="text-left">
                          <p className="text-white font-bold text-sm">Salvo Offline</p>
                          <p className="text-xs text-zinc-400">Sem conexão. O treino foi salvo no dispositivo e será enviado quando houver internet.</p>
                      </div>
                  </div>
              )}

              <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 w-full mb-8">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <span className="text-xs text-zinc-500 uppercase font-bold">Duração</span>
                          <p className="text-2xl font-bold text-white">{formatTime(timer)}</p>
                      </div>
                      <div>
                          <span className="text-xs text-zinc-500 uppercase font-bold">Volume</span>
                          <p className="text-2xl font-bold text-white text-emerald-400">Excelente</p>
                      </div>
                  </div>
              </div>

              <button 
                onClick={exitWorkout}
                className="w-full py-4 rounded-2xl font-bold text-black active:scale-95 transition-transform"
                style={{ backgroundColor: primaryColor }}
              >
                  Voltar para Lista
              </button>
          </div>
      );
  }

  // --- MODO FOCO (EM EXECUÇÃO) ---
  if (activeWorkout) {
    return (
      <div className="fixed inset-0 bg-[#09090b] z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header Active */}
        <div className="bg-[#18181b] p-4 pt-safe border-b border-white/5 shadow-lg z-10">
            <div className="flex items-center justify-between mb-2">
                <button 
                    onClick={() => { if(!isSaving && confirm("Sair do treino sem salvar?")) exitWorkout() }} 
                    className="p-2 -ml-2 text-zinc-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    disabled={isSaving}
                    aria-label="Voltar e Sair"
                >
                    <ChevronLeft size={28} />
                </button>
                <div className="bg-black/40 px-4 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    <Clock size={14} className={isTimerRunning ? "text-red-500 animate-pulse" : "text-zinc-500"} />
                    <span className="font-mono font-bold text-white tracking-widest">{formatTime(timer)}</span>
                </div>
                <div className="w-8" /> 
            </div>
            <h2 className="text-xl font-bold text-white text-center">{activeWorkout.name}</h2>
            <p className="text-xs text-zinc-500 text-center mt-1">{activeWorkout.exercises.length} exercícios</p>
        </div>

        {/* Exercises List */}
        <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-4">
            {activeWorkout.exercises.map((ex, idx) => {
                const isExpanded = expandedExercise === ex.id;
                
                return (
                    <div key={ex.id} className={`bg-[#18181b] rounded-3xl border transition-all duration-300 ${isExpanded ? 'border-white/20 ring-1 ring-white/10' : 'border-white/5'}`}>
                        {/* Exercise Header */}
                        <button 
                            onClick={() => setExpandedExercise(isExpanded ? null : ex.id!)}
                            className="w-full text-left p-5 flex justify-between items-center cursor-pointer focus:outline-none focus:bg-white/5 rounded-t-3xl"
                            aria-expanded={isExpanded}
                            aria-label={`${ex.name}. ${ex.sets} séries de ${ex.reps} repetições. Toque para ${isExpanded ? 'colapsar' : 'expandir'}.`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isExpanded ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold text-lg ${isExpanded ? 'text-white' : 'text-zinc-400'}`}>{ex.name}</h3>
                                        {/* VIDEO INDICATOR */}
                                        {ex.video_url && (
                                            <div 
                                                onClick={(e) => openVideo(e, ex.video_url!, ex.video_type)}
                                                className="bg-blue-500/20 text-blue-400 p-1 rounded-full hover:bg-blue-500 hover:text-white transition-colors animate-pulse"
                                            >
                                                <PlayCircle size={16} />
                                            </div>
                                        )}
                                    </div>
                                    {!isExpanded && (
                                        <p className="text-xs text-zinc-600 mt-0.5">{ex.sets} séries • {ex.reps} reps</p>
                                    )}
                                </div>
                            </div>
                            {isExpanded ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-600" />}
                        </button>

                        {/* Exercise Details (Expanded) */}
                        {isExpanded && (
                            <div className="px-5 pb-5 animate-in slide-in-from-top-2">
                                {/* Action Buttons */}
                                {ex.video_url && (
                                    <button 
                                        onClick={(e) => openVideo(e, ex.video_url!, ex.video_type)}
                                        className="w-full mb-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                    >
                                        <PlayCircle size={18} fill="currentColor" /> Ver Demonstração
                                    </button>
                                )}

                                {/* Info Chips */}
                                <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar">
                                    <div className="bg-zinc-900/50 px-3 py-2 rounded-xl border border-white/5 min-w-[80px]">
                                        <span className="text-[10px] text-zinc-500 uppercase block">Carga</span>
                                        <span className="text-white font-bold">{ex.weight}kg</span>
                                    </div>
                                    <div className="bg-zinc-900/50 px-3 py-2 rounded-xl border border-white/5 min-w-[80px]">
                                        <span className="text-[10px] text-zinc-500 uppercase block">Descanso</span>
                                        <span className="text-white font-bold">{ex.rest_seconds}s</span>
                                    </div>
                                    <div className="bg-zinc-900/50 px-3 py-2 rounded-xl border border-white/5 min-w-[80px]">
                                        <span className="text-[10px] text-zinc-500 uppercase block">RPE</span>
                                        <span className="text-white font-bold">{ex.rpe || '-'}</span>
                                    </div>
                                    {ex.notes && (
                                        <div className="bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20 whitespace-nowrap">
                                            <span className="text-[10px] text-blue-300 uppercase block">Nota</span>
                                            <span className="text-blue-100 font-medium text-xs">{ex.notes}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Sets Checklist */}
                                <div className="space-y-2">
                                    {Array.from({ length: ex.sets }).map((_, setIdx) => {
                                        const isDone = completedSets[`${ex.id}-${setIdx}`];
                                        return (
                                            <button 
                                                key={setIdx}
                                                onClick={() => toggleSet(ex.id!, setIdx)}
                                                aria-label={`Marcar série ${setIdx + 1} como ${isDone ? 'não concluída' : 'concluída'}`}
                                                className={`w-full p-3 rounded-xl flex items-center justify-between border transition-all ${
                                                    isDone 
                                                    ? 'bg-green-500/10 border-green-500/20' 
                                                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                                                        isDone ? 'bg-green-500 border-green-500 text-black' : 'bg-transparent border-zinc-600 text-zinc-500'
                                                    }`}>
                                                        {setIdx + 1}
                                                    </div>
                                                    <span className={`text-sm font-medium ${isDone ? 'text-green-400' : 'text-zinc-300'}`}>
                                                        {ex.reps} reps
                                                    </span>
                                                </div>
                                                {isDone && <CheckCircle2 size={18} className="text-green-500" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#18181b] border-t border-white/10 p-5 pb-safe space-y-3">
            {saveError && (
                <div 
                    role="alert"
                    className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in slide-in-from-bottom-2"
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <span>Erro ao salvar. Verifique sua conexão.</span>
                    </div>
                    <button onClick={() => setSaveError(false)} aria-label="Fechar alerta" className="p-1 hover:bg-red-500/20 rounded-lg"><X size={14} /></button>
                </div>
            )}
            
            <button 
                onClick={finishWorkout}
                disabled={isSaving}
                className="w-full py-4 rounded-2xl font-bold text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale"
                style={{ backgroundColor: primaryColor }}
            >
                {isSaving ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Sincronizando...
                    </>
                ) : saveError ? (
                    <>
                        <RefreshCw size={20} />
                        Tentar Novamente
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={20} />
                        Finalizar Treino
                    </>
                )}
            </button>
        </div>

        {/* --- VIDEO PLAYER MODAL --- */}
        {videoPlayerUrl && (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-center animate-in fade-in duration-300">
                <button 
                    onClick={() => setVideoPlayerUrl(null)}
                    className="absolute top-safe right-4 z-20 p-2 bg-black/50 text-white rounded-full backdrop-blur-md mt-4"
                >
                    <X size={24} />
                </button>
                
                <div className="w-full aspect-video bg-black relative">
                    {videoPlayerType === 'youtube' ? (
                        <iframe 
                            src={videoPlayerUrl}
                            className="w-full h-full"
                            title="Exercise Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video 
                            src={videoPlayerUrl}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
                
                <div className="p-6 text-center">
                    <h3 className="text-white font-bold text-lg mb-2">Demonstração</h3>
                    <p className="text-zinc-500 text-sm">Observe a técnica correta antes de executar.</p>
                </div>
            </div>
        )}
      </div>
    );
  }

  // --- MODO LISTA (PADRÃO) ---
  return (
    <div className="p-5 pb-24 space-y-6">
      <header className="mt-2 mb-2">
        <h1 className="text-3xl font-bold text-white">Treinos</h1>
        <p className="text-zinc-400 text-sm mt-1">Selecione uma ficha para iniciar.</p>
      </header>

      {/* Stats Resumo */}
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-1 rounded-3xl border border-white/5">
         <div className="bg-[#18181b] p-5 rounded-[1.3rem] flex items-center justify-around">
            <div className="text-center">
                <span className="block text-2xl font-bold text-white">{workouts.length}</span>
                <span className="text-xs text-zinc-500 uppercase font-bold">Fichas</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
                <span className="block text-2xl font-bold text-white">12</span>
                <span className="text-xs text-zinc-500 uppercase font-bold">Concluídos</span>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-zinc-500">Carregando treinos...</div>
      ) : workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600 bg-[#18181b] rounded-3xl border border-dashed border-zinc-800">
           <Dumbbell size={48} className="mb-4 opacity-20" />
           <p className="text-center max-w-[200px]">Seu personal ainda não cadastrou treinos para você.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map(workout => (
             <div 
                key={workout.id} 
                className="bg-[#18181b] rounded-3xl border border-white/5 overflow-hidden group active:scale-[0.98] transition-all"
             >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span 
                                className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-black mb-2"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {workout.day_of_week}
                            </span>
                            <h3 className="text-xl font-bold text-white">{workout.name}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:text-black transition-colors">
                            <Dumbbell size={20} />
                        </div>
                    </div>
                    
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-6 h-10">
                        {workout.description || "Sem observações adicionais para este treino."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-xs text-zinc-500 font-medium">{workout.exercises.length} exercícios</span>
                        <button 
                            onClick={() => startWorkout(workout)}
                            className="flex items-center gap-2 text-sm font-bold text-white hover:underline decoration-2 underline-offset-4"
                            style={{ textDecorationColor: primaryColor }}
                        >
                            <Play size={14} fill="currentColor" /> INICIAR
                        </button>
                    </div>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};
