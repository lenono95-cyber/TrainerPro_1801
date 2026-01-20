const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')
require('dotenv/config')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🚀 Creating Super Admin...')

    // 1. Create or get System Tenant
    const systemTenant = await prisma.tenant.upsert({
        where: { id: '00000000-0000-0000-0000-000000000000' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Sistema TrainerPro',
            status: 'active',
            subscription_plan: 'SYSTEM'
        }
    })
    console.log('✅ System Tenant ready')

    const adminPasswordHash = await hash('Admin@123', 10)

    // 2. Create Super Admin (Sem campo status que não existe no modelo User)
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@trainerpro.com' },
        update: {
            password: adminPasswordHash,
            role: 'SUPER_ADMIN'
        },
        create: {
            tenant_id: systemTenant.id,
            name: 'Super Admin',
            email: 'admin@trainerpro.com',
            role: 'SUPER_ADMIN',
            password: adminPasswordHash,
            is_owner: true
        }
    })
    console.log('✅ Super Admin created/updated:', superAdmin.email)
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
