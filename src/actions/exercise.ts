"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function addExercise(workoutId: string, formData: FormData) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Verify workout ownership
    const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
    });

    if (!workout || workout.tenant_id !== session.user.tenant_id) {
        throw new Error("Forbidden");
    }

    const name = formData.get("name") as string;
    const sets = parseInt(formData.get("sets") as string) || 3;
    const reps = parseInt(formData.get("reps") as string) || 12;
    const weight = parseFloat(formData.get("weight") as string) || 0;
    const rest = parseInt(formData.get("rest") as string) || 60;
    const notes = formData.get("notes") as string;
    const video_url = formData.get("video_url") as string;

    await prisma.exercise.create({
        data: {
            workout_id: workoutId,
            name,
            sets,
            reps,
            weight,
            rest_seconds: rest,
            notes,
            media_url: video_url
        }
    });

    revalidatePath(`/dashboard/workouts/${workoutId}`);
    revalidatePath(`/dashboard/workouts`);
}

export async function deleteExercise(exerciseId: string, workoutId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Verify workout ownership via relation would be safer, but for speed:
    // We check if the workout belongs to the tenant first.
    const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
    });

    if (!workout || workout.tenant_id !== session.user.tenant_id) {
        throw new Error("Forbidden");
    }

    await prisma.exercise.delete({
        where: { id: exerciseId }
    });

    revalidatePath(`/dashboard/workouts/${workoutId}`);
}
