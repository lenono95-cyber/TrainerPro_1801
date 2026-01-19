# TrainerPro - Painel Administrativo Web

> **Painel Super Admin** para gestão global do sistema TrainerPro

---

## 🎯 Sobre Este Projeto

Este é o **Painel Administrativo Web** do TrainerPro, exclusivo para **Super Admins**.

### ✅ Funcionalidades
- 📊 Dashboard com KPIs globais (MRR, Churn, LTV)
- 🏢 Gestão de Tenants (Academias e Personais)
- 📝 Audit Logs (Rastreamento de ações críticas)
- 💳 Billing (Planos e Pagamentos)
- 👁️ Impersonation (Login As)

### ❌ O que NÃO está aqui
Este repositório **não** contém:
- App Mobile (Trainer/Student)
- UI de gestão de alunos
- Criação de treinos
- Chat/Mensagens
- Agenda/Schedule

> **Nota:** O App Mobile está em um repositório separado e compartilha o backend (Server Actions + Prisma).

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- PostgreSQL (Supabase)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/TrainerPro_1801.git
cd TrainerPro_1801

# Instale as dependências
npm install

# Configure o banco de dados
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Execute as migrações
npx prisma generate
npx prisma db push

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000/admin/dashboard`

---

## 🔐 Autenticação

### Login como Super Admin

1. Crie um usuário Super Admin no banco:
```sql
INSERT INTO users (email, name, role, tenant_id, password)
VALUES ('admin@trainerpro.com', 'Super Admin', 'SUPER_ADMIN', 'tenant-id', 'hashed-password');
```

2. Acesse `/login`
3. Entre com as credenciais
4. Você será redirecionado para `/admin/dashboard`

---

## 📁 Estrutura do Projeto

```
TrainerPro_1801/
├── src/
│   ├── app/
│   │   └── admin/              # Rotas do Admin
│   │       ├── dashboard/      # Dashboard principal
│   │       ├── tenants/        # Gestão de tenants
│   │       ├── billing/        # Financeiro
│   │       └── logs/           # Audit logs
│   ├── components/
│   │   └── admin/              # Componentes do Admin
│   ├── actions/                # Server Actions (Backend)
│   ├── lib/                    # Utilitários
│   └── middleware.ts           # Proteção de rotas
├── prisma/
│   └── schema.prisma           # Schema do banco
└── ARCHITECTURE.md             # Documentação de arquitetura
```

---

## 🛠️ Tecnologias

- **Framework:** Next.js 14 (App Router)
- **UI:** React + TailwindCSS
- **Backend:** Server Actions + Prisma ORM
- **Banco:** PostgreSQL (Supabase)
- **Auth:** NextAuth.js
- **Deploy:** Vercel

---

## 📚 Documentação

- [Arquitetura](./ARCHITECTURE.md) - Decisões arquiteturais e separação Web/Mobile
- [Plano de Alinhamento](./.gemini/brain/*/alignment_plan.md) - Alinhamento com código original
- [Configuração do Banco](./GUIA_CONFIGURACAO_BANCO.md) - Setup do PostgreSQL

---

## 🔗 Links Relacionados

- **App Mobile:** `TrainerPro_Mobile` (repositório separado)
- **Backend Compartilhado:** `/src/actions/` (usado por Web e Mobile)
- **Schema Prisma:** `/prisma/schema.prisma`

---

## 📝 Licença

Proprietary - Todos os direitos reservados

---

**Última Atualização:** 18/01/2026
