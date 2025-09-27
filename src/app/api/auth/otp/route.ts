import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'
import  jwt  from 'jsonwebtoken'


export async function POST(request: NextRequest) {
  try {
    // Get data from request
    const data = await request.json()
    // const parseData = userSchema.parse(data)
    const { otp, userId } = data
    // console.log(otp, userId);
    if(!otp || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OTP or userId'
      }, { status: 400 })
    }
    const existingOtp = await prisma.otpVerify.findUnique({
      where: {
        userId
      }
    })
    if (!existingOtp) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OTP'
      }, { status: 400 })
    }
    if(existingOtp.expireAt < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'OTP expired'
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    if(!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 400 })
    }

    const JWT_SECRET = 'template-marketplace-jwt-secret-key-2024';
    const token = jwt.sign({ userId , role: user.role }, JWT_SECRET , { expiresIn: '1h' })

    await prisma.$transaction([
        // Update user isVerified to true
        prisma.user.update({
          where: { id: userId },
          data: { 
            isVerified: true,
            token: token
         }
        }),
        // Delete the OTP record
        prisma.otpVerify.delete({
          where: { userId }
        })
      ])

    
    // Return success response with token set as HTTP cookie
    const response = NextResponse.json({
      success: true,
      responseData: "OTP verified successfully",
      token: token
    })

    // Set the token as an HTTP cookie (for server-side verification)
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: "lax", // More permissive for development
      maxAge: 60 * 60, // 1 hour (same as token expiry)
      path: "/" // Explicitly set path
    })

    // Set a non-httpOnly cookie for client-side authentication detection
    response.cookies.set("auth-status", "authenticated", {
      httpOnly: false, // Allow client-side access
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/"
    })


    return response
    
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
        // Validation error
        return NextResponse.json({
          success: false,
          errors: error.issues  // array of validation issues
        }, { status: 400 })
      }
    // console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}