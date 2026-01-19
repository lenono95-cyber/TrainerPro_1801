import { createStudent } from "@/actions/student";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, User, Mail } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function NewStudentPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    return (
        <div className="p-8 pb-32 max-w-2xl mx-auto">
            <header className="mb-8">
                <Link href="/dashboard/students" className="text-zinc-500 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
                    <ArrowLeft size={16} /> Voltar para lista
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Novo Aluno</h1>
                <p className="text-zinc-500">Cadastre um aluno para começar a criar treinos.</p>
            </header>

            <form action={createStudent} className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 space-y-6">

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block pl-1">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                name="name"
                                required
                                type="text"
                                placeholder="Ex: João Silva"
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm outline-none focus:border-[#ef4444] transition-colors shadow-inner"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block pl-1">Email de Acesso</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                name="email"
                                required
                                type="email"
                                placeholder="joao@exemplo.com"
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm outline-none focus:border-[#ef4444] transition-colors shadow-inner"
                            />
                        </div>
                        <p className="text-xs text-zinc-600 mt-2 pl-1">
                            * Uma senha provisória <span className="text-zinc-400 font-mono bg-zinc-800 px-1 rounded">123456</span> será criada.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button type="submit" className="w-full bg-[#ef4444] hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2">
                        <CheckCircle2 size={20} /> Cadastrar Aluno
                    </button>
                </div>
            </form>
        </div>
    );
}
