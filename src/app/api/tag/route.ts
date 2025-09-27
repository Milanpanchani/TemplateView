import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const tagSchema = z.object({
    name: z.string().min(1, "Tag name is required")
});

const updateTagSchema = z.object({
    id: z.string().min(1, "Tag id is required"),
    name: z.string().min(1, "Tag name is required")
});

// GET - Get all tags
// READ - Get all tags or a specific tag
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const includeTemplates = searchParams.get('includeTemplates') === 'true';
        
        if (id) {
            // Get specific tag by ID
            const tag = await prisma.tag.findUnique({
                where: { id },
                include: includeTemplates ? {
                    templateTags: {
                        include: {
                            template: {
                                select: { 
                                    id: true, 
                                    title: true, 
                                    description: true,
                                    price: true,
                                    coverImage: true
                                }
                            }
                        }
                    }
                } : undefined
            });
            
            if (!tag) {
                return NextResponse.json({ success: false, error: "Tag not found" }, { status: 404 });
            }
            
            return NextResponse.json({ success: true, tag }, { status: 200 });
        } else {
            // Get all tags (no pagination needed for 6-7 tags)
            const tags = await prisma.tag.findMany({
                orderBy: { createdAt: 'desc' },
                include: includeTemplates ? {
                    templateTags: {
                        include: {
                            template: {
                                select: { 
                                    id: true, 
                                    title: true, 
                                    description: true,
                                    price: true,
                                    coverImage: true
                                }
                            }
                        }
                    }
                } : {
                    _count: {
                        select: { templateTags: true }
                    }
                }
            });
            
            return NextResponse.json({ 
                success: true, 
                tags
            }, { status: 200 });
        }
    } catch (_error) {
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}


// CREATE - Create a new tag
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const parseData = tagSchema.parse(data);
        const { name } = parseData;

        const existingTag = await prisma.tag.findUnique({
            where: { name }
        });
        if (existingTag) {
            return NextResponse.json({ success: false, error: "Tag already exists" }, { status: 400 });
        }
        const tag = await prisma.tag.create({
            data: { name },
            include: {
                templateTags: {
                    include: {
                        template: {
                            select: { id: true, title: true }
                        }
                    }
                }
            }
        });
        return NextResponse.json({ success: true, tag }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}


// UPDATE - Update a tag
export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();
        const parseData = updateTagSchema.parse(data);
        const { id, name } = parseData;

        // Check if tag exists
        const existingTag = await prisma.tag.findUnique({
            where: { id }
        });
        if (!existingTag) {
            return NextResponse.json({ success: false, error: "Tag not found" }, { status: 404 });
        }

        // Check if new name already exists (excluding current tag)
        const nameExists = await prisma.tag.findFirst({
            where: {
                name,
                id: { not: id }
            }
        });

        if (nameExists) {
            return NextResponse.json({ success: false, error: "Tag name already exists" }, { status: 400 });
        }

        const updatedTag = await prisma.tag.update({
            where: { id },
            data: { name },
            include: {
                templateTags: {
                    include: {
                        template: {
                            select: { id: true, title: true }
                        }
                    }
                }
            }
        });
        return NextResponse.json({ success: true, updatedTag }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}


//delete - delete a tag
export async function DELETE(request: NextRequest) {
    try {
        const data = await request.json();
        // const parseData = deleteTagSchem.parse(data);
        const { id } = data;

        // Check if tag exists
        const existingTag = await prisma.tag.findUnique({
            where: { id }
        });
        if (!existingTag) {
            return NextResponse.json({ success: false, error: "Tag not found" }, { status: 404 });
        }

        const deletedTag = await prisma.tag.delete({
            where: { id }
        });
        return NextResponse.json({ success: true, deletedTag }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
