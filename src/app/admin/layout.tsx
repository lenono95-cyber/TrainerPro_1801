import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // Protect admin routes - only SUPER_ADMIN allowed
    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            {children}
        </div>
    );
}
