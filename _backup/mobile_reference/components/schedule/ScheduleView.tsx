"use client";

import React, { useState } from "react";
import { Plus, X, Calendar as CalendarIcon, Clock, User, Trash2 } from "lucide-react";
import { createEvent, cancelEvent } from "@/actions/schedule";
import { useRouter } from "next/navigation";

interface Event {
    id: string;
    title: string;
    start_time: Date;
    end_time: Date;
    studentName?: string;
    student_id?: string | null;
}

interface Student {
    id: string;
    name?: string | null;
}

interface ScheduleViewProps {
    initialEvents: Event[];
    students: Student[];
}

export function ScheduleView({ initialEvents, students }: ScheduleViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Generate next 14 days for the horizontal strip
    const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    // Filter events for selected date
    const eventsForDay = initialEvents.filter(e => {
        const eventDate = new Date(e.start_time);
        return (
            eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear()
        );
    });

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth();

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const time = formData.get("time") as string;
        const title = formData.get("title") as string;
        const studentId = formData.get("studentId") as string;

        // Construct dates
        const [hours, minutes] = time.split(":").map(Number);
        const start = new Date(selectedDate);
        start.setHours(hours, minutes, 0, 0);

        const end = new Date(start);
        end.setHours(start.getHours() + 1); // Default 1 hour duration

        await createEvent({
            title,
            start: start.toISOString(),
            end: end.toISOString(),
            studentId: studentId || undefined
        });

        setIsLoading(false);
        setIsModalOpen(false);
        router.refresh(); // Refresh server data
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Cancelar agendamento?")) return;
        await cancelEvent(id);
        router.refresh();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header / Date Strip */}
            <div className="mb-6">
                <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
                    {days.map((day, i) => {
                        const isSelected = isSameDay(day, selectedDate);
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(day)}
                                className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all snap-start ${isSelected
                                        ? "bg-[#ef4444] border-[#ef4444] text-white shadow-lg shadow-red-500/20 scale-105"
                                        : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800"
                                    }`}
                            >
                                <span className="text-xs font-medium uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                                <span className="text-xl font-bold">{day.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-between items-end px-1">
                    <div>
                        <h2 className="text-2xl font-bold text-white capitalize">
                            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h2>
                        <p className="text-zinc-500 text-sm">{eventsForDay.length} compromissos hoje</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-black hover:bg-zinc-200 font-bold p-3 rounded-xl flex items-center gap-2 text-sm transition-colors"
                    >
                        <Plus size={18} /> Novo
                    </button>
                </div>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-20">
                {eventsForDay.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                        <Clock className="mx-auto text-zinc-600 mb-3" size={32} />
                        <p className="text-zinc-500">Agenda livre para este dia.</p>
                    </div>
                ) : (
                    eventsForDay.map(event => (
                        <div key={event.id} className="group bg-zinc-900/60 backdrop-blur-sm border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-[#ef4444]/30 transition-all">
                            <div className="text-center min-w-[60px]">
                                <p className="font-bold text-lg text-white">
                                    {new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs text-zinc-500">1h</p>
                            </div>

                            <div className="flex-1 border-l border-white/10 pl-4">
                                <h4 className="font-bold text-white">{event.title}</h4>
                                {event.studentName && (
                                    <div className="flex items-center gap-1 text-xs text-[#ef4444] mt-1">
                                        <User size={12} />
                                        <span>{event.studentName}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleDelete(event.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* New Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Novo Agendamento</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">Título</label>
                                <input name="title" required placeholder="Ex: Treino de Perna" className="w-full bg-zinc-900 border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">Horário</label>
                                    <input name="time" type="time" required className="w-full bg-zinc-900 border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-1 ml-1">Aluno (Opcional)</label>
                                    <select name="studentId" className="w-full bg-zinc-900 border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#ef4444]">
                                        <option value="">-- Selecione --</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name || "Sem Nome"}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#ef4444] hover:bg-red-600 text-white font-bold py-4 rounded-xl mt-4 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? "Agendando..." : "Confirmar Agendamento"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
