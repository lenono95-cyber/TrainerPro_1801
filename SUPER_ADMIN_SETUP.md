# Criar Usuário SUPER_ADMIN

## Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse seu projeto no Supabase: https://supabase.com
2. Vá em **SQL Editor**
3. Cole e execute este SQL:

```sql
-- Criar tenant para super admin
INSERT INTO tenants (id, name, created_at)
VALUES ('super-admin-tenant', 'Sistema', NOW())
ON CONFLICT (id) DO NOTHING;

-- Criar usuário SUPER_ADMIN
-- Email: admin@trainerpro.com
-- Senha: Admin@123
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
    '$2a$10$YourHashedPasswordHere',  -- Você precisa gerar o hash
    'SUPER_ADMIN',
    'super-admin-tenant',
    NOW()
);
```

## Opção 2: Via Seed Script (Automático)

Execute no terminal:

```bash
npm run seed
```

Isso criará automaticamente um usuário SUPER_ADMIN.

## Opção 3: Gerar Hash de Senha

Se quiser criar manualmente, primeiro gere o hash da senha:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('SuaSenhaAqui', 10));"
```

Depois use o hash no SQL acima.

---

## Credenciais Padrão (após seed)

- **Email:** `admin@trainerpro.com`
- **Senha:** `Admin@123`
- **Role:** `SUPER_ADMIN`

---

## Acesso

Após criar o usuário, acesse:
- **URL:** `http://localhost:3000/login`
- **Email:** `admin@trainerpro.com`
- **Senha:** A senha que você definiu

Você será redirecionado para `/admin/dashboard`.

---

## ⚠️ Importante

Este login é **APENAS para SUPER_ADMIN**.

**NÃO é para:**
- Personal Trainers (TRAINER/ADMIN) - Eles usarão o App Mobile
- Alunos (STUDENT) - Eles usarão o App Mobile

O App Mobile será um repositório separado.
