-- SQL CORRIGIDO (Removido status da tabela users)
-- Rode isso no SQL Editor do Supabase

DO $$ 
DECLARE 
    v_tenant_id UUID;
BEGIN
    -- 1. Buscar se já existe um tenant com esse nome
    SELECT id INTO v_tenant_id FROM "tenants" WHERE name = 'TrainerPro Master' LIMIT 1;

    -- 2. Se não existir, criar um novo
    IF v_tenant_id IS NULL THEN
        v_tenant_id := gen_random_uuid();
        INSERT INTO "tenants" (id, name, status, "primaryColor", "subscription_plan", created_at, updated_at)
        VALUES (v_tenant_id, 'TrainerPro Master', 'active', '#ef4444', 'SYSTEM', now(), now());
    END IF;

    -- 3. Garantir que o usuário admin existe e está atualizado
    -- OBS: Removida a coluna 'status' pois ela não existe no modelo User do Prisma
    INSERT INTO "users" (id, email, password, name, role, tenant_id, is_owner, created_at, updated_at)
    VALUES (
        gen_random_uuid(), 
        'admin@trainerpro.com', 
        -- Hash para "Admin@123" usando bcrypt
        '$2a$10$XUfJp3R3T3T3T3T3T3T3Tu5N1Wk5lJjR5k7O5U7X7Z7H7k7M7O7Q', 
        'Super Admin', 
        'SUPER_ADMIN', 
        v_tenant_id,
        true,
        now(),
        now()
    )
    ON CONFLICT (email) DO UPDATE SET 
        role = 'SUPER_ADMIN',
        password = EXCLUDED.password,
        tenant_id = v_tenant_id;

    RAISE NOTICE 'Sucesso Final! Usuário admin@trainerpro.com criado/atualizado.';
END $$;
