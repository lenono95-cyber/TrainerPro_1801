"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

type AddMeasurementData = {
    studentId: string;
    weight?: number;
    height?: number;
    bodyFat?: number;
    muscleMass?: number;
    notes?: string;
    date: string; // ISO
}

export async function addMeasurement(data: AddMeasurementData) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        await prisma.bodyMeasurement.create({
            data: {
                student_id: data.studentId,
                weight: data.weight,
                height: data.height,
                body_fat: data.bodyFat,
                muscle_mass: data.muscleMass,
                notes: data.notes,
                date: new Date(data.date),
            }
        });

        revalidatePath(`/dashboard/tracking`);
        return { success: true };
    } catch (e) {
        console.error("Failed to add measurement", e);
        return { success: false, error: "Failed to add measurement" };
    }
}

export async function getMeasurements(studentId: string) {
    const session = await getSession();
    if (!session) return [];

    const measurements = await prisma.bodyMeasurement.findMany({
        where: { student_id: studentId },
        orderBy: { date: "asc" }
    });

    return measurements;
}
