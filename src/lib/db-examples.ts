// Example usage of Prisma queries in your Next.js application
// This file demonstrates how to use the queries in different scenarios

// import { queries } from './queries'

// Example: API Route usage
export async function exampleApiUsage() {
  console.log('=== Prisma Query Examples ===\n')

  // try {
  //   // 1. Create a new user
  //   console.log('1. Creating a new user...')
  //   const newUser = await queries.users.createUser({
  //     email: 'milan@example.com',
  //     name: 'Milan Panchani',
  //   })
  //   console.log('Created user:', newUser.data)

  //   if (!newUser.success || !newUser.data) {
  //     console.log('Failed to create user, skipping other examples')
  //     return
  //   }
  console.log('This file is temporarily disabled due to schema mismatch')
  return
}

//     const userId = newUser.data.id

//     // 2. Create a profile for the user
//     console.log('\n2. Creating user profile...')
//     const profile = await queries.profiles.upsertProfile(
//       userId,
//       'Full-stack developer passionate about Next.js and Prisma'
//     )
//     console.log('Created profile:', profile.data)

//     // 3. Create some posts
//     console.log('\n3. Creating posts...')
//     const post1 = await queries.posts.createPost({
//       title: 'Getting Started with Prisma',
//       content: 'Prisma is an amazing ORM for TypeScript...',
//       authorId: userId,
//       published: true,
//     })

//     const post2 = await queries.posts.createPost({
//       title: 'Next.js 15 Features',
//       content: 'Exploring the latest features in Next.js 15...',
//       authorId: userId,
//       published: false, // Draft post
//     })

//     console.log('Created posts:', { post1: post1.data, post2: post2.data })

//     // 4. Fetch user with all relations
//     console.log('\n4. Fetching user with relations...')
//     const userWithRelations = await queries.users.getUserById(userId)
//     console.log('User with relations:', JSON.stringify(userWithRelations.data, null, 2))

//     // 5. Get published posts
//     console.log('\n5. Fetching published posts...')
//     const publishedPosts = await queries.posts.getPublishedPosts(0, 5)
//     console.log('Published posts:', publishedPosts.data)

//     // 6. Search posts
//     console.log('\n6. Searching posts...')
//     const searchResults = await queries.posts.searchPosts('Prisma')
//     console.log('Search results:', searchResults.data)

//     // 7. Get user statistics
//     console.log('\n7. Getting user statistics...')
//     const userStats = await queries.advanced.getUserStats(userId)
//     console.log('User stats:', userStats.data)

//     // 8. Get recent activity
//     console.log('\n8. Getting recent activity...')
//     const recentActivity = await queries.advanced.getRecentActivity(3)
//     console.log('Recent activity:', recentActivity.data)

//     // 9. Raw query example
//     console.log('\n9. Raw query - Users with post counts...')
//     const rawQueryResult = await queries.raw.getUsersWithPostCounts()
//     console.log('Raw query result:', rawQueryResult.data)

//   } catch (error) {
//     console.error('Error in examples:', error)
//   }
// }

// Example: Server Component usage
export async function getServerSideData() {
  // This can be used in Server Components or API routes
  // const [publishedPosts, topAuthors] = await Promise.all([
  //   queries.posts.getPublishedPosts(0, 10),
  //   queries.advanced.getTopAuthors(5),
  // ])

  // return {
  //   posts: publishedPosts.data,
  //   authors: topAuthors.data,
  // }
  console.log('This function is temporarily disabled due to schema mismatch')
  return { posts: [], authors: [] }
}

// Example: Form submission handler
export async function handleUserRegistration(formData: {
  email: string
  name: string
  bio?: string
}) {
  // try {
  //   // Check if user already exists
  //   const existingUser = await queries.users.getUserByEmail(formData.email)
    
  //   if (existingUser.data) {
  //     return { success: false, error: 'User already exists' }
  //   }

  //   // Create user with profile in a transaction
  //   const result = await queries.advanced.createUserWithProfile({
  //     email: formData.email,
  //     name: formData.name,
  //     bio: formData.bio,
  //   })

  //   return result
  // } catch (error) {
  //   console.error('Registration error:', error)
  //   return { success: false, error: 'Registration failed' }
  // }
  console.log('This function is temporarily disabled due to schema mismatch')
  return { success: false, error: 'Function disabled' }
}

// Example: Blog post management
// export async function manageBlogPost(action: 'create' | 'update' | 'delete' | 'publish', data: any) {
//   switch (action) {
//     case 'create':
//       return await queries.posts.createPost(data)
    
//     case 'update':
//       return await queries.posts.updatePost(data.id, data)
    
//     case 'delete':
//       return await queries.posts.deletePost(data.id)
    
//     case 'publish':
//       return await queries.posts.togglePublishStatus(data.id)
    
//     default:
//       return { success: false, error: 'Invalid action' }
//   }
export async function manageBlogPost(action: 'create' | 'update' | 'delete' | 'publish', data: { title: string; content?: string; authorId: number; published?: boolean; id?: number }) {
  console.log('This function is temporarily disabled due to schema mismatch')
  return { success: false, error: 'Function disabled' }
}

// Example: Pagination helper
export function createPaginationParams(page: number, pageSize: number = 10) {
  const skip = (page - 1) * pageSize
  const take = pageSize
  
  return { skip, take }
}

// Example: Error handling wrapper
export async function safeQuery<T>(queryFn: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await queryFn()
    return { success: true, data }
  } catch (error) {
    console.error('Query error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Export for easy testing
export const examples = {
  apiUsage: exampleApiUsage,
  serverSideData: getServerSideData,
  userRegistration: handleUserRegistration,
  blogPostManagement: manageBlogPost,
  pagination: createPaginationParams,
  safeQuery,
}
