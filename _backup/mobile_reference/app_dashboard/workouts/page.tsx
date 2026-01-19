import { getWorkouts, deleteWorkout } from "@/actions/workout";
import Link from "next/link";

export default async function WorkoutsPage() {
    const workouts = await getWorkouts();

    return (
        <div className="p-4 md:p-8 pb-32">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Workouts</h1>
                    <p className="text-zinc-400 text-sm">Gerencie os planos de treino</p>
                </div>
                <Link
                    href="/dashboard/workouts/new"
                    className="bg-[#ef4444] text-white px-4 py-2 rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/20 font-medium text-sm"
                >
                    + Novo Treino
                </Link>
            </div>

            {workouts.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 border border-white/5 rounded-3xl">
                    <p className="text-zinc-400 text-lg">Nenhum treino encontrado.</p>
                    <p className="text-zinc-600 text-sm mt-1">Crie um novo para começar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workouts.map((workout) => (
                        <div key={workout.id} className="bg-zinc-900/70 backdrop-blur-md p-6 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all group">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-zinc-800 p-3 rounded-2xl group-hover:bg-[#ef4444]/10 transition-colors">
                                        <div className="w-6 h-6 bg-zinc-700 rounded-full group-hover:bg-[#ef4444] transition-colors" />
                                    </div>
                                    <span className="text-xs font-semibold bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full border border-white/5">
                                        {workout.exercises.length} Exercícios
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-1">{workout.name}</h2>
                                <p className="text-sm text-[#ef4444] font-medium mb-4">Aluno: {workout.student.user.name}</p>
                                <p className="text-zinc-500 text-sm line-clamp-2 bg-zinc-950/30 p-3 rounded-xl border border-white/5 min-h-[4rem]">
                                    {workout.objective || "Sem objetivo definido."}
                                </p>
                            </div>

                            <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                                <Link href={`/dashboard/workouts/${workout.id}`} className="text-white hover:text-[#ef4444] text-sm font-medium transition-colors">
                                    Ver Detalhes
                                </Link>
                                <form action={async () => {
                                    "use server"
                                    await deleteWorkout(workout.id)
                                }}>
                                    <button className="text-zinc-500 hover:text-red-500 text-xs transition-colors">Excluir</button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
