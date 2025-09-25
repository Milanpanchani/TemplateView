import { NextRequest, NextResponse } from 'next/server'
import { queries } from '@/lib/queries'

// GET /api/posts - Get posts with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const authorId = searchParams.get('authorId')
    
    const skip = (page - 1) * limit
    
    let result
    
    if (search) {
      // Search posts by title or content
      result = await queries.posts.searchPosts(search, skip, limit)
    } else if (authorId) {
      // Get posts by specific author
      const id = parseInt(authorId)
      if (isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid author ID' },
          { status: 400 }
        )
      }
      const posts = await queries.posts.getPostsByAuthor(id)
      result = { 
        success: posts.success, 
        data: { 
          posts: posts.data || [], 
          pagination: { total: posts.data?.length || 0, skip, limit, hasMore: false } 
        } 
      }
    } else {
      // Get all published posts
      result = await queries.posts.getPublishedPosts(skip, limit)
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result.data)
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, authorId, published = false } = body
    
    // Validate required fields
    if (!title || !authorId) {
      return NextResponse.json(
        { error: 'Title and authorId are required' },
        { status: 400 }
      )
    }
    
    // Validate authorId is a number
    const parsedAuthorId = parseInt(authorId)
    if (isNaN(parsedAuthorId)) {
      return NextResponse.json(
        { error: 'Invalid author ID' },
        { status: 400 }
      )
    }
    
    // Check if author exists
    const author = await queries.users.getUserById(parsedAuthorId)
    if (!author.data) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }
    
    const result = await queries.posts.createPost({
      title,
      content,
      authorId: parsedAuthorId,
      published: Boolean(published),
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
