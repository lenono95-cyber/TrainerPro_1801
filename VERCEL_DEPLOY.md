# Vercel Deployment - Quick Reference

## 🚀 Deploy Checklist

### Pre-Deploy
- [x] Build passes (`npm run build`)
- [x] Environment variables documented
- [ ] Code pushed to GitHub
- [ ] Vercel account ready

### Vercel Setup
- [ ] Project created on Vercel
- [ ] Repository imported
- [ ] Environment variables configured:
  - [ ] DATABASE_URL (Production, Preview, Development)
  - [ ] NEXTAUTH_URL (Production, Preview, Development)
  - [ ] NEXTAUTH_SECRET (Production, Preview, Development)

### Deploy
- [ ] First deploy executed
- [ ] Build successful
- [ ] URL generated

### Validation
- [ ] `/` redirects to `/login`
- [ ] `/login` loads correctly
- [ ] Login works with `admin@trainerpro.com`
- [ ] `/admin/dashboard` accessible after login
- [ ] `/admin/tenants` works
- [ ] `/admin/billing` works
- [ ] `/admin/logs` works

## 🔑 Environment Variables

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### DATABASE_URL
```
postgresql://postgres.PROJECT:PASSWORD@HOST:5432/postgres
```
Get from: Supabase → Settings → Database → Connection String

### NEXTAUTH_URL
- Production: `https://trainerpro-admin.vercel.app`
- Preview: `https://trainerpro-admin-git-BRANCH.vercel.app`
- Development: `http://localhost:3000`

**⭐ RECOMENDADO para Produção:**
Use domínio customizado: `https://admin.trainerpro.com`
(Ver `CUSTOM_DOMAIN.md` para configuração)

### NEXTAUTH_SECRET
Use output from `openssl rand -base64 32`

## 🆘 Quick Troubleshooting

**500 Error:** Check DATABASE_URL  
**Unauthorized:** Check NEXTAUTH_URL and NEXTAUTH_SECRET  
**Login fails:** Create SUPER_ADMIN user in Supabase  
**Connection failed:** Verify DATABASE_URL format

## 📍 Test URLs

After deploy, test:
- `https://YOUR-URL.vercel.app/`
- `https://YOUR-URL.vercel.app/login`
- `https://YOUR-URL.vercel.app/admin/dashboard`
- `https://YOUR-URL.vercel.app/admin/tenants`

---

**Full guide:** See `implementation_plan.md`
