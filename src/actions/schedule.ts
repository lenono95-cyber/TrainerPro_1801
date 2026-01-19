"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getEvents(start?: Date, end?: Date) {
    const session = await getSession();
    if (!session) return [];

    // Simple fetch for now, can be optimized with range filters later
    const schedules = await prisma.schedule.findMany({
        where: {
            tenant_id: session.user.tenant_id,
            // Optimization: Filter by range if provided
            ...(start && end ? {
                start_time: {
                    gte: start,
                    lte: end
                }
            } : {})
        },
        include: {
            student: {
                select: { user: { select: { name: true } } }
            }
        },
        orderBy: { start_time: "asc" }
    });

    return schedules.map(s => ({
        ...s,
        studentName: s.student?.user.name
    }));
}

type CreateEventData = {
    title: string;
    start: string; // ISO string
    end: string;   // ISO string
    studentId?: string;
}

export async function createEvent(data: CreateEventData) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    if (!data.title || !data.start || !data.end) {
        throw new Error("Missing required fields");
    }

    try {
        await prisma.schedule.create({
            data: {
                tenant_id: session.user.tenant_id,
                trainer_id: session.user.id,
                title: data.title,
                student_id: data.studentId || null,
                start_time: new Date(data.start),
                end_time: new Date(data.end),
                status: "SCHEDULED"
            }
        });

        revalidatePath("/dashboard/schedule");
        return { success: true };
    } catch (e) {
        console.error("Failed to create event:", e);
        return { success: false, error: "Failed to create event" };
    }
}

export async function cancelEvent(id: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const event = await prisma.schedule.findUnique({
        where: { id }
    });

    if (!event || event.tenant_id !== session.user.tenant_id) {
        throw new Error("Forbidden");
    }

    await prisma.schedule.delete({
        where: { id }
    });

    revalidatePath("/dashboard/schedule");
    return { success: true };
}
