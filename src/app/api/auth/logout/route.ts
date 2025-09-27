import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
    try {
        // Create response
        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully"
        });

        // Clear the token cookie
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: false, // Match OTP route settings
            sameSite: "lax", // Match OTP route settings
            maxAge: 0, // Expire immediately
            path: "/" // Match OTP route settings
        });

        // Clear the auth-status cookie
        response.cookies.set("auth-status", "", {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 0, // Expire immediately
            path: "/"
        });

        return response;
    } catch (_error) {
        return NextResponse.json({
            success: false,
            error: "Internal server error"
        }, { status: 500 });
    }
}
