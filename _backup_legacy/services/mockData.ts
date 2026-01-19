
// ... imports ...
import { Tenant, Student, Assessment, WorkoutRoutine, UserProfile, UserRole, ScheduleSlot, Notification, StudentUpdateLog, WorkoutLog, ProgressPhoto, Conversation, Message, AutoMessageConfig, Subscription, Plan, Invoice, AuditLog } from '../types';

// ... (existing exports like MOCK_TENANTS, MOCK_USERS, etc.)

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant_1',
    name: 'Academia Iron Pump',
    slug: 'iron-pump',
    type: 'academy',
    primaryColor: '#ef4444', // Red-500
    logoUrl: 'https://picsum.photos/id/1/200/200',
    appName: 'Iron App',
    status: 'active',
    plan: 'pro',
    owner_name: 'Carlos Personal',
    owner_email: 'personal@ironpump.com',
    created_at: '2023-01-15'
  },
  {
    id: 'tenant_2',
    name: 'Estúdio Zen Wellness',
    slug: 'zen-wellness',
    type: 'academy',
    primaryColor: '#14b8a6', // Teal-500
    logoUrl: 'https://picsum.photos/id/2/200/200',
    appName: 'Zen Life',
    status: 'active',
    plan: 'starter',
    owner_name: 'Roberto Zen',
    owner_email: 'contato@zen.com',
    created_at: '2023-06-10'
  },
  {
    id: 'tenant_3',
    name: 'Personal Bruno',
    slug: 'personal-bruno',
    type: 'personal',
    primaryColor: '#3b82f6',
    logoUrl: '',
    status: 'active',
    plan: 'starter',
    owner_name: 'Bruno Silva',
    owner_email: 'bruno@fit.com',
    created_at: '2023-09-01'
  },
  {
    id: 'tenant_4',
    name: 'CrossFit Alpha',
    slug: 'crossfit-alpha',
    type: 'academy',
    primaryColor: '#f97316',
    logoUrl: '',
    status: 'suspended', // Example of suspended tenant
    plan: 'pro',
    owner_name: 'Marcos Cross',
    owner_email: 'marcos@alpha.com',
    created_at: '2023-12-01'
  }
];

// Refatorado para MOCK_INVOICES
export const MOCK_INVOICES: Invoice[] = [
    { id: 'inv_1', tenant_id: 'tenant_1', tenant_name: 'Academia Iron Pump', amount: 299.90, status: 'paid', method: 'credit_card', date: '2024-02-01' },
    { id: 'inv_2', tenant_id: 'tenant_2', tenant_name: 'Estúdio Zen Wellness', amount: 99.90, status: 'paid', method: 'pix', date: '2024-02-02' },
    { id: 'inv_3', tenant_id: 'tenant_3', tenant_name: 'Personal Bruno', amount: 99.90, status: 'paid', method: 'credit_card', date: '2024-02-05' },
    { id: 'inv_4', tenant_id: 'tenant_1', tenant_name: 'Academia Iron Pump', amount: 299.90, status: 'paid', method: 'credit_card', date: '2024-01-01' },
    { id: 'inv_5', tenant_id: 'tenant_2', tenant_name: 'Estúdio Zen Wellness', amount: 99.90, status: 'uncollectible', method: 'credit_card', date: '2024-01-02' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'log_1',
        actor_id: 'u_super',
        actor_email: 'rodrigo@trainerpro.app',
        action: 'tenant_suspended',
        target_resource: 'tenant_4 (CrossFit Alpha)',
        details: 'Suspensão por falta de pagamento (automático)',
        ip_address: '192.168.1.1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
        id: 'log_2',
        actor_id: 'u_super',
        actor_email: 'rodrigo@trainerpro.app',
        action: 'user_impersonated',
        target_resource: 'tenant_1',
        details: 'Acesso de suporte para verificar erro de configuração',
        ip_address: '192.168.1.1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
        id: 'log_3',
        actor_id: 'system',
        actor_email: 'system',
        action: 'subscription_renewed',
        target_resource: 'tenant_1',
        details: 'Renovação automática plano PRO',
        ip_address: '10.0.0.1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    }
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u_super',
    tenant_id: 'tenant_1', 
    role: UserRole.SUPER_ADMIN,
    is_super_admin: true, // Flag arquitetural
    full_name: 'Rodrigo Admin',
    email: 'rodrigo@trainerpro.app',
    avatar_url: 'https://i.pravatar.cc/150?u=rodrigo',
    status: 'active',
    last_login: new Date().toISOString(),
    is_temporary_password: false
  },
  {
    id: 'u_trainer',
    tenant_id: 'tenant_1',
    role: UserRole.TRAINER,
    is_super_admin: false,
    full_name: 'Carlos Personal',
    email: 'personal@ironpump.com',
    avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    status: 'active',
    last_login: new Date(Date.now() - 86400000).toISOString(),
    is_temporary_password: false,
    password_changed_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'u_student',
    tenant_id: 'tenant_1',
    role: UserRole.STUDENT,
    is_super_admin: false,
    full_name: 'João Silva',
    email: 'joao@email.com',
    student_id_link: 's1', 
    avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    status: 'active',
    last_login: new Date(Date.now() - 3600000).toISOString(),
    must_change_password: true, 
    is_temporary_password: true,
    password_changed_at: undefined
  }
];

