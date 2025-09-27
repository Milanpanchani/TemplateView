import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email('Invalid email format')
})

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email } = bodySchema.parse(data)

    const user = await prisma.user.findUnique({ where: { email } })
    const exists = Boolean(user)

    return NextResponse.json({
      success: true,
      exists
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        errors: error.issues
      }, { status: 400 })
    }
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 })
  }
}


