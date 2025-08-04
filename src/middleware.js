import { NextResponse } from "next/server";

export async function middleware(request) {
    const pathname = request.nextUrl.pathname;

    const refreshToken = request.cookies.get("refreshToken")?.value || "";
    const isLoggedIn = !!refreshToken;

    const restrictedPaths = ["/dashboard", "/dashboard/introductory",
        "/dashboard/player-dashboard", "/dashboard/bookmarked-videos",
        "/dashboard/profile", "/dashboard/search", "/subscription-plan","/mycart"];
    const authPaths = ["/login","/verify-otp","/"];

    // Static file handling (skip middleware for these)
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".woff2") ||
        pathname.endsWith(".css") ||
        pathname.endsWith(".js")
    ) {
        return NextResponse.next();
    }


    if (!isLoggedIn && restrictedPaths.some(restrictedPaths => pathname.includes(restrictedPaths))) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    

    // If logged in, prevent access to the login page
    if (isLoggedIn && authPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}
