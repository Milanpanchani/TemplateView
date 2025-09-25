import { NextRequest, NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
    "/login",
    "/signup", 
    "/otp"
];

// Define admin routes that require ADMIN role
const adminRoutes = [
    "/admin"
];

// Function to check if path is an admin route
function isAdminRoute(pathname: string): boolean {
    return pathname.startsWith("/admin");
}

interface TokenPayload {
    userId: string;
    role: "ADMIN" | "USER";
    iat: number;
    exp: number;
}

// Simple JWT decode function for Edge Runtime
function decodeToken(token: string): TokenPayload | null {
    try {
        // Split the JWT token
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode the payload (middle part)
        const payload = parts[1];
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
            return null;
        }

        return decodedPayload as TokenPayload;
    } catch (error) {
        return null;
    }
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("token");

    // Debug logging (minimal)
    console.log("🔍 Middleware:", pathname, token ? "✅ Token" : "❌ No token");

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    // Check if the current path is an admin route
    const isAdminRouteCheck = isAdminRoute(pathname);


    // If it's a public route, allow access without authentication
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // If no token and not a public route, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Decode the token
    const decodedToken = decodeToken(token.value);
    
    // If token is invalid, redirect to login
    if (!decodedToken) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token"); // Clear invalid token
        return response;
    }

    // If it's an admin route, check if user has ADMIN role
    if (isAdminRouteCheck) {
        if (decodedToken.role !== "ADMIN") {
            // Regular users trying to access admin routes get redirected to home
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // For all other routes, allow access (both ADMIN and USER can access)
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}