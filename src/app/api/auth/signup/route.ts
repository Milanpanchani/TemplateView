import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'
import { generateOtp } from '@/services/otpServices'
import { createTransport } from 'nodemailer'

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format")
})



export async function POST(request: NextRequest) {
  try {
    // Get data from request
    const data = await request.json()
    const parseData = userSchema.parse(data)
    const { name, email } = parseData
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 })
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email
      }
    })

    const otp = await prisma.otpVerify.create({
      data: {
        userId: user.id,
        otp: generateOtp(),
        expireAt: new Date(Date.now() + 1000 * 60 * 5)
      },
    })

  
    // Setup mailer
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify()

    // Send OTP email
    await transporter.sendMail({
      from: `"Template View" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      text: `Your OTP is ${otp.otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is <b>${otp.otp}</b>. It will expire in 10 minutes.</p>`,
    });

    const responseData = {
      "userid": user.id,
      "name": user.name,
      "email": user.email,
      "otp": otp.otp,
      "role": user.role
    }


    // Return success response
    return NextResponse.json({
      success: true,
      message: "OTP sent to email",
      responseData: responseData
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      // Validation error
      return NextResponse.json({
        success: false,
        errors: error.errors  // array of validation issues
      }, { status: 400 })
    }
    // console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}