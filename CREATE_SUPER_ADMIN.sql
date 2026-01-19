-- ============================================
-- CRIAR USUÁRIO SUPER_ADMIN - PRONTO PARA USAR
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Criar tenant para Super Admin
INSERT INTO tenants (id, name, document, subscription_plan, created_at, updated_at)
VALUES (
    'super-admin-tenant',
    'Sistema TrainerPro',
    '00.000.000/0000-00',
    'SYSTEM',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar usuário SUPER_ADMIN
-- Email: admin@trainerpro.com
-- Senha: Admin@123

INSERT INTO users (
    id,
    tenant_id,
    email,
    name,
    password,
    role,
    is_owner,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'super-admin-tenant',
    'admin@trainerpro.com',
    'Super Admin',
    '$2b$10$LhM24FJXHZFsgdaFI2EUxOHPHhbhdRZk35qMIqC4ojcYT4RfaXtiO',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2b$10$LhM24FJXHZFsgdaFI2EUxOHPHhbhdRZk35qMIqC4ojcYT4RfaXtiO',
    role = 'SUPER_ADMIN',
    is_owner = true,
    updated_at = NOW();

-- 3. Verificar se foi criado
SELECT 
    id,
    email,
    name,
    role,
    is_owner,
    created_at
FROM users 
WHERE email = 'admin@trainerpro.com';
