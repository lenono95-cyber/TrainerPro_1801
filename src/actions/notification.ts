"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------
// NOTIFICATION ACTIONS
// ---------------------------------------------------------

export async function getNotifications() {
    const session = await getSession();
    if (!session) return [];

    const notifications = await prisma.notification.findMany({
        where: { user_id: session.user.id },
        orderBy: { created_at: "desc" },
        take: 50,
    });

    return notifications;
}

export async function markNotificationAsRead(id: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        await prisma.notification.update({
            where: { id },
            data: { read: true },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
        return { success: false };
    }
}

export async function createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: unknown;
}) {
    try {
        await prisma.notification.create({
            data: {
                user_id: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: data.data || null as any,
            },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return { success: false };
    }
}

export async function getUnreadCount() {
    const session = await getSession();
    if (!session) return 0;

    const count = await prisma.notification.count({
        where: {
            user_id: session.user.id,
            read: false,
        },
    });

    return count;
}
