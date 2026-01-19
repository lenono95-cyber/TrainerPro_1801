"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------
// AUTO MESSAGE CONFIG (Templates)
// ---------------------------------------------------------

export async function getAutoMessageConfig() {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    let config = await prisma.autoMessageConfig.findUnique({
        where: { tenant_id: session.user.tenant_id },
    });

    // Create default config if doesn't exist
    if (!config) {
        config = await prisma.autoMessageConfig.create({
            data: {
                tenant_id: session.user.tenant_id,
                reminder_24h_text: "Lembrete: Você tem um treino agendado amanhã!",
                reminder_2h_text: "Seu treino começa em 2 horas!",
                reminder_now_text: "Seu treino está começando agora!",
                alert_missed_student_text: "Você perdeu seu treino agendado.",
                alert_missed_critical_text: "Atenção: Múltiplas faltas detectadas.",
                assessment_reminder_text: "Está na hora de fazer uma nova avaliação física!",
                photo_reminder_text: "Tire suas fotos de progresso!",
                motivational_workout_text: "Parabéns pelo treino! Continue assim!",
                motivational_streak_text: "Você está em uma sequência incrível!",
                motivational_record_text: "Novo recorde pessoal! 🎉",
                welcome_text: "Bem-vindo(a)! Estamos felizes em tê-lo(a) conosco!",
            },
        });
    }

    return config;
}

export async function updateAutoMessageConfig(data: Record<string, unknown>) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        const config = await prisma.autoMessageConfig.upsert({
            where: { tenant_id: session.user.tenant_id },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            update: data as any,
            create: {
                tenant_id: session.user.tenant_id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(data as any),
            },
        });

        revalidatePath("/dashboard/settings/messages");
        return { success: true, config };
    } catch (error) {
        console.error("Failed to update message config:", error);
        return { success: false, error: "Failed to update configuration" };
    }
}
