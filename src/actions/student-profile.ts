"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------
// STUDENT PROFILE ACTIONS
// ---------------------------------------------------------

export async function updateProfile(data: {
    age?: number;
    gender?: string;
    weight?: number;
    height?: number;
    goal?: string;
    level?: string;
    injuries?: string;
}) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        // Find student profile linked to this user
        const student = await prisma.student.findUnique({
            where: { user_id: session.user.id },
        });

        if (!student) {
            return { success: false, error: "Student profile not found" };
        }

        await prisma.auditLog.create({
            data: {
                actor_id: session.user.id,
                actor_email: session.user.email || "unknown",
                action: "UPDATE_PROFILE",
                target_resource: "Student",
                details: `Updated profile for student ${session.user.id}`,
                ip_address: "0.0.0.0",
            },
        });

        await prisma.student.update({
            where: { id: student.id },
            data: {
                age: data.age,
                gender: data.gender,
                weight: data.weight,
                height: data.height,
                goal: data.goal,
                level: data.level,
                injuries: data.injuries,
            },
        });

        revalidatePath("/dashboard/student/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function getEvolution() {
    const session = await getSession();
    if (!session) return null;

    try {
        const student = await prisma.student.findUnique({
            where: { user_id: session.user.id },
            include: {
                measurements: {
                    orderBy: { date: "asc" },
                },
                assessments: {
                    orderBy: { date: "asc" },
                },
                logs: {
                    orderBy: { date: "desc" },
                    take: 10,
                },
            },
        });

        return student;
    } catch (error) {
        console.error("Failed to get evolution data:", error);
        return null;
    }
}

export async function getStudentProfile() {
    const session = await getSession();
    if (!session) return null;

    const student = await prisma.student.findUnique({
        where: { user_id: session.user.id },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true,
                },
            },
            trainer: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    return student;
}
