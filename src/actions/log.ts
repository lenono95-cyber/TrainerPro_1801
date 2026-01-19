"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

interface LogPayload {
    student_id: string; // Used for validation
    workout_id: string;
    duration_minutes: number;
    exercises_done: {
        name: string;
        sets_done: number;
        weight_used: number;
        reps_done?: number; // Optional in UI, but good to have
    }[];
}

export async function saveWorkoutLog(payload: LogPayload) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        // Verify Student Profile
        const studentProfile = await prisma.student.findUnique({
            where: { user_id: session.user.id }
        });

        if (!studentProfile || studentProfile.id !== payload.student_id) {
            return { success: false, error: "Invalid Student Profile" };
        }

        // Create Log
        await prisma.workoutLog.create({
            data: {
                tenant_id: session.user.tenant_id,
                student_id: studentProfile.id,
                workout_id: payload.workout_id,
                duration_seconds: payload.duration_minutes * 60, // Convert to seconds
                exercises: {
                    create: payload.exercises_done.map(ex => ({
                        exercise_name: ex.name,
                        sets_done: ex.sets_done || 0,
                        reps_done: ex.reps_done || 0,
                        weight_used: ex.weight_used || 0
                    }))
                }
            }
        });

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to save log" };
    }
}
