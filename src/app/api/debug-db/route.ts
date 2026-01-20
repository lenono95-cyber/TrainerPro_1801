import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Force Node.js runtime explicitely

export async function GET() {
    try {
        console.log("[DEBUG-DB] Testing database connection...");

        // 0. Test raw connection (Simplest check)
        try {
            await prisma.$queryRaw`SELECT 1`;
            console.log("[DEBUG-DB] Raw query SELECT 1 successful");
        } catch (e: any) {
            console.error("[DEBUG-DB] Raw query failed:", e);
            // Don't throw yet, try to collect env info
        }

        // 1. Check Env Var (Masked)
        const dbUrl = process.env.DATABASE_URL;
        const maskedUrl = dbUrl
            ? `${dbUrl.substring(0, 15)}...${dbUrl.substring(dbUrl.length - 5)}`
            : "UNDEFINED";

        console.log(`[DEBUG-DB] DATABASE_URL: ${maskedUrl}`);

        // 2. Simple Query
        const start = Date.now();
        let userCount = -1;
        try {
            userCount = await prisma.user.count();
        } catch (e) {
            console.error("[DEBUG-DB] Count query failed", e);
        }
        const duration = Date.now() - start;

        // 3. Check specific admin user
        let adminUser = null;
        try {
            adminUser = await prisma.user.findUnique({
                where: { email: 'admin@trainerpro.com' },
                select: { id: true, email: true, role: true, password: true }
            });
        } catch (e) {
            console.error("[DEBUG-DB] Admin lookup failed", e);
        }

        const passwordHashStart = adminUser?.password ? adminUser.password.substring(0, 10) : "N/A";

        return NextResponse.json({
            status: userCount >= 0 ? "SUCCESS" : "PARTIAL_ERROR",
            message: "Database connection check complete",
            latency: `${duration}ms`,
            userCount,
            adminUserFound: !!adminUser,
            adminEmail: adminUser?.email,
            passwordHashStart: passwordHashStart,
            env: {
                DATABASE_URL: maskedUrl,
                NEXTAUTH_URL: process.env.NEXTAUTH_URL,
                NODE_ENV: process.env.NODE_ENV,
                RUNTIME: process.release?.name || 'unknown'
            }
        });

    } catch (error: any) {
        console.error("[DEBUG-DB] Fatal Error:", error);
        return NextResponse.json({
            status: "FATAL_ERROR",
            message: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
