import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkoutSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email format"),
    templateId: z.string().min(2, "Template ID must be at least 2 characters long"),
    amount: z.number().min(0, "Amount must be greater than 0")
})

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const parseData = checkoutSchema.parse(data)
        const { name ,email , templateId , amount } = parseData
        try {
            let user = await prisma.user.findUnique({
                where: { email }
            })
            if(!user) {
                // return NextResponse.json({ error: 'User not found' }, { status: 404 })
                user = await prisma.user.create({
                    data: { name, email }
                })
            }
            const order = await prisma.order.create({
                data: { userId: user.id, templateId: templateId, amount: amount , status: "PENDING"}
            })
            return NextResponse.json({ success: true, order }, { status: 200 })
        } catch (error) {
            console.error('POST /api/checkout error:', error)
        }
    } catch (error) {
        console.error('POST /api/checkout error:', error)
    }
}