import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  // Safe initialization check
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL missing. Using Mock Prisma Client for build.");
    return mockPrisma();
  }

  try {
    const connectionString = process.env.DATABASE_URL

    // Configuração do Pool (Otimizado para Serverless/Vercel)
    const pool = new Pool({
      connectionString,
      max: 10, // Limite de conexões do pool
      idleTimeoutMillis: 30000
    })

    // Adaptador Prisma -> Postgres
    const adapter = new PrismaPg(pool)

    // Inicializa Prisma com Adaptador
    return new PrismaClient({ adapter })

  } catch (e) {
    console.warn("⚠️ Failed to initialize Prisma Client. Using Mock fallback.", e);
    return mockPrisma();
  }
}

function mockPrisma() {
  return new Proxy({} as PrismaClient, {
    get: (target, prop) => {
      if (prop === '$connect') return () => Promise.resolve();
      if (prop === '$disconnect') return () => Promise.resolve();
      return new Proxy({}, {
        get: () => () => Promise.resolve([])
      });
    }
  });
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
