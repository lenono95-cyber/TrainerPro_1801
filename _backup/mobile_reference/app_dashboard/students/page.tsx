import { getStudents, deleteStudent } from "@/actions/student";
import Link from "next/link";
import { Plus, User, Trash2, Dumbbell, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const students = await getStudents();

    return (
        <div className="p-8 pb-32">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Alunos</h1>
                    <p className="text-zinc-500">Gerencie seus alunos e seus acessos.</p>
                </div>
                <Link
                    href="/dashboard/students/new"
                    className="bg-[#ef4444] hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center gap-2"
                >
                    <Plus size={20} /> Novo Aluno
                </Link>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-3xl border-dashed">
                    <User size={48} className="mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500 text-lg font-medium">Nenhum aluno encontrado.</p>
                    <p className="text-zinc-600 mb-6">Cadastre o primeiro aluno para começar.</p>
                    <Link href="/dashboard/students/new" className="text-[#ef4444] hover:underline font-bold">
                        Cadastrar Agora
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <div key={student.id} className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 hover:border-[#ef4444]/30 transition-all group relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-[#ef4444] transition-colors">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{student.user.name}</h3>
                                        <p className="text-sm text-zinc-500">{student.user.email}</p>
                                    </div>
                                </div>

                                <form action={async () => {
                                    "use server"
                                    await deleteStudent(student.id)
                                }}>
                                    <button className="text-zinc-600 hover:text-red-500 p-2 rounded-lg transition-colors" title="Remover Aluno">
                                        <Trash2 size={18} />
                                    </button>
                                </form>
                            </div>

                            <div className="flex gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border ${student.status === 'ACTIVE'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                    }`}>
                                    {student.status === 'ACTIVE' ? 'Ativo' : student.status}
                                </span>
                                <span className="bg-zinc-950 text-zinc-400 border border-white/5 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                    <ShieldCheck size={10} /> Acesso de Estudante
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
