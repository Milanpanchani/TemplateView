import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import Stripe from 'stripe'

const checkoutSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email format"),
    templateId: z.string().min(2, "Template ID must be at least 2 characters long"),
    amount: z.number().min(0, "Amount must be greater than 0")
})
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

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



            // Create a checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                customer_email: user.email, // optional: Stripe will email receipt
                metadata: {
                  userId: user.id, // your app’s user ID
                  orderId: order.id, // if you want order tracking
                },
                line_items: [
                  {
                    price_data: {
                      currency: "inr",
                      product_data: { name: "Premium Plan" },
                      unit_amount: amount, // $5
                    },
                    quantity: 1,
                  },
                ],
                success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
              });
              console.log(session)

            return NextResponse.json({ success: true, order , session }, { status: 200 })
        } catch (error) {
            console.error('POST /api/checkout error:', error)
        }
    } catch (error) {
        console.error('POST /api/checkout error:', error)
    }
}