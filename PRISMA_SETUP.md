# Prisma Client Setup Guide

This project has been set up with Prisma ORM for database management. Here's everything you need to know to get started.

## 📁 Project Structure

```
src/
├── lib/
│   ├── prisma.ts        # Prisma client configuration
│   ├── queries.ts       # Comprehensive query examples
│   └── db-examples.ts   # Usage examples and patterns
└── app/
    └── api/
        ├── users/       # User API routes
        └── posts/       # Post API routes
```

## 🗄️ Database Schema

The project includes three main models:

- **User**: Basic user information (id, email, name)
- **Post**: Blog posts with author relationship (id, title, content, published, authorId)
- **Profile**: Extended user information (id, bio, userId)

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env.local` file in your project root:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### 2. Database Setup

```bash
# Install dependencies (already done)
npm install

# Generate Prisma client
npx prisma generate

# Run existing migrations
npx prisma migrate deploy

# (Optional) Reset database and apply migrations
npx prisma migrate reset
```

### 3. Seed Data (Optional)

You can run the example queries to populate your database:

```typescript
import { examples } from '@/lib/db-examples'

// Run this in a script or API route
await examples.apiUsage()
```

## 📚 Usage Examples

### Basic Queries

```typescript
import { queries } from '@/lib/queries'

// Create a user
const user = await queries.users.createUser({
  email: 'user@example.com',
  name: 'John Doe'
})

// Get user with relations
const userWithPosts = await queries.users.getUserById(1)

// Create a post
const post = await queries.posts.createPost({
  title: 'My First Post',
  content: 'Hello World!',
  authorId: 1,
  published: true
})

// Search posts
const searchResults = await queries.posts.searchPosts('Hello')
```

### API Routes

The project includes ready-to-use API routes:

- `GET /api/users` - List users with pagination
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `GET /api/posts` - List posts (with search and filtering)
- `POST /api/posts` - Create new post

### Server Components

```typescript
// In a Server Component
import { queries } from '@/lib/queries'

export default async function PostsPage() {
  const result = await queries.posts.getPublishedPosts(0, 10)
  
  if (!result.success) {
    return <div>Error loading posts</div>
  }
  
  return (
    <div>
      {result.data?.posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <small>By {post.author.name}</small>
        </article>
      ))}
    </div>
  )
}
```

## 🛠️ Available Query Collections

### User Queries (`queries.users`)
- `createUser(data)` - Create new user
- `getUserById(id)` - Get user with relations
- `getUserByEmail(email)` - Find user by email
- `getAllUsers(skip, take)` - Paginated user list
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user

### Post Queries (`queries.posts`)
- `createPost(data)` - Create new post
- `getPostById(id)` - Get post with author
- `getPublishedPosts(skip, take)` - Paginated published posts
- `getPostsByAuthor(authorId)` - Posts by specific author
- `searchPosts(term, skip, take)` - Search posts
- `updatePost(id, data)` - Update post
- `deletePost(id)` - Delete post
- `togglePublishStatus(id)` - Publish/unpublish post

### Profile Queries (`queries.profiles`)
- `upsertProfile(userId, bio)` - Create or update profile
- `getProfileByUserId(userId)` - Get profile with user data
- `deleteProfile(userId)` - Delete profile

### Advanced Queries (`queries.advanced`)
- `getUserStats(userId)` - User statistics
- `getRecentActivity(take)` - Recent posts across all users
- `getTopAuthors(take)` - Top authors by post count
- `createUserWithProfile(data)` - Transaction example

### Raw Queries (`queries.raw`)
- `getUsersWithPostCounts()` - Raw SQL example

## 🔧 Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Create and apply new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## 🏗️ Database Providers

The current setup uses PostgreSQL, but you can easily switch to other providers:

### MySQL
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### SQLite (Development)
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### MongoDB
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

## 🚨 Error Handling

All query functions return a consistent response format:

```typescript
{
  success: boolean
  data?: any
  error?: string
  message?: string
}
```

Always check the `success` property before using the data:

```typescript
const result = await queries.users.getUserById(1)

if (result.success) {
  console.log('User:', result.data)
} else {
  console.error('Error:', result.error)
}
```

## 🔐 Best Practices

1. **Connection Management**: The Prisma client is configured with connection pooling
2. **Type Safety**: All queries are fully typed with TypeScript
3. **Error Handling**: Comprehensive error handling in all query functions
4. **Transactions**: Use `prisma.$transaction()` for complex operations
5. **Logging**: Query logging is enabled in development
6. **Performance**: Includes pagination and selective field loading

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js with Prisma](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

## 🤝 Contributing

When adding new queries or modifying the schema:

1. Update the schema in `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update query functions in `src/lib/queries.ts`
4. Add usage examples in `src/lib/db-examples.ts`
5. Test your changes thoroughly
