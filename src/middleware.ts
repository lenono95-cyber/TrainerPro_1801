import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;

        // Redirect root to admin dashboard
        if (pathname === "/") {
            return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Protect /admin routes - only SUPER_ADMIN
                if (req.nextUrl.pathname.startsWith("/admin")) {
                    return token?.role === "SUPER_ADMIN";
                }
                // All other protected routes just need a token
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: ["/((?!login|api|register|_next/static|_next/image|favicon.ico).*)"],
};
