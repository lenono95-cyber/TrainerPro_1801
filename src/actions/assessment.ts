"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------
// PHYSICAL ASSESSMENT CRUD
// ---------------------------------------------------------

type CreateAssessmentData = {
    studentId: string;
    weight: number;
    height: number;
    age_at_assessment: number;
    neck_cm?: number;
    chest_cm?: number;
    waist_cm?: number;
    abdomen_cm?: number;
    hips_cm?: number;
    arm_right_cm?: number;
    arm_left_cm?: number;
    thigh_right_cm?: number;
    thigh_left_cm?: number;
    calf_cm?: number;
    skinfold_triceps?: number;
    skinfold_subscapular?: number;
    skinfold_chest?: number;
    skinfold_midaxillary?: number;
    skinfold_suprailiac?: number;
    skinfold_abdominal?: number;
    skinfold_thigh?: number;
    bmi: number;
    body_fat_percentage?: number;
    waist_hip_ratio?: number;
    lean_mass_kg?: number;
    fat_mass_kg?: number;
    photo_front_url?: string;
    photo_back_url?: string;
    photo_side_url?: string;
    notes?: string;
};

export async function createAssessment(data: CreateAssessmentData) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        const assessment = await prisma.physicalAssessment.create({
            data: {
                tenant_id: session.user.tenant_id,
                student_id: data.studentId,
                weight: data.weight,
                height: data.height,
                age_at_assessment: data.age_at_assessment,
                neck_cm: data.neck_cm,
                chest_cm: data.chest_cm,
                waist_cm: data.waist_cm,
                abdomen_cm: data.abdomen_cm,
                hips_cm: data.hips_cm,
                arm_right_cm: data.arm_right_cm,
                arm_left_cm: data.arm_left_cm,
                thigh_right_cm: data.thigh_right_cm,
                thigh_left_cm: data.thigh_left_cm,
                calf_cm: data.calf_cm,
                skinfold_triceps: data.skinfold_triceps,
                skinfold_subscapular: data.skinfold_subscapular,
                skinfold_chest: data.skinfold_chest,
                skinfold_midaxillary: data.skinfold_midaxillary,
                skinfold_suprailiac: data.skinfold_suprailiac,
                skinfold_abdominal: data.skinfold_abdominal,
                skinfold_thigh: data.skinfold_thigh,
                bmi: data.bmi,
                body_fat_percentage: data.body_fat_percentage,
                waist_hip_ratio: data.waist_hip_ratio,
                lean_mass_kg: data.lean_mass_kg,
                fat_mass_kg: data.fat_mass_kg,
                photo_front_url: data.photo_front_url,
                photo_back_url: data.photo_back_url,
                photo_side_url: data.photo_side_url,
                notes: data.notes,
            },
        });

        revalidatePath("/dashboard/assessments");
        return { success: true, assessment };
    } catch (error) {
        console.error("Failed to create assessment:", error);
        return { success: false, error: "Failed to create assessment" };
    }
}

export async function getAssessments(studentId: string) {
    const session = await getSession();
    if (!session) return [];

    const assessments = await prisma.physicalAssessment.findMany({
        where: {
            tenant_id: session.user.tenant_id,
            student_id: studentId,
            deleted_at: null,
        },
        orderBy: { date: "desc" },
    });

    return assessments;
}

export async function deleteAssessment(id: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        await prisma.physicalAssessment.update({
            where: { id },
            data: { deleted_at: new Date() },
        });

        revalidatePath("/dashboard/assessments");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete assessment:", error);
        return { success: false, error: "Failed to delete assessment" };
    }
}
