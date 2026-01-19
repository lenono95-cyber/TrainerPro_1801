import { ProgressChart } from "@/components/tracking/ProgressChart";
import { getMeasurements, addMeasurement } from "@/actions/tracking";
import { getStudents } from "@/actions/student";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { User, Plus } from "lucide-react";
import Link from "next/link";

export default async function TrackingPage({ searchParams }: { searchParams: { studentId?: string } }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const students = await getStudents();
    const studentsList = students.map(s => ({
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        image: s.user.image
    }));

    const selectedStudentId = searchParams.studentId || (studentsList.length > 0 ? studentsList[0].id : null);

    let measurements = [];
    if (selectedStudentId) {
        const rawMeasurements = await getMeasurements(selectedStudentId);
        measurements = rawMeasurements.map(m => ({
            ...m,
            date: m.date.toISOString(), // Serialize Date to String
            created_at: m.created_at.toISOString() // Serialize Date to String
        }));
    }

    async function handleAddMeasurement(formData: FormData) {
        "use server";
        const weight = parseFloat(formData.get("weight") as string);
        const bodyFat = parseFloat(formData.get("bodyFat") as string);
        const date = formData.get("date") as string;

        await addMeasurement({
            studentId: selectedStudentId!,
            weight: isNaN(weight) ? undefined : weight,
            bodyFat: isNaN(bodyFat) ? undefined : bodyFat,
            date: date || new Date().toISOString()
        });

        redirect(`/dashboard/tracking?studentId=${selectedStudentId}`);
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full md:w-80 border-r border-white/5 bg-zinc-950/50 p-4 flex flex-col">
                <h1 className="text-2xl font-bold text-white mb-6 px-2">Evolução</h1>
                <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                    {studentsList.map(student => (
                        <Link
                            key={student.id}
                            href={`/dashboard/tracking?studentId=${student.id}`}
                            className={`p-3 rounded-xl flex items-center gap-3 transition-all border ${selectedStudentId === student.id
                                ? "bg-[#ef4444]/10 border-[#ef4444]"
                                : "bg-zinc-900/40 border-white/5 hover:bg-zinc-800"
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                                <User size={14} />
                            </div>
                            <span className={`text-sm font-medium ${selectedStudentId === student.id ? "text-white" : "text-zinc-400"}`}>
                                {student.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {!selectedStudentId ? (
                    <p className="text-zinc-500">Selecione um aluno para ver a evolução.</p>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <header className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">
                                Progresso de {studentsList.find(s => s.id === selectedStudentId)?.name}
                            </h2>
                        </header>

                        {/* Chart */}
                        <div className="min-h-[300px]">
                            <ProgressChart data={measurements} />
                        </div>

                        {/* Add Form */}
                        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-[#ef4444]" />
                                Registrar Avaliação
                            </h3>
                            <form action={handleAddMeasurement} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Data</label>
                                    <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-zinc-950 border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Peso (kg)</label>
                                    <input name="weight" type="number" step="0.1" placeholder="0.0" className="w-full bg-zinc-950 border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">% Gordura</label>
                                    <input name="bodyFat" type="number" step="0.1" placeholder="0.0" className="w-full bg-zinc-950 border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]" />
                                </div>
                                <div className="md:col-span-3">
                                    <button type="submit" className="w-full bg-[#ef4444] hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors">
                                        Salvar Registro
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* History Table */}
                        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden">
                            <table className="w-full text-left text-sm text-zinc-400">
                                <thead className="bg-white/5 text-zinc-300 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Peso</th>
                                        <th className="p-4">% Gordura</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {measurements.map(m => (
                                        <tr key={m.id} className="hover:bg-white/5">
                                            <td className="p-4">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4 text-white font-medium">{m.weight ? `${m.weight} kg` : '-'}</td>
                                            <td className="p-4">{m.body_fat ? `${m.body_fat}%` : '-'}</td>
                                        </tr>
                                    ))}
                                    {measurements.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-6 text-center text-zinc-600">Nenhum registro encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
