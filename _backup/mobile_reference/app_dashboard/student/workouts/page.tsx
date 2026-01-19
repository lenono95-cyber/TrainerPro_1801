import { getStudentWorkouts } from "@/actions/workout";
import Link from "next/link";
import { Dumbbell, Play, ChevronRight, Calculator } from "lucide-react";

export default async function StudentWorkoutsPage() {
    const workouts = await getStudentWorkouts();

    return (
        <div className="p-5 pb-32">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-white">Meus Treinos</h1>
                <p className="text-zinc-400 text-sm">Selecione uma ficha para iniciar.</p>
            </header>

            {workouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5 border-dashed">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 opacity-50">
                        <Dumbbell size={32} className="text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 font-medium">Nenhum treino disponível.</p>
                    <p className="text-zinc-600 text-xs mt-1">Aguarde seu treinador criar uma ficha.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {workouts.map((workout) => (
                        <div key={workout.id} className="bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden group hover:border-[#ef4444]/30 transition-all">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-[#ef4444] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                Ficha
                                            </span>
                                            {workout.expires_at && (
                                                <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                                    <Calculator size={10} /> Expira em breve
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-white leading-tight">{workout.name}</h3>
                                        {workout.trainer && <p className="text-xs text-zinc-500 mt-1">Treinador: {workout.trainer.name}</p>}
                                    </div>

                                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-[#ef4444] group-hover:text-white transition-colors">
                                        <ChevronRight size={20} className="text-zinc-500 group-hover:text-white" />
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-400 line-clamp-2 h-10 mb-6 bg-zinc-950/30 p-2 rounded-lg border border-white/5">
                                    {workout.objective || "Sem objetivo definido."}
                                </p>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                                        <Dumbbell size={14} /> {workout.exercises.length} exercícios
                                    </span>

                                    <Link
                                        href={`/dashboard/student/workouts/${workout.id}`}
                                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition active:scale-95"
                                    >
                                        <Play size={14} fill="black" /> INICIAR
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
