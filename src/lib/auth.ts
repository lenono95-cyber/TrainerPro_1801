import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("[AUTH] Authorize attempt for:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("[AUTH] Missing email or password");
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user) {
                        console.log("[AUTH] User not found:", credentials.email);
                        return null;
                    }

                    if (!user.password) {
                        console.log("[AUTH] User has no password set:", credentials.email);
                        return null;
                    }

                    const isPasswordValid = await compare(credentials.password, user.password);
                    console.log("[AUTH] Password valid:", isPasswordValid);

                    if (!isPasswordValid) {
                        return null;
                    }

                    console.log("[AUTH] Login successful for:", user.email, "Role:", user.role);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        tenant_id: user.tenant_id,
                    };
                } catch (error) {
                    console.error("[AUTH] Database error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.tenant_id = token.tenant_id as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.tenant_id = user.tenant_id;
            }
            return token;
        },
    },
};
