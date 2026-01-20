import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Safe initialization: Check if env var exists
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL missing. Using Mock Prisma Client for build.");
    return mockPrisma();
  }

  try {
    return new PrismaClient()
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
      // Return a recursive proxy for model access (e.g. prisma.user.findMany)
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
