const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
require('dotenv').config(); // Carrega o .env

if (!process.env.DATABASE_URL) {
    console.error('❌ ERRO: DATABASE_URL não encontrada no .env');
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetPassword() {
    try {
        const email = 'admin@trainerpro.com';
        const password = 'Admin@123';

        console.log(`🔒 Gerando hash Node.js para: ${email}`);
        const hashedPassword = await hash(password, 10);

        console.log('🔄 Atualizando senha no banco via Prisma...');
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        console.log(`✅ SUCESSO! Senha atualizada para o ID: ${user.id}`);
        console.log(`🔑 Novo Hash no Banco: ${hashedPassword}`);
    } catch (error) {
        console.error('❌ ERRO:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
