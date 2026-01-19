"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// ---------------------------------------------------------
// SUPER ADMIN ACTIONS
// ---------------------------------------------------------

export async function getAllTenants() {
    const session = await getSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized");
    }

    const tenants = await prisma.tenant.findMany({
        include: {
            users: {
                where: { is_owner: true },
                select: { email: true, name: true },
            },
            students: {
                where: { status: "ACTIVE" },
            },
        },
        orderBy: { created_at: "desc" },
    });

    return tenants.map((t: typeof tenants[number]) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        status: t.status,
        primaryColor: t.primaryColor,
        subscription_plan: t.subscription_plan,
        owner_email: t.users[0]?.email || "N/A",
        owner_name: t.users[0]?.name || "N/A",
        active_students_count: t.students.length,
        created_at: t.created_at,
    }));
}

export async function createTenant(data: {
    name: string;
    type?: string;
    primaryColor?: string;
    ownerEmail: string;
    ownerName: string;
    ownerPassword: string;
}) {
    const session = await getSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized");
    }

    const { hash } = await import("bcryptjs");
    const hashedPassword = await hash(data.ownerPassword, 10);

    try {
        const tenant = await prisma.tenant.create({
            data: {
                name: data.name,
                type: data.type || "personal",
                primaryColor: data.primaryColor || "#ef4444",
                status: "active",
                users: {
                    create: {
                        email: data.ownerEmail,
                        name: data.ownerName,
                        password: hashedPassword,
                        role: "ADMIN",
                        is_owner: true,
                    },
                },
            },
        });

        return { success: true, tenant };
    } catch (error) {
        console.error("Failed to create tenant:", error);
        return { success: false, error: "Failed to create tenant" };
    }
}

export async function toggleTenantStatus(tenantId: string, status: string) {
    const session = await getSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { status },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to toggle tenant status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function getAuditLogs(limit = 100) {
    const session = await getSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized");
    }

    const logs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { created_at: "desc" },
    });

    return logs;
}

export async function logAudit(data: {
    action: string;
    target_resource: string;
    details?: string;
    ip_address: string;
}) {
    const session = await getSession();
    if (!session) return;

    try {
        await prisma.auditLog.create({
            data: {
                actor_id: session.user.id,
                actor_email: session.user.email || "unknown",
                action: data.action,
                target_resource: data.target_resource,
                details: data.details,
                ip_address: data.ip_address,
            },
        });
    } catch (error) {
        console.error("Failed to log audit:", error);
    }
}
