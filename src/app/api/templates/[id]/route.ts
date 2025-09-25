import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for updating a template (all fields optional)
const updateTemplateSchema = z.object({
  title: z.string().min(1, "Template title is required").max(255, "Title too long").optional(),
  description: z.string().min(1, "Template description is required").optional(),
  coverImage: z.string().url("Invalid cover image URL").optional(),
  resource: z.string().url("Invalid resource URL").optional(),
  content: z.string().min(1, "Template content is required").optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  offerPrice: z.number().min(0, "Offer price must be positive").optional(),
  details: z.object({
    lastUpdated: z.string().optional(),
    version: z.string().optional(),
    builtWith: z.array(z.string()).optional(),
    githubRepo: z.string().optional(),
    documentation: z.string().optional(),
  }).optional(),
  tagIds: z.array(z.string()).optional(),
})

// GET /api/templates/[id]?includeTags=true
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const includeTags = new URL(request.url).searchParams.get("includeTags") === "true"

    const template = await prisma.template.findUnique({
      where: { id: params.id },
      include: includeTags ? {
        templateTags: {
          include: { tag: { select: { id: true, name: true } } },
        },
      } : undefined,
    })

    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, template }, { status: 200 })
  } catch (error) {
    console.error("GET /api/templates/[id] error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/templates/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const parsed = updateTemplateSchema.parse(data)
    const { tagIds, ...templateData } = parsed

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.template.findUnique({ where: { id: params.id } })
      if (!existing) {
        return { notFound: true as const }
      }

      await tx.template.update({
        where: { id: params.id },
        data: {
          ...templateData,
          ...(parsed.details !== undefined ? { details: parsed.details || {} } : {}),
        },
      })

      if (tagIds) {
        if (tagIds.length > 0) {
          const existingTags = await tx.tag.findMany({
            where: { id: { in: tagIds } },
            select: { id: true },
          })
          const found = new Set(existingTags.map(t => t.id))
          const invalid = tagIds.filter(id => !found.has(id))
          if (invalid.length > 0) {
            throw new Error(`Invalid tag IDs: ${invalid.join(", ")}`)
          }
        }

        const current = await tx.templateTag.findMany({
          where: { templateId: params.id },
          select: { tagId: true },
        })
        const currentSet = new Set(current.map(c => c.tagId))
        const nextSet = new Set(tagIds)

        const toAdd = [...nextSet].filter(id => !currentSet.has(id))
        if (toAdd.length > 0) {
          await tx.templateTag.createMany({ data: toAdd.map(tagId => ({ templateId: params.id, tagId })) })
        }

        const toRemove = [...currentSet].filter(id => !nextSet.has(id))
        if (toRemove.length > 0) {
          await tx.templateTag.deleteMany({ where: { templateId: params.id, tagId: { in: toRemove } } })
        }
      }

      const withRelations = await tx.template.findUnique({
        where: { id: params.id },
        include: {
          templateTags: { include: { tag: { select: { id: true, name: true } } } },
        },
      })

      return { withRelations }
    })

    if ('notFound' in result) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, template: result.withRelations }, { status: 200 })
  } catch (error) {
    console.error("PUT /api/templates/[id] error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes("Invalid tag IDs")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to update template" }, { status: 500 })
  }
}

// DELETE /api/templates/[id]
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.template.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 })
    }

    await prisma.template.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("DELETE /api/templates/[id] error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete template" }, { status: 500 })
  }
}


