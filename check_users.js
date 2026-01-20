const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')
require('dotenv/config')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🔍 Checking database users...')
    const users = await prisma.user.findMany({
        select: {
            email: true,
            role: true,
            tenant: {
                select: {
                    name: true
                }
            }
        }
    })
    console.log('Total users:', users.length)
    users.forEach(u => {
        console.log(`- ${u.email} [${u.role}] (Tenant: ${u.tenant?.name})`)
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