export const MOCK_PLANS: Plan[] = [
    {
        id: 'p_starter',
        name: 'Starter',
        slug: 'starter',
        price: 99.90,
        interval: 'monthly',
        features: ['Até 10 alunos', 'Treinos ilimitados', 'Dashboard Básico'],
        active: true
    },
    {
        id: 'p_pro',
        name: 'Pro',
        slug: 'pro',
        price: 199.90,
        interval: 'monthly',
        features: ['Até 50 alunos', 'Treinos ilimitados', 'Avaliações Físicas', 'Gestão Financeira'],
        active: true
    },
    {
        id: 'p_enterprise',
        name: 'Enterprise',
        slug: 'enterprise',
        price: 499.90,
        interval: 'monthly',
        features: ['Alunos ilimitados', 'Multi-tenant', 'API Access', 'Suporte Prioritário'],
        active: true
    }
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
    {
        id: 'sub_1',
        tenant_id: 'tenant_1',
        tenant_name: 'Academia Iron Pump',
        plan: 'pro',
        status: 'active',
        price: 299.90,
        created_at: '2023-01-01',
        current_period_end: '2025-01-01'
    },
    {
        id: 'sub_2',
        tenant_id: 'tenant_2',
        tenant_name: 'Estúdio Zen Wellness',
        plan: 'starter',
        status: 'past_due',
        price: 99.90,
        created_at: '2023-06-01',
        current_period_end: '2024-02-01'
    },
    {
        id: 'sub_3',
        tenant_id: 'tenant_3',
        tenant_name: 'Personal Bruno',
        plan: 'starter',
        status: 'trialing',
        price: 99.90,
        created_at: '2024-02-01',
        current_period_end: '2024-02-15'
    }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    tenant_id: 'tenant_1',
    full_name: 'João Silva',
    email: 'joao@email.com',
    enrollment_status: 'active', // Novo campo
    age: 28,
    gender: 'M',
    weight: 82.5,
    height: 175,
    goal: 'Hipertrofia',
    level: 'Intermediário',
    last_checkin: '2023-10-25T09:00:00Z',
    avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 's2',
    tenant_id: 'tenant_1',
    full_name: 'Alice Santos',
    email: 'alice@email.com',
    enrollment_status: 'active',
    age: 34,
    gender: 'F',
    weight: 62,
    height: 165,
    goal: 'Emagrecimento',
    level: 'Iniciante',
    injuries: 'Dor na lombar',
    last_checkin: '2023-10-24T18:30:00Z',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 's3',
    tenant_id: 'tenant_2',
    full_name: 'Roberto Zen',
    email: 'roberto@email.com',
    enrollment_status: 'active',
    age: 45,
    gender: 'M',
    weight: 75,
    height: 178,
    goal: 'Resistência',
    level: 'Avançado',
  },
];

