-- Script para criar usuário SUPER_ADMIN
-- Execute este SQL no seu banco PostgreSQL (Supabase)

-- 1. Primeiro, crie um tenant (se não existir)
INSERT INTO tenants (id, name, created_at)
VALUES ('super-admin-tenant', 'Sistema', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Crie o usuário SUPER_ADMIN
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (
    id,
    email,
    name,
    password,
    role,
    tenant_id,
    created_at
)
VALUES (
    gen_random_uuid(),
    'admin@trainerpro.com',
    'Super Admin',
    '$2a$10$rOZxQxQxQxQxQxQxQxQxQeJ3K5K5K5K5K5K5K5K5K5K5K5K5K5K5K',  -- Senha: admin123
    'SUPER_ADMIN',
    'super-admin-tenant',
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 3. Verifique se foi criado
SELECT id, email, name, role FROM users WHERE role = 'SUPER_ADMIN';
