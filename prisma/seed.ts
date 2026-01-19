import { PrismaClient, UserRole, StudentStatus, ExerciseCategory } from '@prisma/client'
import { hash } from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    const passwordHash = await hash('123456', 10)
    const adminPasswordHash = await hash('Admin@123', 10)

    // 0. Create SUPER_ADMIN (for backoffice)
    const superAdminTenant = await prisma.tenant.create({
        data: {
            name: 'Sistema TrainerPro',
            document: '00.000.000/0000-00',
            subscription_plan: 'SYSTEM',
        },
    })

    const superAdmin = await prisma.user.create({
        data: {
            tenant_id: superAdminTenant.id,
            name: 'Super Admin',
            email: 'admin@trainerpro.com',
            role: UserRole.SUPER_ADMIN,
            password: adminPasswordHash,
            is_owner: true,
        },
    })
    console.log(`🔐 SUPER_ADMIN created: ${superAdmin.email} (senha: Admin@123)`)

    // 1. Create Tenant (Academia)
    const tenant = await prisma.tenant.create({
        data: {
            name: 'Iron Pumping Gym',
            document: '12.345.678/0001-90',
            logo_url: 'https://placehold.co/400x400.png',
            subscription_plan: 'PRO',
        },
    })

    console.log(`✅ Tenant created: ${tenant.name} (${tenant.id})`)

    // 2. Create Users

    // Admin
    const admin = await prisma.user.create({
        data: {
            tenant_id: tenant.id,
            name: 'Admin User',
            email: 'admin@ironpumping.com',
            role: UserRole.ADMIN,
            password: passwordHash,
        },
    })
    console.log(`👤 Admin created: ${admin.email}`)

    // Trainer
    const trainer = await prisma.user.create({
        data: {
            tenant_id: tenant.id,
            name: 'Carlos Trainer',
            email: 'carlos@ironpumping.com',
            role: UserRole.TRAINER,
            password: passwordHash,
        },
    })
    console.log(`👤 Trainer created: ${trainer.email}`)

    // 3. Create Students

    // Student 1 (Active)
    const studentUser1 = await prisma.user.create({
        data: {
            tenant_id: tenant.id,
            name: 'João Student',
            email: 'joao@gmail.com',
            role: UserRole.STUDENT,
        },
    })

    const student1 = await prisma.student.create({
        data: {
            tenant_id: tenant.id,
            user_id: studentUser1.id,
            trainer_id: trainer.id,
            status: StudentStatus.ACTIVE,
        },
    })
    console.log(`🎓 Student 1 linked: ${studentUser1.name}`)

    // Student 2 (Pending)
    const studentUser2 = await prisma.user.create({
        data: {
            tenant_id: tenant.id,
            name: 'Maria Newbie',
            email: 'maria@gmail.com',
            role: UserRole.STUDENT,
        },
    })

    const student2 = await prisma.student.create({
        data: {
            tenant_id: tenant.id,
            user_id: studentUser2.id,
            trainer_id: trainer.id,
            status: StudentStatus.PENDING,
        },
    })
    console.log(`🎓 Student 2 linked: ${studentUser2.name}`)

    // 4. Create Workouts & Exercises

    // Workout for Student 1
    const workoutA = await prisma.workout.create({
        data: {
            tenant_id: tenant.id,
            student_id: student1.id,
            trainer_id: trainer.id,
            name: 'Treino A - Hypertrophy',
            objective: 'Gain muscle mass',
            expires_at: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 days
            exercises: {
                create: [
                    {
                        name: 'Supino Reto',
                        category: ExerciseCategory.STRENGTH,
                        media_url: 'https://example.com/videos/bench_press.mp4',
                        sets: 4,
                        reps: 10,
                        weight: 80,
                        rest_seconds: 90,
                    },
                    {
                        name: 'Agachamento Livre',
                        category: ExerciseCategory.STRENGTH,
                        sets: 4,
                        reps: 12,
                        weight: 100,
                        rest_seconds: 120,
                    },
                    {
                        name: 'Corrida Esteira',
                        category: ExerciseCategory.CARDIO,
                        rest_seconds: 0,
                        notes: '20 minutos moderado',
                    },
                ],
            },
        },
    })
    console.log(`💪 Workout created: ${workoutA.name} with ${3} exercises`)
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
