import { NextRequest, NextResponse } from 'next/server'
// import { queries } from '@/lib/queries'

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
//   try {
//     const id = parseInt(params.id)
    
//     if (isNaN(id)) {
//       return NextResponse.json(
//         { error: 'Invalid user ID' },
//         { status: 400 }
//       )
//     }
    
//     const result = await queries.users.getUserById(id)
    
//     if (!result.success) {
//       return NextResponse.json(
//         { error: result.error },
//         { status: 500 }
//       )
//     }
    
//     if (!result.data) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       )
//     }
    
//     return NextResponse.json(result.data)
//   } catch (error) {
//     console.error('GET /api/users/[id] error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

return NextResponse.json(
  { error: 'This endpoint is temporarily disabled due to schema mismatch' },
  { status: 503 }
)
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
//   try {
//     const id = parseInt(params.id)
//     const body = await request.json()
//     const { name, email } = body
    
//     if (isNaN(id)) {
//       return NextResponse.json(
//         { error: 'Invalid user ID' },
//         { status: 400 }
//       )
//     }
    
//     // Check if user exists
//     const existingUser = await queries.users.getUserById(id)
//     if (!existingUser.data) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       )
//     }
    
//     const result = await queries.users.updateUser(id, { name, email })
    
//     if (!result.success) {
//       return NextResponse.json(
//         { error: result.error },
//         { status: 500 }
//       )
//     }
    
//     return NextResponse.json(result.data)
//   } catch (error) {
//     console.error('PUT /api/users/[id] error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }
return NextResponse.json(
  { error: 'This endpoint is temporarily disabled due to schema mismatch' },
  { status: 503 }
)
}


// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
//   try {
//     const id = parseInt(params.id)
    
//     if (isNaN(id)) {
//       return NextResponse.json(
//         { error: 'Invalid user ID' },
//         { status: 400 }
//       )
//     }
    
//     // Check if user exists
//     const existingUser = await queries.users.getUserById(id)
//     if (!existingUser.data) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       )
//     }
    
//     const result = await queries.users.deleteUser(id)
    
//     if (!result.success) {
//       return NextResponse.json(
//         { error: result.error },
//         { status: 500 }
//       )
//     }
    
//     return NextResponse.json({ message: result.message })
//   } catch (error) {
//     console.error('DELETE /api/users/[id] error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

return NextResponse.json(
  { error: 'This endpoint is temporarily disabled due to schema mismatch' },
  { status: 503 }
)
}
