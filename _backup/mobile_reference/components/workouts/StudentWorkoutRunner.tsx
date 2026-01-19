"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle2, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Workout, Exercise } from "@prisma/client";
import { saveWorkoutLog } from "@/actions/log";

interface StudentWorkoutRunnerProps {
    workout: Workout & { exercises: Exercise[] };
}

export function StudentWorkoutRunner({ workout }: StudentWorkoutRunnerProps) {
    const router = useRouter();
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
    const [expandedExercise, setExpandedExercise] = useState<string | null>(
        workout.exercises.length > 0 ? workout.exercises[0].id : null
    );

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleSet = (exerciseId: string, setIndex: number) => {
        const key = `${exerciseId}-${setIndex}`;
        setCompletedSets((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const countCompleted = () => Object.values(completedSets).filter(Boolean).length;
    const totalSets = workout.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0);
    const progress = Math.round((countCompleted() / totalSets) * 100) || 0;

    return (
        <div className="pb-32 bg-[#09090b] min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-[#09090b]/90 backdrop-blur-lg border-b border-white/10 z-50 px-4 py-3 pb-safe">
                <div className="flex items-center justify-between mb-2">
                    <Link href="/dashboard/student/workouts" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full">
                        <ArrowLeft size={24} />
                    </Link>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 font-mono text-white text-xl font-bold">
                            <Clock size={16} className={isTimerRunning ? "text-[#ef4444] animate-pulse" : "text-zinc-600"} />
                            {formatTime(timer)}
                        </div>
                    </div>

                    <div className="w-8" />
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#ef4444] h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
                    <p className="text-zinc-500 text-sm">{workout.exercises.length} exercícios • {totalSets} séries totais</p>
                </div>

                {workout.exercises.map((ex, idx) => {
                    const isExpanded = expandedExercise === ex.id;
                    const exSets = ex.sets || 3;

                    return (
                        <div key={ex.id}
                            className={`bg-zinc-900/50 border transition-all duration-300 rounded-3xl overflow-hidden ${isExpanded ? 'border-white/20 ring-1 ring-white/10' : 'border-white/5'
                                }`}>

                            <button
                                onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                                className="w-full p-5 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${isExpanded ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg transition-colors ${isExpanded ? 'text-white' : 'text-zinc-400'}`}>
                                            {ex.name}
                                        </h3>
                                        {!isExpanded && (
                                            <p className="text-xs text-zinc-600 mt-0.5">{ex.sets} séries • {ex.reps} reps</p>
                                        )}
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-600" />}
                            </button>

                            {isExpanded && (
                                <div className="px-5 pb-5 animate-in slide-in-from-top-2">
                                    {/* Info Chips */}
                                    <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar py-1">
                                        <div className="bg-zinc-950 px-3 py-2 rounded-xl border border-white/5 min-w-[70px]">
                                            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Carga</span>
                                            <span className="text-white font-bold">{ex.weight || '-'} kg</span>
                                        </div>
                                        <div className="bg-zinc-950 px-3 py-2 rounded-xl border border-white/5 min-w-[70px]">
                                            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Reps</span>
                                            <span className="text-white font-bold">{ex.reps || '-'}</span>
                                        </div>
                                        <div className="bg-zinc-950 px-3 py-2 rounded-xl border border-white/5 min-w-[70px]">
                                            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Descanso</span>
                                            <span className="text-white font-bold">{ex.rest_seconds || '60'}s</span>
                                        </div>
                                        {ex.media_url && (
                                            <a href={ex.media_url} target="_blank" className="bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-500/20 flex items-center gap-2 text-blue-400 hover:text-white transition-colors">
                                                <PlayCircle size={16} /> <span className="text-xs font-bold">Ver Vídeo</span>
                                            </a>
                                        )}
                                    </div>

                                    {ex.notes && (
                                        <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5 mb-6 text-sm text-zinc-400 italic">
                                            "{ex.notes}"
                                        </div>
                                    )}

                                    {/* Checklist */}
                                    <div className="space-y-2">
                                        {Array.from({ length: exSets }).map((_, setIdx) => {
                                            const isDone = completedSets[`${ex.id}-${setIdx}`];
                                            return (
                                                <button
                                                    key={setIdx}
                                                    onClick={() => toggleSet(ex.id, setIdx)}
                                                    className={`w-full p-4 rounded-xl flex items-center justify-between border transition-all ${isDone
                                                        ? 'bg-green-500/10 border-green-500/20'
                                                        : 'bg-zinc-950 border-zinc-800 active:bg-zinc-900'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${isDone ? 'bg-green-500 border-green-500 text-black' : 'bg-transparent border-zinc-700 text-zinc-600'
                                                            }`}>
                                                            {setIdx + 1}
                                                        </div>
                                                        <span className={`text-sm font-medium ${isDone ? 'text-green-400' : 'text-zinc-300'}`}>
                                                            Série {setIdx + 1}
                                                        </span>
                                                    </div>
                                                    {isDone && <CheckCircle2 size={20} className="text-green-500" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                <button
                    onClick={async () => {
                        if (confirm("Finalizar Treino?")) {
                            setIsTimerRunning(false);

                            // Prepare Logs
                            const exercisesDone = workout.exercises.map(ex => {
                                // Simple logic: if at least one set is done, log it.
                                // In a real app we would calculate exact sets done.
                                const setsForEx = Array.from({ length: ex.sets || 3 }).filter((_, i) => completedSets[`${ex.id}-${i}`]).length;
                                if (setsForEx === 0) return null;

                                return {
                                    name: ex.name,
                                    sets_done: setsForEx,
                                    weight_used: ex.weight || 0,
                                    reps_done: ex.reps || 0
                                };
                            }).filter(Boolean) as any[];

                            const result = await saveWorkoutLog({
                                student_id: workout.student_id,
                                workout_id: workout.id,
                                duration_minutes: Math.ceil(timer / 60),
                                exercises_done: exercisesDone
                            });

                            if (result.success) {
                                alert("Treino salvo com sucesso! 💪");
                                router.push("/dashboard/student/workouts");
                            } else {
                                alert("Erro ao salvar treino. Tente novamente.");
                                setIsTimerRunning(true);
                            }
                        }
                    }}
                    className="w-full bg-[#ef4444] text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 mt-8 hover:bg-red-600 transition-colors active:scale-95"
                >
                    Finalizar Treino
                </button>
            </div>
        </div>
    );
}
