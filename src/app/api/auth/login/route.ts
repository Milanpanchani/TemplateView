import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateOtp } from "@/services/otpServices";
import { createTransport } from 'nodemailer'

const userSchema = z.object({
    email: z.string().email()
})

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        // const parseData = userSchema.parse(data)
        const { email } = data;
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // if (!user.isVerified) {
        //     return NextResponse.json({ error: "User not verified" }, { status: 401 });
        // }

        const otp = await prisma.otpVerify.upsert({
            where: {
                userId: user.id
            },
            update: {
                otp: generateOtp(),
                expireAt: new Date(Date.now() + 1000 * 60 * 5)
            },
            create: {
                userId: user.id,
                otp: generateOtp(),
                expireAt: new Date(Date.now() + 1000 * 60 * 5)
            }
        });
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

        // const token = await jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string || 'fallback-secret-key', { expiresIn: '1h' });
        return NextResponse.json({ success: true, message: "Login successful", responseData: responseData }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.issues }, { status: 400 })
        }
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}