import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    const token = bearerToken || cookieToken

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Missing token'
      }, { status: 401 })
    }

    const JWT_SECRET = 'template-marketplace-jwt-secret-key-2024'
    let decoded: { userId?: string; role?: string; exp?: number }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; role?: string; exp?: number }
    } catch (_e: unknown) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 401 })
    }

    const userId = decoded?.userId as string | undefined
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token payload'
      }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // Ensure the presented token matches the latest stored token (prevents reuse of old tokens)
    if (user.token && user.token !== token) {
      return NextResponse.json({
        success: false,
        error: 'Token no longer valid'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      isVerified: user.isVerified
    })
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 })
  }
}


