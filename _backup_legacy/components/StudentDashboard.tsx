
import React, { useEffect, useState } from 'react';
import { UserProfile, Student, WorkoutRoutine } from '../types';
import { db } from '../services/supabaseService';
import { Activity, Calendar, Trophy, Play, CheckCircle2, ChevronRight, TrendingUp, Bell } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { NotificationCenter } from './NotificationCenter';

interface StudentDashboardProps {
  user: UserProfile;
  primaryColor: string;
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, primaryColor, onNavigate }) => {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      // Mock: Na vida real usaria user.id para buscar o perfil de aluno associado
      // Aqui usamos o campo mockado student_id_link ou o primeiro aluno
      const studentId = (user as any).student_id_link || 's1'; 
      const student = await db.getStudentDetails(studentId);
      
      const notifs = await db.getNotifications(user.id);
      setUnreadCount(notifs.filter(n => !n.read).length);

      if (student) {
        setStudentData(student);
        const w = await db.getWorkouts(student.id);
        setWorkouts(w);
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-zinc-500">Carregando seu perfil...</div>;
  if (!studentData) return <div className="p-8 text-center text-zinc-500">Perfil de aluno não encontrado.</div>;

  // Mock de dados para o gráfico mini
  const mockEvolution = [
      { day: 'S', weight: 88 },
      { day: 'T', weight: 87.8 },
      { day: 'Q', weight: 87.5 },
      { day: 'Q', weight: 87.2 },
      { day: 'S', weight: 87.0 },
      { day: 'S', weight: 86.8 },
      { day: 'D', weight: 86.5 },
  ];

  return (
    <>
    <div className="p-5 space-y-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mt-2">
        <div>
           <p className="text-zinc-400 text-sm font-medium">Bom dia,</p>
           <h1 className="text-3xl font-bold text-white mt-1">
             {studentData.full_name.split(' ')[0]}
           </h1>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={() => {
                    setShowNotifications(true);
                    setUnreadCount(0); // Otimista
                }}
                aria-label="Abrir notificações"
                className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 relative active:scale-95 transition-transform"
            >
                <Bell size={24} className="text-white" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#18181b]" />
                )}
            </button>
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5">
                <span className="text-xl font-bold text-white">{studentData.full_name.charAt(0)}</span>
            </div>
        </div>
      </header>

      {/* Destaque do dia (Treino de Hoje) */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-800 to-black border border-white/10 shadow-2xl">
         {/* Background Image Simulado com Gradiente */}
         <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-overlay"></div>
         
         <div className="relative p-6 z-10">
            <div className="flex justify-between items-start mb-12">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                    Treino de Hoje
                </span>
                <span className="text-white/80 font-mono text-xs">{new Date().toLocaleDateString('pt-BR', {weekday: 'long'})}</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                {workouts[0]?.name || "Descanso Ativo"}
            </h2>
            <p className="text-zinc-300 text-sm mb-6 max-w-[80%]">
                {workouts[0]?.description || "Foque na recuperação muscular e alongamentos hoje."}
            </p>

            <button 
                onClick={() => onNavigate('workouts')}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            >
                <Play size={20} fill="currentColor" />
                <span>Iniciar Treino</span>
            </button>
         </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card Evolução (Clicável para ir para Evolução) */}
        <button 
            onClick={() => onNavigate('evolution')}
            className="bg-[#18181b] p-4 rounded-3xl border border-white/5 flex flex-col justify-between h-40 active:scale-[0.98] transition-transform text-left"
        >
            <div className="flex justify-between items-start w-full">
                <div className="p-2 bg-zinc-800 rounded-xl text-green-400">
                    <TrendingUp size={18} />
                </div>
                <span className="text-xs text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded-lg">-1.5kg</span>
            </div>
            <div>
                <span className="text-zinc-400 text-xs font-medium uppercase">Evolução</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{studentData.weight}</span>
                    <span className="text-xs text-zinc-500">kg</span>
                </div>
                <div className="h-8 mt-2 w-full opacity-50">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockEvolution}>
                            <Line type="monotone" dataKey="weight" stroke="#4ade80" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </button>

        {/* Card Próxima Avaliação */}
        <div className="bg-[#18181b] p-4 rounded-3xl border border-white/5 flex flex-col justify-between h-40">
             <div className="flex justify-between items-start">
                <div className="p-2 bg-zinc-800 rounded-xl text-blue-400">
                    <Calendar size={18} />
                </div>
            </div>
            <div>
                <span className="text-zinc-400 text-xs font-medium uppercase">Próx. Avaliação</span>
                <span className="block text-xl font-bold text-white mt-1">15 Nov</span>
                <span className="text-xs text-zinc-500">Sexta, 14:00</span>
            </div>
        </div>
      </div>

      {/* Lista de Meus Treinos */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Minha Rotina</h3>
            <button 
                onClick={() => onNavigate('workouts')}
                className="text-xs text-zinc-400 hover:text-white"
            >
                Ver tudo
            </button>
        </div>
        
        <div className="space-y-3">
            {workouts.map((w, idx) => (
                <div 
                    key={w.id} 
                    onClick={() => onNavigate('workouts')}
                    className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black transition-colors">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{w.name}</h4>
                            <span className="text-xs text-zinc-500">{w.exercises.length} exercícios</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {idx === 0 && <CheckCircle2 size={16} className="text-green-500" />}
                        <ChevronRight size={16} className="text-zinc-600" />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
    
    <NotificationCenter 
        user={user} 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        primaryColor={primaryColor}
    />
    </>
  );
};
