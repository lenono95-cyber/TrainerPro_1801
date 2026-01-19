import { createWorkout } from "@/actions/workout";
import { getStudents } from "@/actions/student";
import Link from "next/link";

export default async function NewWorkoutPage() {
    const students = await getStudents();

    if (students.length === 0) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-6 rounded-3xl max-w-md text-center">
                    <p className="font-medium">Você precisa ter alunos ativos para criar um treino.</p>
                    <Link href="/dashboard" className="underline mt-4 inline-block text-sm hover:text-yellow-400 transition">Voltar ao início</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 flex justify-center pb-32">
            <div className="w-full max-w-2xl">
                <header className="mb-8">
                    <Link href="/dashboard/workouts" className="text-zinc-500 hover:text-white text-sm mb-4 inline-block transition-colors">
                        ← Voltar
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Criar Novo Treino</h1>
                    <p className="text-zinc-400 mt-1">Defina o aluno e o objetivo principal.</p>
                </header>

                <div className="bg-zinc-900/70 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-xl">
                    <form action={createWorkout} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Nome do Treino</label>
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="Ex: Hipertrofia Fase 1"
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-[#ef4444] focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Objetivo</label>
                            <textarea
                                name="objective"
                                rows={4}
                                placeholder="Descreva o foco deste treino..."
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-[#ef4444] focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Selecionar Aluno</label>
                            <div className="relative">
                                <select
                                    name="student_id"
                                    required
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-white appearance-none focus:ring-2 focus:ring-[#ef4444] outline-none transition-all"
                                >
                                    <option value="" className="bg-zinc-900 text-zinc-500">-- Escolha um aluno --</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id} className="bg-zinc-900">
                                            {s.user.name} ({s.user.email})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-[#ef4444] text-white py-4 rounded-xl font-bold hover:bg-red-600 transition shadow-lg shadow-red-500/20"
                            >
                                Criar Treino
                            </button>
                            <Link
                                href="/dashboard/workouts"
                                className="flex-1 bg-zinc-800 text-zinc-300 py-4 rounded-xl font-medium hover:bg-zinc-700 transition text-center"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