// ... (Restante do arquivo permanece inalterado para Assessments, Workouts, etc)
// Mantendo as outras exports (MOCK_ASSESSMENTS, MOCK_WORKOUTS, MOCK_SCHEDULE, etc)
// por brevidade, assuma que estão aqui inalterados.

const getToday = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
}
const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}
const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

export const MOCK_SCHEDULE: ScheduleSlot[] = [
    { id: 'sch1', tenant_id: 'tenant_1', date: getToday(), time: '08:00', status: 'booked', student_id: 's2', student_name: 'Alice Santos' },
    { id: 'sch2', tenant_id: 'tenant_1', date: getToday(), time: '09:00', status: 'available' },
    { id: 'sch3', tenant_id: 'tenant_1', date: getToday(), time: '10:00', status: 'blocked' }, 
    { id: 'sch4', tenant_id: 'tenant_1', date: getToday(), time: '14:00', status: 'booked', student_id: 's1', student_name: 'João Silva' }, 
    { id: 'sch5', tenant_id: 'tenant_1', date: getToday(), time: '16:00', status: 'available' },
    
    { id: 'sch6', tenant_id: 'tenant_1', date: getTomorrow(), time: '08:00', status: 'available' },
    { id: 'sch7', tenant_id: 'tenant_1', date: getTomorrow(), time: '09:00', status: 'available' },
    { id: 'sch8', tenant_id: 'tenant_1', date: getTomorrow(), time: '10:00', status: 'booked', student_id: 's2', student_name: 'Alice Santos' },
    { id: 'sch9', tenant_id: 'tenant_1', date: getTomorrow(), time: '14:00', status: 'available' },
    { id: 'sch10', tenant_id: 'tenant_1', date: getTomorrow(), time: '15:00', status: 'available' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        user_id: 'u_trainer',
        type: 'booking',
        title: 'Novo Agendamento',
        message: 'Alice Santos agendou um treino para Hoje às 08:00.',
        read: false,
        created_at: new Date().toISOString()
    },
    {
        id: 'n2',
        user_id: 'u_student', 
        type: 'reminder',
        title: 'Lembrete de Treino',
        message: 'Seu treino é hoje às 14:00. Não se atrase!',
        read: false,
        created_at: new Date().toISOString()
    }
];

export const MOCK_LOGS: StudentUpdateLog[] = [
  {
    id: 'log1',
    student_id: 's1',
    updated_by_role: UserRole.TRAINER,
    field: 'level',
    old_value: 'Iniciante',
    new_value: 'Intermediário',
    timestamp: '2025-01-02T10:15:00Z'
  }
];

export const MOCK_WORKOUT_LOGS: WorkoutLog[] = [
  {
    id: 'wl1',
    tenant_id: 'tenant_1', 
    student_id: 's1',
    workout_name: 'Treino A - Empurrar',
    date: getToday(),
    duration_minutes: 55,
    calories_burned: 420,
    rating: 4,
    feedback: 'Senti pesado hoje, mas completei.',
    exercises_done: [
      { name: 'Supino Reto', sets_done: 4, weight_used: 80, difficulty: 'Hard' },
      { name: 'Supino Inclinado', sets_done: 3, weight_used: 26, difficulty: 'Normal' }
    ]
  },
  // ... logs
];

export const MOCK_PHOTOS: ProgressPhoto[] = [
  {
    id: 'p1',
    tenant_id: 'tenant_1', 
    student_id: 's1',
    date: '2023-08-01',
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    weight_at_time: 88,
    notes: 'Início do projeto'
  },
  // ... photos
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    tenant_id: 'tenant_1',
    student_id: 's1',
    personal_id: 'u_trainer',
    last_message: 'Professor, senti uma dor no ombro hoje.',
    last_message_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unread_count: 1,
    participant_name: 'João Silva',
    participant_avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  // ... convs
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    tenant_id: 'tenant_1',
    conversation_id: 'conv_1',
    sender_id: 'u_trainer',
    type: 'text',
    content: 'E aí João, como foi o treino de hoje?',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  // ... msgs
];

