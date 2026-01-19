
import React, { useEffect, useState } from 'react';
import { Student, Assessment, WorkoutRoutine, UserRole } from '../types';
import { db } from '../services/supabaseService';
import { 
  ArrowLeft, Activity, Calendar, Award, MoreVertical, AlertCircle, 
  Loader2, Plus, FileText, ChevronRight, Trash2, Edit, X, Save, 
  Dumbbell, Clock, PlayCircle, Zap, TrendingUp, Filter 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutBuilder } from './WorkoutBuilder';
import { PhysicalAssessmentForm } from './PhysicalAssessmentForm';
import { PhysicalAssessmentDetail } from './PhysicalAssessmentDetail';

interface StudentDetailProps {
  student: Student;
  primaryColor: string;
  onBack: () => void;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ student, primaryColor, onBack }) => {
  const [currentStudent, setCurrentStudent] = useState<Student>(student);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutRoutine[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'builder' | 'assessments'>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Assessment States
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Video Player State
  const [videoPlayerUrl, setVideoPlayerUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [student.id, activeTab]); 

  const loadData = async () => {
    if (activeTab === 'builder' || isCreatingAssessment) return;
    
    setLoadingData(true);
    try {
        const [assData, workData, freshStudent] = await Promise.all([
            db.getAssessments(student.id),
            db.getWorkouts(student.id),
            db.getStudentDetails(student.id)
        ]);
        setAssessments(assData);
        setWorkouts(workData);
        if(freshStudent) setCurrentStudent(freshStudent);
    } finally {
        setLoadingData(false);
    }
  };

  const handleDeleteStudent = async () => {
      if (!confirm(`Tem certeza que deseja arquivar ${currentStudent.full_name}?`)) return;
      setIsDeleting(true);
      setShowMenu(false);
      await db.deleteStudent(currentStudent.id);
      setIsDeleting(false);
      onBack();
  };

  const handleEditProfile = () => {
      setEditForm({
          full_name: currentStudent.full_name,
          goal: currentStudent.goal,
          level: currentStudent.level,
          injuries: currentStudent.injuries || ''
      });
      setValidationError('');
      setIsEditingProfile(true);
      setShowMenu(false);
  };

  const saveProfile = async () => {
      if (!editForm.full_name?.trim()) return setValidationError('Nome é obrigatório');
      
      setSavingProfile(true);
      await db.updateStudentProfile(currentStudent.id, editForm, UserRole.TRAINER);
      const fresh = await db.getStudentDetails(currentStudent.id);
      if (fresh) setCurrentStudent(fresh);
      setSavingProfile(false);
      setIsEditingProfile(false);
  };

  // Helper para abrir vídeo
  const openVideo = (e: React.MouseEvent, url: string) => {
      e.stopPropagation();
      // Auto convert YouTube links
      let finalUrl = url;
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = url.match(regExp);
          if (match && match[2].length === 11) {
              finalUrl = `https://www.youtube.com/embed/${match[2]}`;
          }
      }
      setVideoPlayerUrl(finalUrl);
  };

  const chartData = assessments.map(a => ({
    date: new Date(a.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    weight: a.weight,
    fat: a.body_fat_percentage
  }));

  // Render Sub-Views
  if (activeTab === 'builder') {
    return <WorkoutBuilder student={currentStudent} primaryColor={primaryColor} onBack={() => setActiveTab('workouts')} />;
  }
  
  if (isCreatingAssessment) {
      return (
        <PhysicalAssessmentForm 
            student={currentStudent} 
            primaryColor={primaryColor} 
            onBack={() => { setIsCreatingAssessment(false); loadData(); }} 
        />
      );
  }

  if (selectedAssessment) {
      const idx = assessments.findIndex(a => a.id === selectedAssessment.id);
      const prev = idx > 0 ? assessments[idx - 1] : undefined;
      return (
          <PhysicalAssessmentDetail 
            assessment={selectedAssessment}
            student={currentStudent}
            previousAssessment={prev}
            primaryColor={primaryColor}
            onBack={() => setSelectedAssessment(null)}
          />
      );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white animate-in fade-in duration-300 font-sans pb-24" onClick={() => setShowMenu(false)}>
      
      {/* --- ULTRA PREMIUM HEADER --- */}
      <div className="relative pb-6 bg-[#09090b] overflow-hidden rounded-b-[3rem] shadow-2xl z-20">
        
        {/* Background Gradient Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] rounded-[100%] bg-gradient-to-b from-zinc-800 to-[#09090b] opacity-80" />
            <div 
                className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[100%] h-[100%] rounded-full blur-[120px] opacity-20"
                style={{ backgroundColor: primaryColor }}
            />
        </div>

        {/* Top Navigation Bar */}
        <div className="relative z-10 flex justify-between items-center px-6 pt-6 mb-4">
           <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 shadow-lg active:scale-95"
            >
             <ArrowLeft size={20} className="text-white" />
           </button>
           
           <div className="relative">
               <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 shadow-lg active:scale-95"
                >
                    <MoreVertical size={20} className="text-zinc-300" />
               </button>
               
               {/* Dropdown Menu */}
               {showMenu && (
                   <div className="absolute right-0 top-12 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl w-56 overflow-hidden z-50 animate-in zoom-in-95 duration-200 p-1">
                       <button 
                            onClick={(e) => { e.stopPropagation(); handleEditProfile(); }}
                            className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 rounded-xl flex items-center gap-3 transition-colors"
                        >
                           <Edit size={16} /> Editar Perfil
                       </button>
                       <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteStudent(); }}
                            disabled={isDeleting}
                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-3 transition-colors mt-1"
                        >
                           {isDeleting ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16} />}
                           Arquivar Aluno
                       </button>
                   </div>
               )}
           </div>
        </div>

        {/* Avatar & Main Info */}
        <div className="relative z-10 px-6 flex flex-col items-center text-center">
           <div className="relative group mb-4">
               {/* Glowing Ring */}
               <div 
                    className="absolute -inset-1 rounded-full opacity-40 blur-lg transition-opacity group-hover:opacity-70 animate-pulse"
                    style={{ backgroundColor: primaryColor }}
               ></div>
               <div className="relative w-28 h-28 rounded-full p-[3px] bg-zinc-900 overflow-hidden shadow-2xl ring-2 ring-white/5">
                    <div 
                        className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-4xl bg-zinc-800 overflow-hidden"
                    >
                        {currentStudent.avatar_url ? (
                            <img src={currentStudent.avatar_url} className="w-full h-full object-cover" alt={currentStudent.full_name} />
                        ) : (
                            currentStudent.full_name.charAt(0)
                        )}
                    </div>
               </div>
               {/* Status Dot */}
               <div className="absolute bottom-1 right-2 w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full border border-black shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
               </div>
           </div>

           <h2 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">{currentStudent.full_name}</h2>
           <p className="text-xs text-zinc-500 font-medium mb-4">Ativo desde {new Date().getFullYear()}</p>
           
           {/* Visual Chips (Glassmorphism) */}
           <div className="flex items-center gap-2 justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md shadow-sm">
                    <Activity size={12} style={{ color: primaryColor }} />
                    <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider">{currentStudent.level}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md shadow-sm">
                    <TrendingUp size={12} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider">{currentStudent.goal}</span>
                </div>
           </div>
        </div>

        {/* Tab Navigation (Pills) */}
        <div className="relative z-10 px-6 mt-8">
            <div className="flex p-1.5 bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5">
                {[
                    { id: 'overview', label: 'Resumo' },
                    { id: 'workouts', label: 'Treinos' },
                    { id: 'assessments', label: 'Avaliações' }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 px-2 text-xs font-bold rounded-xl transition-all duration-300 relative overflow-hidden flex items-center justify-center ${activeTab === tab.id ? 'text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {activeTab === tab.id && (
                            <div className="absolute inset-0 bg-zinc-800 rounded-xl z-0 animate-in fade-in zoom-in-95 duration-200 border border-white/5" />
                        )}
                        <span className="relative z-10 tracking-wide uppercase">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="px-5 py-6">
        
        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            {/* Grid de Estatísticas Rápidas (Dark Cards) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5 relative overflow-hidden shadow-lg group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity size={60} />
                </div>
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="flex justify-between items-start">
                      <div className="p-2.5 rounded-2xl bg-zinc-900 border border-white/5 text-blue-400">
                         <Activity size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">+1.2%</span>
                  </div>
                  <div className="mt-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Peso Atual</span>
                      <p className="text-3xl font-bold text-white">{currentStudent.weight} <span className="text-sm font-normal text-zinc-500">kg</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5 relative overflow-hidden shadow-lg group hover:border-white/10 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Award size={60} />
                </div>
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="flex justify-between items-start">
                      <div className="p-2.5 rounded-2xl bg-zinc-900 border border-white/5 text-purple-400">
                         <Award size={20} />
                      </div>
                  </div>
                  <div className="mt-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">IMC</span>
                      <p className="text-3xl font-bold text-white">{(currentStudent.weight / ((currentStudent.height/100) ** 2)).toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico Dark Mode */}
            <div className="bg-[#18181b] p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <TrendingUp size={18} className="text-zinc-400"/>
                    Evolução
                </h3>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 11, fill: '#71717a'}} 
                      dy={15} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 11, fill: '#71717a'}} 
                      domain={['dataMin - 5', 'dataMax + 5']} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#27272a', 
                        borderRadius: '12px', 
                        border: '1px solid #3f3f46', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                        color: '#fff'
                      }} 
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke={primaryColor} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#18181b', stroke: primaryColor, strokeWidth: 2 }} 
                      activeDot={{ r: 6, fill: primaryColor, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

             {currentStudent.injuries && (
              <div className="bg-red-500/5 p-5 rounded-3xl border border-red-500/20 flex items-start space-x-4">
                <div className="bg-red-500/20 p-2 rounded-full text-red-500 mt-1">
                    <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-red-400 font-bold text-sm mb-1 uppercase tracking-wide">Atenção Médica</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{currentStudent.injuries}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: WORKOUTS (REDESIGNED) --- */}
        {activeTab === 'workouts' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             
             {/* Main CTA (Create Workout) */}
             <button 
              onClick={() => setActiveTab('builder')}
              className="relative w-full group overflow-hidden rounded-[2rem] p-1 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] transition-transform active:scale-[0.98]"
            >
              {/* Animated Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-[2rem] animate-pulse opacity-50" />
              <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, transparent)` }} 
              />
              
              <div className="relative bg-[#18181b] rounded-[1.8rem] p-6 flex items-center justify-between border border-white/5 group-hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-5">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)` }}
                      >
                          <Plus size={28} />
                      </div>
                      <div className="text-left">
                          <h3 className="text-xl font-bold text-white">Criar Novo Treino</h3>
                          <p className="text-xs text-zinc-400 mt-1 font-medium">Adicionar ficha personalizada</p>
                      </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <ChevronRight className="text-zinc-500 group-hover:text-white transition-colors" />
                  </div>
              </div>
            </button>

            {/* Quick Filter / Status */}
            <div className="flex justify-between items-center px-2">
               <h3 className="font-bold text-white text-lg flex items-center gap-2">
                   <Dumbbell size={18} className="text-zinc-400" />
                   Planos Ativos
               </h3>
               <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-full border border-white/5 font-bold">
                   <Filter size={10} />
                   <span>{workouts.length} fichas</span>
               </div>
            </div>
            
            {loadingData ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                    <Loader2 className="animate-spin mb-4" size={40} style={{ color: primaryColor }} />
                    <p className="text-sm font-medium">Sincronizando treinos...</p>
                </div>
            ) : workouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600 bg-[#18181b] rounded-[2.5rem] border border-dashed border-zinc-800">
                <div className="bg-zinc-900 p-4 rounded-full mb-4">
                    <Dumbbell size={32} className="opacity-50" />
                </div>
                <p className="font-medium">Nenhum treino criado ainda.</p>
                <p className="text-xs mt-1 max-w-[200px] text-center text-zinc-500">Toque no botão acima para começar a prescrever.</p>
              </div>
            ) : (
              <div className="grid gap-5">
              {workouts.map((workout, index) => (
                <div 
                    key={workout.id} 
                    className="group relative bg-[#18181b] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-white/10 transition-all shadow-md active:scale-[0.99]"
                >
                  {/* Left Color Bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-2 opacity-80" 
                    style={{ backgroundColor: primaryColor }}
                  />

                  <div className="p-6 pl-8">
                      {/* Header Card */}
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                              {/* Day Badge */}
                              {!workout.is_template && (
                                  <span 
                                    className="text-[10px] font-black px-2.5 py-1 rounded-lg text-black uppercase tracking-wider shadow-sm"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    {workout.day_of_week?.substring(0, 3)}
                                  </span>
                              )}
                              <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase border border-zinc-800 px-2 py-0.5 rounded-lg">
                                  {workout.is_template ? 'Template' : 'Ficha'}
                              </span>
                          </div>
                          <h4 className="font-bold text-white text-2xl leading-tight">{workout.name}</h4>
                        </div>
                        
                        {/* Kebab Menu Placeholder */}
                        <button className="text-zinc-600 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full">
                            <MoreVertical size={20} />
                        </button>
                      </div>
                      
                      {/* Mini Stats Grid */}
                      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar">
                          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/80 px-3 py-2 rounded-xl border border-white/5 whitespace-nowrap">
                              <Dumbbell size={14} className="text-white" />
                              <span className="text-xs font-bold text-zinc-300">{workout.exercises.length} <span className="font-medium text-zinc-600">Exer</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/80 px-3 py-2 rounded-xl border border-white/5 whitespace-nowrap">
                              <Clock size={14} className="text-white" />
                              <span className="text-xs font-bold text-zinc-300">~45 <span className="font-medium text-zinc-600">min</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/80 px-3 py-2 rounded-xl border border-white/5 whitespace-nowrap">
                              <Zap size={14} className="text-yellow-500" fill="currentColor" />
                              <span className="text-xs font-bold text-zinc-300">Intenso</span>
                          </div>
                      </div>

                      {/* Exercise Preview Strip */}
                      <div className="space-y-2 relative">
                        {/* Gradient Fade for list */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#18181b] to-transparent pointer-events-none z-10" />
                        
                        {workout.exercises.slice(0, 3).map((ex, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm p-3.5 rounded-2xl bg-zinc-900/30 border border-white/5 group/ex hover:bg-zinc-900/60 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold border border-white/5 shadow-inner">
                                      {idx + 1}
                                  </div>
                                  <span className="text-zinc-300 font-bold text-xs group-hover/ex:text-white transition-colors">{ex.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <span className="font-mono text-[10px] text-zinc-500 font-bold bg-black/20 px-2 py-0.5 rounded">{ex.sets}x{ex.reps}</span>
                                  {/* Video Indicator - Functional */}
                                  {ex.video_url ? (
                                      <button 
                                        onClick={(e) => openVideo(e, ex.video_url!)}
                                        title="Ver Demonstração"
                                        className="text-zinc-500 hover:text-blue-400 p-1 rounded-full hover:bg-blue-500/10 transition-all active:scale-95"
                                      >
                                          <PlayCircle size={18} fill="currentColor" className="opacity-80" />
                                      </button>
                                  ) : (
                                      <PlayCircle size={16} className="text-zinc-800" />
                                  )}
                              </div>
                           </div>
                        ))}
                      </div>
                      
                      {workout.exercises.length > 3 && (
                          <div className="mt-[-10px] relative z-20 text-center">
                              <span className="text-[10px] text-zinc-500 font-bold tracking-widest bg-[#18181b] px-3 py-1 rounded-full border border-white/5 shadow-sm">
                                  + {workout.exercises.length - 3} EXERCÍCIOS
                              </span>
                          </div>
                      )}
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB: ASSESSMENTS (MODERNIZED) --- */}
        {activeTab === 'assessments' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
                <button 
                    onClick={() => setIsCreatingAssessment(true)}
                    className="w-full py-4 rounded-[2rem] font-bold text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-3 bg-zinc-800 border border-white/5 hover:bg-zinc-700 group"
                >
                    <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                        <Plus size={20} />
                    </div>
                    <span>Nova Avaliação Física</span>
                </button>

                <div className="flex items-center justify-between mt-6 mb-2 px-2">
                    <h3 className="font-bold text-white text-lg">Histórico</h3>
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md font-bold">{assessments.length} regs</span>
                </div>

                {loadingData ? (
                    <div className="flex justify-center py-10 text-zinc-500">
                         <Loader2 className="animate-spin" />
                    </div>
                ) : assessments.length === 0 ? (
                    <div className="text-center py-12 bg-[#18181b] rounded-[2.5rem] border border-dashed border-zinc-800">
                        <FileText size={40} className="mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-500">Nenhuma avaliação encontrada.</p>
                    </div>
                ) : (
                    assessments.map((ass) => (
                        <div 
                            key={ass.id}
                            onClick={() => setSelectedAssessment(ass)}
                            className="bg-[#18181b] p-5 rounded-3xl border border-white/5 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group hover:border-white/10 shadow-sm"
                        >
                            <div className="flex items-center gap-5">
                                <div className="bg-zinc-800 p-3.5 rounded-2xl text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-all shadow-inner">
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wide flex items-center gap-1">
                                        <Calendar size={10} />
                                        {new Date(ass.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'})}
                                    </span>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-white font-bold text-lg">{ass.weight} <span className="text-sm font-normal text-zinc-500">kg</span></span>
                                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                        <span className="text-zinc-400 text-sm">{ass.body_fat_percentage ? `${ass.body_fat_percentage}% BF` : 'BF N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                 {/* Chip IMC */}
                                 <span className="text-[10px] font-bold bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-zinc-400">
                                     IMC {ass.bmi}
                                 </span>
                                 <div className="bg-zinc-900 rounded-full p-1.5 text-zinc-600 group-hover:text-white transition-colors">
                                    <ChevronRight size={16} />
                                 </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-[#18181b] w-full max-w-md rounded-[2rem] p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold text-white">Editar Aluno</h3>
                      <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="space-y-5">
                      <div>
                          <label htmlFor="edit_name" className="text-xs font-bold text-zinc-500 uppercase block mb-2 tracking-wider">Nome Completo</label>
                          <input 
                            id="edit_name"
                            className={`w-full bg-zinc-900/50 border rounded-2xl p-4 text-white focus:outline-none transition-all ${validationError && !editForm.full_name ? 'border-red-500 focus:border-red-500' : 'border-zinc-700 focus:border-white/20'}`}
                            value={editForm.full_name}
                            onChange={e => {
                                setEditForm({ ...editForm, full_name: e.target.value });
                                if (validationError) setValidationError('');
                            }}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label htmlFor="edit_goal" className="text-xs font-bold text-zinc-500 uppercase block mb-2 tracking-wider">Objetivo</label>
                              <select 
                                id="edit_goal"
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-2xl p-4 text-white focus:outline-none focus:border-white/20 appearance-none"
                                value={editForm.goal}
                                onChange={e => setEditForm({ ...editForm, goal: e.target.value as any })}
                              >
                                  <option value="Hipertrofia">Hipertrofia</option>
                                  <option value="Emagrecimento">Emagrecimento</option>
                                  <option value="Força">Força</option>
                                  <option value="Resistência">Resistência</option>
                              </select>
                          </div>
                          <div>
                              <label htmlFor="edit_level" className="text-xs font-bold text-zinc-500 uppercase block mb-2 tracking-wider">Nível</label>
                              <select 
                                id="edit_level"
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-2xl p-4 text-white focus:outline-none focus:border-white/20 appearance-none"
                                value={editForm.level}
                                onChange={e => setEditForm({ ...editForm, level: e.target.value as any })}
                              >
                                  <option value="Iniciante">Iniciante</option>
                                  <option value="Intermediário">Intermediário</option>
                                  <option value="Avançado">Avançado</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label htmlFor="edit_injuries" className="text-xs font-bold text-zinc-500 uppercase block mb-2 tracking-wider">Lesões / Obs</label>
                          <textarea 
                            id="edit_injuries"
                            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-2xl p-4 text-white focus:outline-none focus:border-white/20 resize-none"
                            rows={3}
                            value={editForm.injuries}
                            onChange={e => setEditForm({ ...editForm, injuries: e.target.value })}
                          />
                      </div>

                      {validationError && (
                          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex gap-2 items-center text-red-400 text-xs animate-in slide-in-from-top-1">
                              <AlertCircle size={16} />
                              {validationError}
                          </div>
                      )}

                      <button 
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="w-full py-4 mt-2 rounded-2xl font-bold text-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg hover:brightness-110"
                        style={{ backgroundColor: primaryColor }}
                      >
                          {savingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                          {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                  </div>
              </div>
          </div>
      )}

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
                  <iframe 
                      src={videoPlayerUrl}
                      className="w-full h-full"
                      title="Exercise Demo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                  />
              </div>
              
              <div className="p-6 text-center">
                  <h3 className="text-white font-bold text-lg mb-2">Demonstração</h3>
                  <p className="text-zinc-500 text-sm">Visualização do Personal</p>
              </div>
          </div>
      )}

    </div>
  );
};
