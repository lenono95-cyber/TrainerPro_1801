"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// ---------------------------------------------------------
// BILLING & SUBSCRIPTION ACTIONS
// ---------------------------------------------------------

export async function manageSubscription() {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // TODO: Integrate with Stripe/Payment provider
    // For now, return a placeholder URL

    return {
        success: true,
        url: "https://billing.stripe.com/placeholder", // Replace with actual Stripe portal URL
    };
}

export async function deleteAccount(userId: string) {
    const session = await getSession();
    if (!session || session.user.id !== userId) {
        throw new Error("Unauthorized");
    }

    try {
        // Soft delete: mark user and related data as deleted
        await prisma.user.update({
            where: { id: userId },
            data: {
                // In production, you might want to anonymize data instead
                email: `deleted_${userId}@deleted.com`,
                password: null,
            },
        });

        // Log the deletion
        await prisma.auditLog.create({
            data: {
                actor_id: userId,
                actor_email: session.user.email || "unknown",
                action: "DELETE_ACCOUNT",
                target_resource: "User",
                details: "User requested account deletion",
                ip_address: "0.0.0.0", // Get from request in production
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}

export async function getSubscriptionPlans() {
    const plans = await prisma.subscriptionPlan.findMany({
        where: { active: true },
        orderBy: { price: "asc" },
    });

    return plans;
}

export async function getPaymentHistory() {
    const session = await getSession();
    if (!session) return [];

    const payments = await prisma.payment.findMany({
        where: { tenant_id: session.user.tenant_id },
        orderBy: { created_at: "desc" },
        take: 50,
    });

    return payments;
}
