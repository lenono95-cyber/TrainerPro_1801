import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("[DEBUG-DB] Testing database connection...");

        // 1. Check Env Var (Masked)
        const dbUrl = process.env.DATABASE_URL;
        const maskedUrl = dbUrl
            ? `${dbUrl.substring(0, 15)}...${dbUrl.substring(dbUrl.length - 5)}`
            : "UNDEFINED";

        console.log(`[DEBUG-DB] DATABASE_URL: ${maskedUrl}`);

        // 2. Simple Query
        const start = Date.now();
        const userCount = await prisma.user.count();
        const duration = Date.now() - start;

        // 3. Check specific admin user
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@trainerpro.com' },
            select: { id: true, email: true, role: true, password: true } // password hash presence check
        });

        const hasPassword = !!adminUser?.password;
        const passwordHashStart = adminUser?.password ? adminUser.password.substring(0, 10) : "N/A";

        return NextResponse.json({
            status: "SUCCESS",
            message: "Database connection working",
            latency: `${duration}ms`,
            userCount,
            adminUserFound: !!adminUser,
            adminEmail: adminUser?.email,
            adminRole: adminUser?.role,
            passwordHashStart: passwordHashStart,
            env: {
                DATABASE_URL: maskedUrl,
                NEXTAUTH_URL: process.env.NEXTAUTH_URL,
                NODE_ENV: process.env.NODE_ENV
            }
        });

    } catch (error: any) {
        console.error("[DEBUG-DB] Check Failed:", error);
        return NextResponse.json({
            status: "ERROR",
            message: error.message,
            stack: error.stack,
            env: {
                DATABASE_URL: process.env.DATABASE_URL ? "DEFINED" : "MISSING"
            }
        }, { status: 500 });
    }
}
