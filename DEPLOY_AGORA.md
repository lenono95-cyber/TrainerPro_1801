# Deploy na Vercel - Próximos Passos

## ✅ Concluído
- [x] Código commitado no Git
- [x] Push para GitHub: `lenono95-cyber/TrainerPro_1801`
- [x] 213 arquivos enviados (417 KB)

---

## 🚀 PRÓXIMO PASSO: Criar Projeto na Vercel

### 1. Acessar Vercel
👉 **Acesse:** https://vercel.com/new

### 2. Importar Repositório

1. **Login no Vercel** (use GitHub para facilitar)
2. Clique em **"Import Git Repository"**
3. Procure por: `TrainerPro_1801`
4. Clique em **"Import"**

### 3. Configurar Projeto

**Project Name:**
```
trainerpro-admin
```

**Framework:** Next.js (detectado automaticamente) ✅

**Root Directory:** `.` (deixe padrão) ✅

**Build Settings:** (deixe padrão)
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

⚠️ **NÃO CLIQUE EM "Deploy" AINDA!**

---

## 🔐 4. Configurar Variáveis de Ambiente

Expanda **"Environment Variables"** e adicione:

### DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres.PROJECT:PASSWORD@HOST:5432/postgres
Environment: ✅ Production ✅ Preview ✅ Development
```

**⚠️ IMPORTANTE:** Use a URL real do Supabase!
- Supabase → Settings → Database → Connection String

### NEXTAUTH_URL (Production)
```
Name: NEXTAUTH_URL
Value: https://trainerpro-admin.vercel.app
Environment: ✅ Production
```

### NEXTAUTH_URL (Preview)
```
Name: NEXTAUTH_URL
Value: https://trainerpro-admin-git-main.vercel.app
Environment: ✅ Preview
```

### NEXTAUTH_URL (Development)
```
Name: NEXTAUTH_URL
Value: http://localhost:3000
Environment: ✅ Development
```

### NEXTAUTH_SECRET
```bash
# Gerar secret:
openssl rand -base64 32
```

```
Name: NEXTAUTH_SECRET
Value: [COLE O SECRET GERADO]
Environment: ✅ Production ✅ Preview ✅ Development
```

---

## 5. Executar Deploy

Após configurar TODAS as variáveis:

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos
3. Vercel irá:
   - ✅ Clonar repositório
   - ✅ Instalar dependências
   - ✅ Executar build
   - ✅ Fazer deploy

---

## 6. Após Deploy Concluir

**URL gerada:** `https://trainerpro-admin.vercel.app`

**Teste:**
1. Acesse a URL
2. Deve redirecionar para `/login`
3. Faça login com: `admin@trainerpro.com` / `Admin@123`
4. Deve acessar `/admin/dashboard`

---

## ⚠️ Se Houver Erros

**Erro 500:** Verifique DATABASE_URL  
**Login falha:** Execute SQL de criação do SUPER_ADMIN no Supabase  
**Build falha:** Verifique logs no Vercel

---

**Siga os passos acima e me informe quando o deploy concluir!**
