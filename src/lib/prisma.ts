import { PrismaClient } from '../../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ['query'],
    datasourceUrl: "postgresql://postgres.piuwhbwvucwcpwzppjwy:S8dyQtE6y5yMqfyu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true",
    // datasourceUrl: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
