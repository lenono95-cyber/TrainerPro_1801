import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Video, Clock, Dumbbell, Repeat, CheckCircle2 } from "lucide-react";
import { addExercise, deleteExercise } from "@/actions/exercise";

export default async function WorkoutDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const workout = await prisma.workout.findUnique({
        where: { id: params.id },
        include: {
            exercises: {
                orderBy: { created_at: "asc" }
            },
            student: {
                select: { user: { select: { name: true } } }
            }
        }
    });

    if (!workout || workout.tenant_id !== session.user.tenant_id) {
        return notFound();
    }

    return (
        <div className="p-4 md:p-8 pb-32">
            {/* Header */}
            <header className="mb-8">
                <Link href="/dashboard/workouts" className="text-zinc-500 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
                    <ArrowLeft size={16} /> Voltar para lista
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{workout.name}</h1>
                        <p className="text-[#ef4444] font-medium">Aluno: {workout.student.user.name}</p>
                    </div>
                    <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase font-bold">Total</p>
                        <p className="text-xl font-bold text-white text-center">{workout.exercises.length}</p>
                    </div>
                </div>
                {workout.objective && (
                    <p className="text-zinc-500 text-sm mt-4 bg-zinc-950/50 p-4 rounded-2xl border border-white/5 max-w-2xl">
                        {workout.objective}
                    </p>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Exercise List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white">Exercícios</h2>
                    </div>

                    {workout.exercises.length === 0 ? (
                        <div className="text-center py-16 bg-zinc-900/30 border border-white/5 rounded-3xl border-dashed">
                            <Dumbbell size={40} className="mx-auto text-zinc-700 mb-4" />
                            <p className="text-zinc-500">Este treino ainda não tem exercícios.</p>
                            <p className="text-zinc-600 text-sm">Adicione o primeiro ao lado →</p>
                        </div>
                    ) : (
                        workout.exercises.map((ex, idx) => (
                            <div key={ex.id} className="bg-zinc-900/70 border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500 mt-1">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{ex.name}</h3>
                                            <div className="flex gap-3 text-sm text-zinc-400 mt-1">
                                                <span className="flex items-center gap-1"><Repeat size={14} className="text-[#ef4444]" /> {ex.sets} x {ex.reps}</span>
                                                <span className="flex items-center gap-1"><Dumbbell size={14} className="text-blue-500" /> {ex.weight}kg</span>
                                                <span className="flex items-center gap-1"><Clock size={14} className="text-yellow-500" /> {ex.rest_seconds}s</span>
                                            </div>
                                            {ex.notes && <p className="text-xs text-zinc-500 mt-2 italic">"{ex.notes}"</p>}
                                            {ex.media_url && (
                                                <a href={ex.media_url} target="_blank" className="inline-flex items-center gap-1 text-xs text-blue-400 mt-2 hover:underline">
                                                    <Video size={12} /> Ver Vídeo
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <form action={async () => {
                                        "use server"
                                        await deleteExercise(ex.id, workout.id)
                                    }}>
                                        <button className="text-zinc-600 hover:text-red-500 p-2 rounded-lg transition-colors" title="Remover Exercício">
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Right Column: Add Form */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 sticky top-8 shadow-2xl">
                        <div className="flex items-center gap-2 mb-6 text-[#ef4444]">
                            <Plus size={20} />
                            <h2 className="font-bold text-lg">Adicionar Exercício</h2>
                        </div>

                        <form action={async (formData) => {
                            "use server"
                            await addExercise(workout.id, formData);
                        }} className="space-y-4">

                            <div>
                                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Nome do Exercício</label>
                                <input name="name" required placeholder="Ex: Supino Reto"
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#ef4444] transition-colors" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Séries</label>
                                    <input name="sets" type="number" defaultValue="3"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#ef4444]" />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Repetições</label>
                                    <input name="reps" type="number" defaultValue="12"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#ef4444]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Carga (kg)</label>
                                    <input name="weight" type="number" step="0.5" placeholder="0"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#ef4444]" />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Descanso (s)</label>
                                    <input name="rest" type="number" defaultValue="60"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#ef4444]" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Link do Vídeo (Youtube)</label>
                                <input name="video_url" placeholder="https://..."
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#ef4444]" />
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Observações</label>
                                <textarea name="notes" rows={2} placeholder="Ex: Controlar a descida..."
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[#ef4444] resize-none" />
                            </div>

                            <button type="submit" className="w-full bg-[#ef4444] hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2">
                                <CheckCircle2 size={18} /> Salvar Exercício
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
