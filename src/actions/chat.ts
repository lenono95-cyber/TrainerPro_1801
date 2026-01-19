"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * Sends a message to another user.
 */
export async function sendMessage(receiverId: string, content: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    if (!content.trim()) return { success: false, error: "Message content cannot be empty" };

    try {
        await prisma.message.create({
            data: {
                tenant_id: session.user.tenant_id,
                sender_id: session.user.id,
                receiver_id: receiverId,
                content: content,
            }
        });

        revalidatePath("/dashboard/chat");
        return { success: true };
    } catch (e) {
        console.error("Failed to send message:", e);
        return { success: false, error: "Failed to send message" };
    }
}

/**
 * Retrieves the message history between the current user and another user.
 */
export async function getMessages(otherUserId: string) {
    const session = await getSession();
    if (!session) return [];

    const messages = await prisma.message.findMany({
        where: {
            tenant_id: session.user.tenant_id,
            OR: [
                { sender_id: session.user.id, receiver_id: otherUserId },
                { sender_id: otherUserId, receiver_id: session.user.id }
            ]
        },
        orderBy: { created_at: "asc" }
    });

    return messages;
}

/**
 * Lists all conversations for the current user (Trainer).
 * Returns a list of users (Students) with whom the trainer interacts.
 * For now, returns all ACTIVE students as potential chats.
 */
export async function getConversations() {
    const session = await getSession();
    if (!session) return [];

    // For trainers, we want to chat with Students.
    // Ideally we would fetch distinct sender/receiver IDs from messages,
    // but to keep it simple and ensure all students appear, we fetch students.

    // Check if user is a student?
    if (session.user.role === 'STUDENT') {
        const studentProfile = await prisma.student.findUnique({
            where: { user_id: session.user.id },
            include: { trainer: true }
        });

        // If student has a trainer assigned, return trainer as the only conversation
        if (studentProfile?.trainer) {
            return [{
                id: studentProfile.trainer.id,
                name: studentProfile.trainer.name || "Treinador",
                email: studentProfile.trainer.email,
                role: "TRAINER"
            }];
        }

        // If no trainer assigned, could return admin users generally. 
        // For MVP, lets return all Admins/Trainers of the tenant
        const trainers = await prisma.user.findMany({
            where: {
                tenant_id: session.user.tenant_id,
                role: { in: ["ADMIN", "TRAINER"] }
            },
            select: { id: true, name: true, email: true, role: true }
        });
        return trainers;
    }

    // Role is TRAINER/ADMIN: Return all Active Students
    // Ideally, we could also fetch users we have chatted with who are not 'ACTIVE' somehow, 
    // but for this MVP, listing all active students is a good way to start a conversation.
    const students = await prisma.student.findMany({
        where: {
            tenant_id: session.user.tenant_id,
            status: "ACTIVE"
        },
        include: {
            user: { select: { id: true, name: true, email: true, image: true } }
        },
        orderBy: { created_at: "desc" }
    });

    return students.map((s: typeof students[number]) => ({
        id: s.user.id,
        name: s.user.name || "Sem Nome",
        email: s.user.email,
        image: s.user.image,
        role: "STUDENT" as const
    }));
}
