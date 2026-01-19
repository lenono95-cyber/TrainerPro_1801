import { AppLayout } from "@/components/layout/AppLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Determine role. Fallback to STUDENT if something is weird, 
    // but usually authOptions guarantees role presence.
    const role = session.user.role || "STUDENT";

    return (
        <AppLayout userRole={role} primaryColor="#ef4444">
            {children}
        </AppLayout>
    );
}
