import { ScheduleView } from "@/components/schedule/ScheduleView";
import { getEvents } from "@/actions/schedule";
import { getStudents } from "@/actions/student";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SchedulePage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const events = await getEvents();
    const students = await getStudents();

    const formattedStudents = students.map(s => ({
        id: s.id,
        name: s.user.name
    }));

    return (
        <div className="p-6 h-screen overflow-hidden">
            <div className="max-w-md mx-auto h-full flex flex-col">
                <header className="mb-2">
                    <h1 className="text-xl font-bold text-zinc-400">Minha Agenda</h1>
                </header>

                <div className="flex-1 overflow-hidden">
                    <ScheduleView initialEvents={events} students={formattedStudents} />
                </div>
            </div>
        </div>
    );
}
