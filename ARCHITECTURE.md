# TrainerPro - Arquitetura do Projeto

> **Status:** ✅ Freeze Arquitetural - 18/01/2026  
> **Versão:** 1.0.0  
> **Escopo:** Painel Administrativo Web (Super Admin)

---

## 📋 Definição Oficial

Este repositório representa **exclusivamente o Painel Administrativo Web** do sistema TrainerPro.

### ✅ O que ESTÁ neste repositório:
- **Painel Super Admin** (`/admin/*`)
  - Dashboard com KPIs globais
  - Gestão de Tenants (Academias/Personais)
  - Audit Logs (Logs de Auditoria)
  - Billing (Financeiro e Planos)
  - Impersonation (Login As)

### ❌ O que NÃO está neste repositório:
- **App Mobile** (Trainer e Student)
  - Gestão de Alunos
  - Criação de Treinos
  - Chat/Mensagens
  - Agenda/Schedule
  - Tracking/Evolução
  - Perfil do Aluno

---

## 🏗️ Separação de Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│                      ECOSSISTEMA TRAINERPRO                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────┐    ┌─────────────────────────┐  │
│  │  TrainerPro_1801       │    │  TrainerPro_Mobile      │  │
│  │  (Este Repositório)    │    │  (Repositório Separado) │  │
│  │                        │    │                         │  │
│  │  - Next.js 14          │    │  - React Native         │  │
│  │  - App Router          │    │  - Expo                 │  │
│  │  - Server Components   │    │  - Mobile-First         │  │
│  │  - Desktop UI          │    │                         │  │
│  │                        │    │  Roles:                 │  │
│  │  Role:                 │    │  - TRAINER              │  │
│  │  - SUPER_ADMIN         │    │  - STUDENT              │  │
│  │                        │    │  - ADMIN (owner)        │  │
│  └────────────────────────┘    └─────────────────────────┘  │
│             │                              │                 │
│             └──────────────┬───────────────┘                 │
│                            │                                 │
│                  ┌─────────▼──────────┐                      │
│                  │  Backend Compartilhado                    │
│                  │                                           │
│                  │  - Server Actions (/src/actions/*)        │
│                  │  - Prisma ORM (/prisma/*)                 │
│                  │  - PostgreSQL (Supabase)                  │
│                  │  - NextAuth.js (/src/lib/auth.ts)         │
│                  │  - Session Management                     │
│                  └───────────────────────────────────────────┘
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Diretórios (Atual)

### ✅ Produção (Mantido)
```
src/
├── app/
│   └── admin/              # ✅ Painel Admin (PRODUÇÃO)
│       ├── dashboard/
│       ├── tenants/
│       ├── billing/
│       └── logs/
├── components/
│   └── admin/              # ✅ Componentes Admin (PRODUÇÃO)
├── actions/                # ✅ Backend compartilhado (PRODUÇÃO)
├── lib/                    # ✅ Utilitários compartilhados (PRODUÇÃO)
└── middleware.ts           # ✅ Proteção de rotas (PRODUÇÃO)

prisma/                     # ✅ Schema compartilhado (PRODUÇÃO)
```

### ⚠️ Referência (Será movido para backup)
```
src/
├── app/
│   └── dashboard/          # ⚠️ UI Mobile (SERÁ MOVIDO)
│       ├── students/
│       ├── workouts/
│       ├── chat/
│       ├── schedule/
│       └── tracking/
└── components/
    ├── students/           # ⚠️ Componentes Mobile (SERÁ MOVIDO)
    ├── workouts/
    ├── chat/
    ├── schedule/
    └── tracking/
```

---

## 🔐 Autenticação e Autorização

### Middleware (`src/middleware.ts`)
```typescript
// Proteção de rotas /admin/* - apenas SUPER_ADMIN
if (req.nextUrl.pathname.startsWith("/admin")) {
    return token?.role === "SUPER_ADMIN";
}
```

### Roles Suportados Neste Repositório
- ✅ `SUPER_ADMIN` - Acesso total ao painel admin

### Roles do App Mobile (Outro Repositório)
- ❌ `ADMIN` - Dono do tenant (academy/personal)
- ❌ `TRAINER` - Personal trainer
- ❌ `STUDENT` - Aluno

---

## 🚀 Deploy

### Produção
- **URL:** `admin.trainerpro.com`
- **Plataforma:** Vercel
- **Ambiente:** Production
- **Usuários:** Super Admins apenas

### Mobile App
- **Plataforma:** Expo / App Store / Play Store
- **Repositório:** `TrainerPro_Mobile` (separado)
- **Backend:** Compartilha Server Actions deste repo

---

## 📦 Backend Compartilhado

### Server Actions (`/src/actions/`)
Todas as Server Actions são compartilhadas entre Web e Mobile:

- ✅ `admin.ts` - Gestão de tenants, audit logs
- ✅ `assessment.ts` - Avaliações físicas
- ✅ `billing.ts` - Assinaturas e pagamentos
- ✅ `chat.ts` - Mensagens
- ✅ `notification.ts` - Notificações
- ✅ `schedule.ts` - Agenda
- ✅ `student.ts` - Gestão de alunos
- ✅ `student-profile.ts` - Perfil do aluno
- ✅ `tracking.ts` - Evolução/medidas
- ✅ `workout.ts` - Treinos
- ✅ `message-template.ts` - Templates automáticos

### Prisma Schema (`/prisma/schema.prisma`)
Schema único compartilhado:
- ✅ Multi-tenancy (`tenant_id` em todas as tabelas)
- ✅ Todos os modelos (User, Student, Workout, etc.)
- ✅ Migrações sincronizadas

---

## 🗓️ Histórico de Decisões

### 18/01/2026 - Freeze Arquitetural
**Decisão:** Separar Painel Admin Web do App Mobile em repositórios distintos.

**Motivação:**
- Ciclos de deploy independentes
- Bundles otimizados (Web vs Mobile)
- Equipes podem trabalhar em paralelo
- Clareza de responsabilidades

**Impacto:**
- `/dashboard/*` será movido para `_backup/mobile_reference/`
- Apenas `/admin/*` permanece em produção
- Backend (`/src/actions/`, `/prisma/`) permanece compartilhado

---

## 📝 Próximos Passos

### Fase 1: Documentação ✅ CONCLUÍDO
- [x] Criar `ARCHITECTURE.md`
- [x] Definir escopo oficial
- [x] Documentar separação Web/Mobile

### Fase 2: Limpeza Controlada (Pendente)
- [ ] Mover `/src/app/dashboard/*` → `_backup/mobile_reference/`
- [ ] Mover componentes mobile → `_backup/mobile_reference/`
- [ ] Atualizar `middleware.ts` para redirecionar `/` → `/admin`
- [ ] Atualizar `README.md` com novo escopo

### Fase 3: Otimização (Futuro)
- [ ] Remover dependências mobile não utilizadas
- [ ] Otimizar bundle para Web apenas
- [ ] Configurar CI/CD específico para Admin

---

## 🔗 Links Úteis

- **Prisma Schema:** `/prisma/schema.prisma`
- **Server Actions:** `/src/actions/`
- **Admin Routes:** `/src/app/admin/`
- **Plano de Alinhamento:** `/.gemini/brain/*/alignment_plan.md`

---

## 📞 Contato

Para dúvidas sobre arquitetura, consulte este documento ou o `alignment_plan.md`.

**Última Atualização:** 18/01/2026 21:45 BRT
