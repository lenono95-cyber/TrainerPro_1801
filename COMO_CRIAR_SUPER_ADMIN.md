# Como Criar o Usuário SUPER_ADMIN

## ⚠️ O seed automático falhou

Você precisa criar o usuário manualmente no Supabase.

---

## 📋 Passo a Passo

### 1. Acesse o Supabase
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto TrainerPro

### 2. Abra o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Cole o SQL
Abra o arquivo `CREATE_SUPER_ADMIN.sql` e copie todo o conteúdo.

Ou copie diretamente daqui:

```sql
-- 1. Criar tenant
INSERT INTO tenants (id, name, document, subscription_plan, created_at)
VALUES (
    'super-admin-tenant',
    'Sistema TrainerPro',
    '00.000.000/0000-00',
    'SYSTEM',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar SUPER_ADMIN
INSERT INTO users (
    id,
    tenant_id,
    email,
    name,
    password,
    role,
    is_owner,
    created_at
)
VALUES (
    gen_random_uuid(),
    'super-admin-tenant',
    'admin@trainerpro.com',
    'Super Admin',
    '$2b$10$LhM24FJXHZFsgdaFI2EUxOHPHhbhdRZk35qMIqC4ojcYT4RfaXtiO',
    'SUPER_ADMIN',
    true,
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2b$10$LhM24FJXHZFsgdaFI2EUxOHPHhbhdRZk35qMIqC4ojcYT4RfaXtiO',
    role = 'SUPER_ADMIN',
    is_owner = true;

-- 3. Verificar
SELECT id, email, name, role FROM users WHERE email = 'admin@trainerpro.com';
```

### 4. Execute
- Clique em **Run** (ou pressione Ctrl+Enter)
- Você deve ver uma mensagem de sucesso
- O SELECT final mostrará o usuário criado

### 5. Faça Login
- Acesse: `http://localhost:3000/login`
- **Email:** `admin@trainerpro.com`
- **Senha:** `Admin@123`

---

## ✅ Credenciais

📧 **Email:** `admin@trainerpro.com`  
🔐 **Senha:** `Admin@123`  
👤 **Role:** `SUPER_ADMIN`

---

## 🔍 Verificar no Banco

Se quiser verificar se o usuário foi criado:

```sql
SELECT 
    u.email,
    u.name,
    u.role,
    u.is_owner,
    t.name as tenant_name
FROM users u
JOIN tenants t ON u.tenant_id = t.id
WHERE u.role = 'SUPER_ADMIN';
```

---

## ❓ Problemas?

Se ainda der erro de "Credenciais inválidas":

1. Verifique se o usuário foi criado:
   ```sql
   SELECT * FROM users WHERE email = 'admin@trainerpro.com';
   ```

2. Verifique se a senha está correta (hash):
   ```
   $2b$10$LhM24FJXHZFsgdaFI2EUxOHPHhbhdRZk35qMIqC4ojcYT4RfaXtiO
   ```

3. Tente recriar executando o SQL novamente (ON CONFLICT fará UPDATE)

---

**Arquivo SQL completo:** `CREATE_SUPER_ADMIN.sql`
