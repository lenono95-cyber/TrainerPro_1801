# Configuração de Domínio Customizado

## 🎯 Domínio Recomendado: admin.trainerpro.com

### Por Que Usar Domínio Customizado?
- ✅ Mais profissional e "enterprise"
- ✅ Reforça branding TrainerPro
- ✅ Fácil de lembrar
- ✅ Independente do provedor

### Domínios
- **Temporário:** `trainerpro-admin.vercel.app` (gerado automaticamente)
- **Produção:** `admin.trainerpro.com` ⭐ **RECOMENDADO**

---

## 📋 Configuração Rápida

### 1. Adicionar na Vercel
- Settings → Domains → Add: `admin.trainerpro.com`

### 2. Configurar DNS
Adicione registro CNAME no seu provedor DNS:

| Type  | Name  | Value                |
|-------|-------|---------------------|
| CNAME | admin | cname.vercel-dns.com |

### 3. Atualizar NEXTAUTH_URL
```
NEXTAUTH_URL=https://admin.trainerpro.com
```

### 4. Redeploy
Vercel → Deployments → Redeploy

---

## ✅ Validação
- [ ] DNS propagado (5-30 min)
- [ ] SSL ativo (cadeado verde)
- [ ] Login funciona
- [ ] Dashboard acessível

---

**Guia completo:** Ver documentação detalhada em `implementation_plan.md` (seção Custom Domain)
