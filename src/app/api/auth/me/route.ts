import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple JWT decode function for Edge Runtime
function decodeToken(token: string): { userId: string; role: string; exp?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const payload = parts[1];
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
            return null;
        }
        
        return decodedPayload;
    } catch (_error) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token");
        
        if (!token) {
            return NextResponse.json({
                success: false,
                error: "No token provided"
            }, { status: 401 });
        }

        const decodedToken = decodeToken(token.value);
        
        if (!decodedToken) {
            return NextResponse.json({
                success: false,
                error: "Invalid token"
            }, { status: 401 });
        }

        // Get user info from database
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: "User not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: user
        });

    } catch (_error) {
        return NextResponse.json({
            success: false,
            error: "Internal server error"
        }, { status: 500 });
    }
}
