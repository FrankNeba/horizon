import { NextResponse, NextRequest } from "next/server";
import { getSession } from "./lib/session";



export async function middleware(request: NextRequest) {
    const session = await getSession();
    const path = request.nextUrl.pathname;

    // Protect all /admin paths except /admin/login
    if (path.startsWith("/admin") && path !== "/admin/login") {
        if (!session.isLoggedIn) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
