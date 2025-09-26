import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const templateSchema = z.object({
    title: z.string().min(1, "Template title is required").max(255, "Title too long"),
    description: z.string().min(1, "Template description is required"),
    coverImage: z.string().url("Invalid cover image URL"),
    resource: z.string().url("Invalid resource URL").optional(),
    content: z.string().min(1, "Template content is required"),
    price: z.number().min(0, "Price must be positive"),
    offerPrice: z.number().min(0, "Offer price must be positive").optional(),
    details: z.object({
        lastUpdated: z.string().optional(),
        version: z.string().optional(),
        builtWith: z.array(z.string()).optional(),
        githubRepo: z.string().optional(),
        documentation: z.string().optional()
    }).optional(),
    tagIds: z.array(z.string()).optional() // Array of tag IDs to associate
});

// Note: Single-template update/delete are handled in /api/templates/[id]

// GET - Get all templates or a specific template
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const includeTags = searchParams.get('includeTags') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search');
        const tagFilter = searchParams.get('tagFilter'); // Filter by tag name
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        if (id) {
            // Get specific template by ID
            const template = await prisma.template.findUnique({
                where: { id },
                include: includeTags ? {
                    templateTags: {
                        include: {
                            tag: {
                                select: { 
                                    id: true, 
                                    name: true 
                                }
                            }
                        }
                    }
                } : undefined
            });
            
            if (!template) {
                return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
            }
            
            return NextResponse.json({ success: true, template }, { status: 200 });
        } else {
            // Build where clause for filtering
            const whereClause: Record<string, unknown> = {};
            
            // Search in title and description
            if (search) {
                whereClause.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            // Price range filter
            if (minPrice || maxPrice) {
                whereClause.price = {} as Record<string, unknown>;
                if (minPrice) (whereClause.price as Record<string, unknown>).gte = parseFloat(minPrice);
                if (maxPrice) (whereClause.price as Record<string, unknown>).lte = parseFloat(maxPrice);
            }

            // Tag filter
            if (tagFilter) {
                whereClause.templateTags = {
                    some: {
                        tag: {
                            name: { equals: tagFilter, mode: 'insensitive' }
                        }
                    }
                };
            }

            // Get templates with pagination
            const skip = (page - 1) * limit;
            const [templates, totalCount] = await Promise.all([
                prisma.template.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: includeTags ? {
                        templateTags: {
                            include: {
                                tag: {
                                    select: { 
                                        id: true, 
                                        name: true 
                                    }
                                }
                            }
                        }
                    } : {
                        _count: {
                            select: { templateTags: true }
                        }
                    }
                }),
                prisma.template.count({ where: whereClause })
            ]);
            
            const totalPages = Math.ceil(totalCount / limit);
            
            return NextResponse.json({ 
                success: true, 
                templates,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }, { status: 200 });
        }
    } catch (error) {
        console.error('GET /api/templates error:', error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const parseData = templateSchema.parse(data);
        const { tagIds, ...templateData } = parseData;

        // Create template and associate tags in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the template
            const template = await tx.template.create({
                data: {
                    ...templateData,
                    details: templateData.details || {}
                }
            });

            // Associate tags if provided
            if (tagIds && tagIds.length > 0) {
                // Verify all tag IDs exist
                const existingTags = await tx.tag.findMany({
                    where: { id: { in: tagIds } },
                    select: { id: true }
                });

                const existingTagIds = existingTags.map(tag => tag.id);
                const invalidTagIds = tagIds.filter(id => !existingTagIds.includes(id));

                if (invalidTagIds.length > 0) {
                    throw new Error(`Invalid tag IDs: ${invalidTagIds.join(', ')}`);
                }

                // Create template-tag associations
                await tx.templateTag.createMany({
                    data: tagIds.map(tagId => ({
                        templateId: template.id,
                        tagId
                    }))
                });
            }

            // Return template with tags
            return await tx.template.findUnique({
                where: { id: template.id },
                include: {
                    templateTags: {
                        include: {
                            tag: {
                                select: { id: true, name: true }
                            }
                        }
                    }
                }
            });
        });

        return NextResponse.json({ success: true, template: result }, { status: 201 });
    } catch (error) {
        console.error('POST /api/templates error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
        }
        if (error instanceof Error && error.message.includes('Invalid tag IDs')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Failed to create template" }, { status: 500 });
    }
}

