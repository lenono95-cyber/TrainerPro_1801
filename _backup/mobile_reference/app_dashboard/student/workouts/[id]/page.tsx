import { getStudentWorkoutDetail } from "@/actions/workout";
import { StudentWorkoutRunner } from "@/components/workouts/StudentWorkoutRunner";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function StudentExecuteWorkoutPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const workout = await getStudentWorkoutDetail(params.id);

    if (!workout) {
        return notFound();
    }

    return (
        <StudentWorkoutRunner workout={workout} />
    );
}
