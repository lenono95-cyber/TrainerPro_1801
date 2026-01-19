
import React, { useState, useEffect } from 'react';
import { Student, WorkoutLog, Assessment, ProgressPhoto } from '../types';
import { db } from '../services/supabaseService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeft, Calendar, Dumbbell, Ruler, Camera, Star, Activity, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Scale, X, Upload, Check, Loader2, Trash2, Info, MessageSquare, FileText } from 'lucide-react';
import { PhysicalAssessmentDetail } from './PhysicalAssessmentDetail';

interface StudentEvolutionProps {
  student: Student;
  primaryColor: string;
  onBack?: () => void;
  isTrainer?: boolean; // Se for visualização do personal, pode ter ações extras
}

export const StudentEvolution: React.FC<StudentEvolutionProps> = ({ student, primaryColor, onBack, isTrainer = false }) => {
  const [activeTab, setActiveTab] = useState<'workouts' | 'loads' | 'measures' | 'photos' | 'assessments'>('workouts');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Evolution State
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [uniqueExercises, setUniqueExercises] = useState<string[]>([]);

  // Assessment Viewer State
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Photo Upload State
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
      url: '',
      date: new Date().toISOString().split('T')[0],
      weight: '',
      notes: ''
  });

  // Photo Viewer State
  const [viewPhoto, setViewPhoto] = useState<ProgressPhoto | null>(null);

  useEffect(() => {
    loadData();
  }, [student.id]);

  const loadData = async () => {
    setLoading(true);
    const [logsData, assData, photosData] = await Promise.all([
        db.getWorkoutLogs(student.id),
        db.getAssessments(student.id),
        db.getProgressPhotos(student.id)
    ]);
    
    setLogs(logsData);
    setAssessments(assData); // Já vem ordenado por data (antigo -> novo) do service
    setPhotos(photosData);
    
    // Atualiza peso padrão do form de foto
    setNewPhoto(prev => ({ ...prev, weight: student.weight.toString() }));

    // Extrair exercícios únicos para o dropdown
    const exercises = new Set<string>();
    logsData.forEach(log => {
        log.exercises_done.forEach(ex => exercises.add(ex.name));
    });
    const exerciseList = Array.from(exercises);
    setUniqueExercises(exerciseList);
    if(exerciseList.length > 0) setSelectedExercise(exerciseList[0]);

    setLoading(false);
  };

  const handleSavePhoto = async () => {
      if (!newPhoto.url) return alert("Selecione uma imagem");
      setIsSavingPhoto(true);

      await db.addProgressPhoto({
          student_id: student.id,
          date: newPhoto.date,
          url: newPhoto.url,
          weight_at_time: Number(newPhoto.weight),
          notes: newPhoto.notes
      });

      // Recarrega lista
      const photosData = await db.getProgressPhotos(student.id);
      setPhotos(photosData);
      
      setIsSavingPhoto(false);
      setIsAddingPhoto(false);
      // Reset parcial
      setNewPhoto(prev => ({ ...prev, url: '', notes: '' }));
  };

  const handleDeletePhoto = async (photoId: string) => {
      if (!confirm("Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.")) return;
      
      // Otimista: remove da UI antes (ou loading state local, aqui apenas reload)
      await db.deleteProgressPhoto(photoId);
      
      // Recarrega lista
      const photosData = await db.getProgressPhotos(student.id);
      setPhotos(photosData);
      
      // Se a foto deletada estiver aberta no viewer, fecha
      if (viewPhoto?.id === photoId) setViewPhoto(null);
  };

  const simulateImageSelection = () => {
      // Simula seleção de arquivo pegando uma imagem aleatória
      const randomId = Math.floor(Math.random() * 100);
      setNewPhoto(prev => ({
          ...prev,
          url: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&rand=${randomId}`
      }));
  };

  const getExerciseChartData = () => {
      if(!selectedExercise) return [];
      const data: any[] = [];
      // Percorrer logs do mais antigo pro mais novo
      [...logs].reverse().forEach(log => {
          const ex = log.exercises_done.find(e => e.name === selectedExercise);
          if(ex) {
              data.push({
                  date: new Date(log.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
                  weight: ex.weight_used
              });
          }
      });
      return data;
  };

  const getWeightChartData = () => {
      return assessments.map(a => ({
          date: new Date(a.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
          weight: a.weight,
          fat: a.body_fat_percentage
      }));
  };

  // Helper para renderizar estrelas
  const renderStars = (count: number) => (
      <div className="flex text-yellow-500">
          {Array.from({length: 5}).map((_, i) => (
              <Star key={i} size={12} fill={i < count ? "currentColor" : "none"} className={i < count ? "" : "text-zinc-700"} />
          ))}
      </div>
  );

  // --- RENDERIZAR DETALHES DA AVALIAÇÃO ---
  if (selectedAssessment) {
      // Encontrar avaliação anterior para comparação
      // Assessments vem ordenado antigo -> novo.
      const idx = assessments.findIndex(a => a.id === selectedAssessment.id);
      const prev = idx > 0 ? assessments[idx - 1] : undefined;

      return (
          <PhysicalAssessmentDetail 
            assessment={selectedAssessment}
            student={student}
            previousAssessment={prev}
            primaryColor={primaryColor}
            onBack={() => setSelectedAssessment(null)}
          />
      );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
        {/* Header Fixo */}
        <div className="bg-[#18181b] pt-6 pb-4 px-4 border-b border-white/5 sticky top-0 z-30">
            <div className="flex items-center gap-3 mb-4">
                {onBack && (
                    <button onClick={onBack} aria-label="Voltar" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h2 className="text-xl font-bold text-white leading-none">Minha Evolução</h2>
                    <p className="text-xs text-zinc-500 mt-1">{student.full_name}</p>
                </div>
            </div>

            {/* Tabs com Scroll Horizontal Edge-to-Edge */}
            {/* FIX: Usar pl-4 e um elemento spacer final para garantir que o último item não seja cortado */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 pl-4 pr-0">
                <button 
                    onClick={() => setActiveTab('workouts')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'workouts' ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-transparent text-zinc-500 border-zinc-800'}`}
                >
                    Treinos
                </button>
                <button 
                    onClick={() => setActiveTab('assessments')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'assessments' ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-transparent text-zinc-500 border-zinc-800'}`}
                >
                    Avaliações
                </button>
                <button 
                    onClick={() => setActiveTab('measures')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'measures' ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-transparent text-zinc-500 border-zinc-800'}`}
                >
                    Gráficos
                </button>
                <button 
                    onClick={() => setActiveTab('loads')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'loads' ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-transparent text-zinc-500 border-zinc-800'}`}
                >
                    Cargas
                </button>
                <button 
                    onClick={() => setActiveTab('photos')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTab === 'photos' ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-transparent text-zinc-500 border-zinc-800'}`}
                >
                    Fotos
                </button>
                {/* Spacer explícito para padding direito no scroll */}
                <div className="w-6 flex-shrink-0"></div>
            </div>
        </div>

        <div className="p-5 pb-24 space-y-6">
            
            {/* TAB: WORKOUTS */}
            {activeTab === 'workouts' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                            <span className="text-xs text-zinc-500 uppercase font-bold">Total Treinos</span>
                            <p className="text-2xl font-bold text-white mt-1">{logs.length}</p>
                        </div>
                        <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                            <span className="text-xs text-zinc-500 uppercase font-bold">Média Classif.</span>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-2xl font-bold text-white">
                                    {(logs.reduce((acc, curr) => acc + curr.rating, 0) / (logs.length || 1)).toFixed(1)}
                                </span>
                                <Star size={16} fill="currentColor" className="text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-400 mt-2 uppercase tracking-wide">Histórico Recente</h3>
                    
                    {logs.length === 0 ? (
                        <div className="text-center py-10 text-zinc-600">Nenhum treino registrado.</div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="bg-[#18181b] p-5 rounded-3xl border border-white/5 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded uppercase">Concluído</span>
                                            <span className="text-xs text-zinc-500">{new Date(log.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <h4 className="font-bold text-white text-lg">{log.workout_name}</h4>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {renderStars(log.rating)}
                                        <span className="text-xs text-zinc-500 mt-1">{log.duration_minutes} min</span>
                                    </div>
                                </div>
                                
                                {log.feedback && (
                                    <div className="bg-zinc-900/50 p-3 rounded-xl mb-4 border border-white/5">
                                        <p className="text-sm text-zinc-300 italic">"{log.feedback}"</p>
                                    </div>
                                )}

                                <div className="space-y-2 border-t border-white/5 pt-3">
                                    {log.exercises_done.slice(0, 3).map((ex, idx) => (
                                        <div key={idx} className="flex justify-between text-xs">
                                            <span className="text-zinc-400">{ex.name}</span>
                                            <span className="text-zinc-200 font-mono">{ex.sets_done} séries • {ex.weight_used}kg</span>
                                        </div>
                                    ))}
                                    {log.exercises_done.length > 3 && (
                                        <div className="text-center text-[10px] text-zinc-600 pt-1">Ver mais {log.exercises_done.length - 3} exercícios</div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB: ASSESSMENTS (NOVA) */}
            {activeTab === 'assessments' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                        <Info size={20} className="text-blue-400 mt-0.5" />
                        <div>
                            <h4 className="text-white font-bold text-sm">Histórico de Avaliações</h4>
                            <p className="text-zinc-400 text-xs mt-1">Toque em uma avaliação para ver todos os detalhes, medidas, fotos e gráficos comparativos.</p>
                        </div>
                    </div>

                    {assessments.length === 0 ? (
                        <div className="text-center py-10 text-zinc-500">
                            Nenhuma avaliação física registrada ainda.
                        </div>
                    ) : (
                        // Inverter para mostrar a mais recente primeiro
                        [...assessments].reverse().map((ass) => (
                            <div 
                                key={ass.id}
                                onClick={() => setSelectedAssessment(ass)}
                                className="bg-[#18181b] p-5 rounded-3xl border border-white/5 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group hover:bg-[#27272a]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-zinc-800 p-3 rounded-2xl text-zinc-400 group-hover:text-white transition-colors" style={{ color: primaryColor }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wide">
                                            {new Date(ass.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'})}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-white font-bold">{ass.weight}kg</span>
                                            <span className="text-xs text-zinc-600">•</span>
                                            <span className="text-zinc-400 text-sm">{ass.body_fat_percentage ? `${ass.body_fat_percentage}% BF` : 'BF N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     {/* Chip IMC */}
                                     <span className="text-[10px] font-bold bg-zinc-900 px-2 py-1 rounded text-zinc-500">
                                         IMC {ass.bmi}
                                     </span>
                                     <ChevronRight size={18} className="text-zinc-600" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB: LOADS */}
            {activeTab === 'loads' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                        <div className="mb-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Exercício</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none appearance-none"
                                    value={selectedExercise}
                                    onChange={(e) => setSelectedExercise(e.target.value)}
                                >
                                    {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-zinc-500 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {selectedExercise && getExerciseChartData().length > 0 ? (
                            <>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-xs text-zinc-500 uppercase">Carga Atual</span>
                                        <p className="text-2xl font-bold text-white">
                                            {getExerciseChartData()[getExerciseChartData().length - 1].weight}kg
                                        </p>
                                    </div>
                                    {getExerciseChartData().length > 1 && (
                                        <div className="flex items-center gap-1 text-green-500 text-sm font-bold bg-green-500/10 px-2 py-1 rounded-lg">
                                            <TrendingUp size={14} />
                                            <span>
                                                +{Math.round(((getExerciseChartData()[getExerciseChartData().length - 1].weight - getExerciseChartData()[0].weight) / getExerciseChartData()[0].weight) * 100)}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={getExerciseChartData()}>
                                            <defs>
                                                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                            <XAxis dataKey="date" tick={{fontSize: 10, fill: '#52525b'}} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px'}}
                                                itemStyle={{color: '#fff'}}
                                            />
                                            <Area type="monotone" dataKey="weight" stroke={primaryColor} fillOpacity={1} fill="url(#colorLoad)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-zinc-500 py-10">Selecione um exercício para ver o gráfico.</div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: MEASURES */}
            {activeTab === 'measures' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {/* Weight Chart */}
                    <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Scale size={18} className="text-zinc-400" /> Peso Corporal
                        </h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getWeightChartData()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#52525b'}} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px'}} itemStyle={{color: '#fff'}} />
                                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{r: 4, fill: '#18181b', strokeWidth: 2}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed Stats Short Summary */}
                    {assessments.length > 0 && (
                        <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5">
                            <h3 className="font-bold text-white mb-4">Resumo da Última Avaliação</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-zinc-400">Peso</span>
                                    <span className="text-white font-bold">{assessments[assessments.length-1].weight} kg</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-zinc-400">Gordura (BF)</span>
                                    <span className="text-white font-bold">{assessments[assessments.length-1].body_fat_percentage || '-'} %</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-zinc-400">Peitoral</span>
                                    <span className="text-white font-bold">{assessments[assessments.length-1].chest_cm || '-'} cm</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-zinc-400">Braço (D)</span>
                                    <span className="text-white font-bold">{assessments[assessments.length-1].arm_right_cm || '-'} cm</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setActiveTab('assessments');
                                    // Opcional: abrir direto a última
                                    setSelectedAssessment(assessments[assessments.length-1]);
                                }}
                                className="w-full mt-4 py-3 bg-zinc-800 rounded-xl text-sm font-bold text-white hover:bg-zinc-700 transition-colors"
                            >
                                Ver Detalhes Completos
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: PHOTOS */}
            {activeTab === 'photos' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {/* Comparison Hero */}
                    {photos.length >= 2 && (
                        <div className="bg-[#18181b] p-1 rounded-3xl border border-white/5">
                            <div className="flex items-center justify-center p-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Comparativo</div>
                            <div className="grid grid-cols-2 gap-px bg-zinc-800 rounded-2xl overflow-hidden">
                                {/* First Photo */}
                                <div 
                                    className="relative aspect-[3/4] cursor-pointer group"
                                    onClick={() => setViewPhoto(photos[0])}
                                >
                                    <img src={photos[0].url} alt="Foto antes" className="absolute inset-0 w-full h-full object-cover" />
                                    
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePhoto(photos[0].id);
                                        }}
                                        aria-label="Deletar foto"
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 p-1.5 rounded-full text-white transition-colors backdrop-blur-sm z-20"
                                    >
                                        <Trash2 size={12} />
                                    </button>

                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center">
                                        <span className="text-xs text-white font-bold">Antes</span>
                                        <span className="block text-[10px] text-zinc-300">{new Date(photos[0].date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                {/* Last Photo */}
                                <div 
                                    className="relative aspect-[3/4] cursor-pointer group"
                                    onClick={() => setViewPhoto(photos[photos.length-1])}
                                >
                                    <img src={photos[photos.length-1].url} alt="Foto depois" className="absolute inset-0 w-full h-full object-cover" />
                                    
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePhoto(photos[photos.length-1].id);
                                        }}
                                        aria-label="Deletar foto"
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 p-1.5 rounded-full text-white transition-colors backdrop-blur-sm z-20"
                                    >
                                        <Trash2 size={12} />
                                    </button>

                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center">
                                        <span className="text-xs text-white font-bold">Depois</span>
                                        <span className="block text-[10px] text-zinc-300">{new Date(photos[photos.length-1].date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {photos.map(photo => (
                            <div 
                                key={photo.id} 
                                onClick={() => setViewPhoto(photo)}
                                className="aspect-square rounded-xl overflow-hidden relative border border-white/10 group cursor-pointer active:scale-95 transition-transform"
                            >
                                <img src={photo.url} alt={`Foto de progresso de ${new Date(photo.date).toLocaleDateString()}`} className="w-full h-full object-cover" />
                                <div className="absolute bottom-1 right-1 bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white">
                                    {new Date(photo.date).toLocaleDateString('pt-BR', {month:'short', year:'2-digit'})}
                                </div>
                                
                                {/* Badge de Nota mais visível */}
                                {photo.notes && (
                                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-white flex items-center gap-1 shadow-lg">
                                        <MessageSquare size={10} className="fill-white/20" />
                                        <span className="text-[9px] font-bold">Ver nota</span>
                                    </div>
                                )}
                                
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePhoto(photo.id);
                                    }}
                                    aria-label="Deletar foto"
                                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-500/80 p-1.5 rounded-full text-white transition-colors backdrop-blur-sm z-10"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => setIsAddingPhoto(true)}
                            className="aspect-square rounded-xl bg-zinc-900 border border-zinc-700 border-dashed flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors active:scale-95"
                        >
                            <Camera size={24} className="mb-1" />
                            <span className="text-[10px]">Adicionar</span>
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* MODAL: ADD PHOTO */}
        {isAddingPhoto && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#18181b] w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Nova Foto</h3>
                        <button onClick={() => setIsAddingPhoto(false)} aria-label="Fechar" className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Layout Compacto: Foto e Inputs Lado a Lado */}
                    <div className="flex gap-4 mb-4">
                        {/* Area de Upload (Quadrada e Compacta) */}
                        <div className="w-32 h-32 bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-700 overflow-hidden relative flex items-center justify-center group shrink-0">
                            {newPhoto.url ? (
                                <>
                                    <img src={newPhoto.url} alt="Pré-visualização" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={simulateImageSelection}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity text-xs text-center p-2"
                                    >
                                        Trocar
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={simulateImageSelection}
                                    className="flex flex-col items-center text-zinc-500 hover:text-white transition-colors p-2 text-center"
                                >
                                    <Upload size={24} className="mb-1" />
                                    <span className="text-[10px] leading-tight">Toque para selecionar</span>
                                </button>
                            )}
                        </div>

                        {/* Inputs Lado Direito */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5">Data</label>
                                <input 
                                    type="date"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                                    value={newPhoto.date}
                                    onChange={(e) => setNewPhoto({...newPhoto, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5">Peso (kg)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                                    placeholder="00.0"
                                    value={newPhoto.weight}
                                    onChange={(e) => setNewPhoto({...newPhoto, weight: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nota - Full Width */}
                    <div className="mb-6">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5">Nota (Opcional)</label>
                        <input 
                            type="text"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                            placeholder="Ex: Pós-treino, em jejum..."
                            value={newPhoto.notes}
                            onChange={(e) => setNewPhoto({...newPhoto, notes: e.target.value})}
                        />
                    </div>

                    {/* Botão de Salvar (Logo abaixo, sem footer fixo) */}
                    <button 
                        onClick={handleSavePhoto}
                        disabled={isSavingPhoto}
                        className="w-full py-3.5 rounded-xl font-bold text-black active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {isSavingPhoto ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                        {isSavingPhoto ? 'Salvando...' : 'Salvar Foto'}
                    </button>
                </div>
            </div>
        )}

        {/* MODAL: PHOTO VIEWER (DETAIL) */}
        {viewPhoto && (
             <div className="fixed inset-0 z-[110] bg-black flex flex-col animate-in fade-in duration-200">
                 {/* Close Button */}
                 <button 
                    onClick={() => setViewPhoto(null)} 
                    aria-label="Fechar visualização"
                    className="absolute top-safe right-4 z-20 p-2 bg-black/50 rounded-full text-white backdrop-blur-md mt-4"
                >
                     <X size={24} />
                 </button>

                 {/* Image Area */}
                 <div className="flex-1 flex items-center justify-center p-2 bg-black relative">
                     <img 
                        src={viewPhoto.url} 
                        className="max-w-full max-h-full object-contain shadow-2xl" 
                        alt="Progresso visualizado"
                    />
                 </div>

                 {/* Info Panel Bottom Sheet */}
                 <div className="bg-[#18181b] p-6 pb-safe rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                     <div className="flex justify-between items-end mb-6 pb-4 border-b border-white/5">
                         <div>
                             <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Data do Registro</p>
                             <div className="flex items-center gap-2 text-white">
                                 <Calendar size={18} className="text-zinc-400" />
                                 <span className="text-xl font-bold">{new Date(viewPhoto.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                             </div>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Peso</p>
                             <div className="flex items-center justify-end gap-1">
                                <span className="text-2xl font-bold text-white">{viewPhoto.weight_at_time || '-'}</span>
                                <span className="text-sm text-zinc-400">kg</span>
                             </div>
                         </div>
                     </div>

                     {/* THE NOTE DISPLAY */}
                     <div>
                         <p className="text-xs text-zinc-500 uppercase font-bold mb-3 flex items-center gap-2">
                             <MessageSquare size={14} /> Notas / Observações
                         </p>
                         <div className="bg-zinc-900 p-5 rounded-2xl border border-white/10 min-h-[100px]">
                             {viewPhoto.notes ? (
                                 <p className="text-white text-base leading-relaxed">
                                     {viewPhoto.notes}
                                 </p>
                             ) : (
                                 <p className="text-zinc-600 text-sm italic flex items-center gap-2">
                                     <Info size={14} />
                                     Nenhuma observação registrada.
                                 </p>
                             )}
                         </div>
                     </div>
                 </div>
             </div>
        )}
    </div>
  );
};
