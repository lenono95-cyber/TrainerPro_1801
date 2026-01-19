"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getWorkouts() {
    const session = await getSession();
    if (!session) return [];

    const workouts = await prisma.workout.findMany({
        where: {
            tenant_id: session.user.tenant_id,
        },
        include: {
            student: {
                select: { user: { select: { name: true } } },
            },
            exercises: true,
        },
        orderBy: { created_at: "desc" },
    });

    return workouts;
}

export async function getStudentWorkouts() {
    const session = await getSession();
    if (!session) return [];

    // Find the student profile for this user
    const studentProfile = await prisma.student.findUnique({
        where: { user_id: session.user.id }
    });

    if (!studentProfile) return [];

    const workouts = await prisma.workout.findMany({
        where: {
            tenant_id: session.user.tenant_id,
            student_id: studentProfile.id
        },
        include: {
            exercises: true,
            trainer: {
                select: { name: true }
            }
        },
        orderBy: { created_at: "desc" },
    });

    return workouts;
}

export async function createWorkout(formData: FormData) {
    const session = await getSession();
    if (!session) redirect("/login");

    const name = formData.get("name") as string;
    const objective = formData.get("objective") as string;
    const student_id = formData.get("student_id") as string;

    // Basic validation (in prod used Zod)
    if (!name || !student_id) {
        throw new Error("Missing required fields");
    }

    await prisma.workout.create({
        data: {
            tenant_id: session.user.tenant_id,
            trainer_id: session.user.id,
            student_id,
            name,
            objective,
        },
    });

    revalidatePath("/dashboard/workouts");
    redirect("/dashboard/workouts");
}

export async function getStudentWorkoutDetail(workoutId: string) {
    const session = await getSession();
    if (!session) return null;

    const studentProfile = await prisma.student.findUnique({
        where: { user_id: session.user.id }
    });

    if (!studentProfile) return null;

    const workout = await prisma.workout.findUnique({
        where: {
            id: workoutId,
            tenant_id: session.user.tenant_id,
            student_id: studentProfile.id
        },
        include: {
            exercises: {
                orderBy: { created_at: "asc" }
            },
            trainer: {
                select: { name: true }
            }
        }
    });

    return workout;
}

export async function deleteWorkout(workoutId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Verify ownership/tenant before delete
    const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
    });

    if (!workout || workout.tenant_id !== session.user.tenant_id) {
        throw new Error("Forbidden");
    }

    await prisma.workout.delete({
        where: { id: workoutId },
    });

    revalidatePath("/dashboard/workouts");
}