export const DEFAULT_MESSAGE_CONFIG: AutoMessageConfig = {
    id: 'cfg_1',
    tenant_id: 'tenant_1',
    reminder_24h_active: true,
    reminder_24h_time: '08:00',
    reminder_24h_text: 'Oi {nome}! Amanhã você tem treino às {horario}. Preparado? 💪',
    reminder_2h_active: true,
    reminder_2h_text: 'Seu treino é em 2h! 🔥',
    reminder_now_active: false,
    reminder_now_text: 'Hora do treino! Bora lá! 💪',
    alert_missed_student_active: true,
    alert_missed_student_text: 'Sentimos sua falta! 😔 Está tudo bem?',
    alert_missed_trainer_active: true,
    alert_missed_critical_active: true,
    alert_missed_critical_text: '{nome} está há 3 dias sem treinar. Entre em contato!',
    assessment_reminder_active: true,
    assessment_reminder_days: 30,
    assessment_reminder_text: 'Hora da avaliação física! 📊',
    photo_reminder_active: true,
    photo_reminder_days: 30,
    photo_reminder_text: 'Tire sua foto de progresso! 📸',
    motivational_workout_active: true,
    motivational_workout_text: 'Parabéns! Treino concluído! 🎉',
    motivational_streak_active: true,
    motivational_streak_days: 7,
    motivational_streak_text: 'Você está há {sequencia} dias seguidos treinando! 🔥',
    motivational_record_active: false,
    motivational_record_text: 'Novo recorde! Parabéns! 💪',
    welcome_active: true,
    welcome_text: 'Bem-vindo, {nome}! Vamos começar sua jornada! 💪',
};

export const MOCK_MESSAGE_CONFIGS: AutoMessageConfig[] = [
    { ...DEFAULT_MESSAGE_CONFIG }
];
export const MOCK_ASSESSMENTS: Assessment[] = [
  {
    id: 'a1',
    tenant_id: 'tenant_1',
    student_id: 's1',
    date: '2024-11-01',
    age_at_assessment: 28,
    weight: 87,
    height: 175,
    neck_cm: 39,
    chest_cm: 96,
    waist_cm: 88,
    abdomen_cm: 92,
    hips_cm: 98,
    arm_right_cm: 34,
    arm_left_cm: 34,
    thigh_right_cm: 56,
    thigh_left_cm: 56,
    bmi: 28.4,
    body_fat_percentage: 22,
    waist_hip_ratio: 0.90,
    lean_mass_kg: 67.8,
    fat_mass_kg: 19.2,
    photo_front_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    notes: 'Início do acompanhamento.'
  },
  // ... assessments
];

export const MOCK_WORKOUTS: WorkoutRoutine[] = [
  {
    id: 'w1',
    tenant_id: 'tenant_1',
    student_id: 's1',
    is_template: false,
    name: 'Treino A - Empurrar',
    day_of_week: 'Segunda-feira',
    description: 'Focar na excêntrica do movimento.',
    exercises: [
      { 
          id: 'e1', 
          name: 'Supino Reto', 
          sets: 4, 
          reps: '8-10', 
          weight: 80, 
          rest_seconds: 90, 
          rpe: 8,
          video_url: 'https://www.youtube.com/embed/rT7DgCr-3pg',
          video_type: 'youtube'
      },
      { id: 'e2', name: 'Supino Inclinado Halteres', sets: 3, reps: '10-12', weight: 26, rest_seconds: 60, rpe: 8 },
      { id: 'e3', name: 'Elevação Lateral', sets: 4, reps: '15', weight: 10, rest_seconds: 45, rpe: 9 },
    ],
  },
  // ... workouts
];
