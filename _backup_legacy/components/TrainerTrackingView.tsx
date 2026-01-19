
import React, { useState, useEffect } from 'react';
import { db } from '../services/supabaseService';
import { Student, WorkoutLog } from '../types';
import { Search, CheckCircle2, XCircle, ChevronRight, User } from 'lucide-react';
import { StudentEvolution } from './StudentEvolution';

interface TrainerTrackingViewProps {
  primaryColor: string;
}

export const TrainerTrackingView: React.FC<TrainerTrackingViewProps> = ({ primaryColor }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const studentsData = await db.getStudents();
    
    // Buscar logs de todos os alunos (simulado por iteração aqui, na vida real seria uma query única)
    const allLogs: WorkoutLog[] = [];
    for(const s of studentsData) {
        const sLogs = await db.getWorkoutLogs(s.id);
        allLogs.push(...sLogs);
    }
    
    setStudents(studentsData);
    setLogs(allLogs);
    setLoading(false);
  };

  const getTodayStatus = (studentId: string) => {
      const today = new Date().toISOString().split('T')[0];
      const log = logs.find(l => l.student_id === studentId && l.date.startsWith(today));
      return log;
  };

  if (selectedStudent) {
      return (
          <StudentEvolution 
            student={selectedStudent} 
            primaryColor={primaryColor} 
            onBack={() => setSelectedStudent(null)} 
            isTrainer={true}
          />
      );
  }

  // Agrupar por status hoje
  const trainedToday = students.filter(s => getTodayStatus(s.id));
  const missingToday = students.filter(s => !getTodayStatus(s.id));

  return (
    <div className="p-5 pb-24 space-y-6">
        <header className="mt-2 mb-4">
            <h1 className="text-3xl font-bold text-white">Acompanhamento</h1>
            <p className="text-zinc-400 text-sm mt-1">Monitore o desempenho diário dos alunos.</p>
        </header>

        {/* Resumo do Dia */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-zinc-500 uppercase font-bold">Treinaram Hoje</span>
                <p className="text-3xl font-bold text-green-500 mt-1">{trainedToday.length}</p>
            </div>
            <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-zinc-500 uppercase font-bold">Pendentes</span>
                <p className="text-3xl font-bold text-zinc-400 mt-1">{missingToday.length}</p>
            </div>
        </div>

        {/* Lista de Treinados */}
        <div>
            <h3 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 size={16} /> Completaram o Treino
            </h3>
            <div className="space-y-3">
                {trainedToday.length === 0 ? (
                    <p className="text-zinc-600 text-sm italic">Nenhum treino registrado hoje ainda.</p>
                ) : (
                    trainedToday.map(s => {
                        const log = getTodayStatus(s.id)!;
                        return (
                            <button 
                                key={s.id}
                                onClick={() => setSelectedStudent(s)}
                                className="w-full text-left bg-[#18181b] p-4 rounded-2xl border border-green-500/20 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                                            {s.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{s.full_name}</h4>
                                            <p className="text-xs text-zinc-400">{log.workout_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-white">{log.rating}⭐</span>
                                        <ChevronRight size={16} className="text-zinc-600 ml-auto mt-1" />
                                    </div>
                                </div>
                                {log.feedback && (
                                    <div className="mt-3 text-xs text-zinc-300 italic bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                                        "{log.feedback}"
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>

        {/* Lista de Faltantes */}
        <div>
            <h3 className="text-sm font-bold text-red-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <XCircle size={16} /> Pendentes / Faltas
            </h3>
            <div className="space-y-3">
                {missingToday.map(s => (
                     <button 
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className="w-full text-left bg-[#18181b] p-4 rounded-2xl border border-white/5 flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer opacity-70 hover:opacity-100"
                    >
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 font-bold border border-zinc-800">
                                {s.full_name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-300">{s.full_name}</h4>
                                <p className="text-xs text-zinc-600">Último: {s.last_checkin ? new Date(s.last_checkin).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}) : 'Nunca'}</p>
                            </div>
                        </div>
                        <span className="text-xs text-zinc-500 border border-zinc-700 px-3 py-1 rounded-full hover:bg-zinc-800">
                            Ver Perfil
                        </span>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
