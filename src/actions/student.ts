"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getStudents() {
    const session = await getSession();
    if (!session) return [];

    const students = await prisma.student.findMany({
        where: {
            tenant_id: session.user.tenant_id,
        },
        include: {
            user: {
                select: { name: true, email: true },
            },
        },
        orderBy: { created_at: "desc" },
    });

    return students;
}

export async function createStudent(formData: FormData) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!name || !email) throw new Error("Nome e Email são obrigatórios");

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("Usuário já existe com este email");
    }

    const hashedPassword = await hash("123456", 10);

    // Transaction to ensure both User and Student are created
    await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "STUDENT",
                tenant_id: session.user.tenant_id
            }
        });

        await tx.student.create({
            data: {
                user_id: newUser.id,
                tenant_id: session.user.tenant_id,
                status: "ACTIVE"
            }
        });
    });

    revalidatePath("/dashboard/students");
}

export async function deleteStudent(studentId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const student = await prisma.student.findUnique({
        where: { id: studentId }
    });

    if (!student || student.tenant_id !== session.user.tenant_id) {
        throw new Error("Forbidden");
    }

    // Deleting the User will cascade delete the Student profile
    await prisma.user.delete({
        where: { id: student.user_id }
    });

    revalidatePath("/dashboard/students");
}
