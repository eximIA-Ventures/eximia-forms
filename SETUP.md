# eximIA Forms — Setup Guide

## 1. Supabase (Database)

### Rodar migrations
No SQL Editor do Supabase Dashboard, execute cada arquivo em `supabase/migrations/` na ordem:
- `001_initial_schema.sql`
- `002_increment_analytics_rpc.sql`
- `003_pilot_mode.sql`
- `004_saas_user_profiles.sql`
- `005_user_plan.sql`
- `006_ai_usage_tracking.sql`
- `007_stripe_billing.sql`

### Variáveis de ambiente
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 2. Stripe (Pagamentos)

### a) Criar conta em https://stripe.com

### b) Criar 3 Products + Prices no Stripe Dashboard
| Plano | Preço mensal (BRL) | Preço mensal (USD) |
|-------|-------------------|--------------------|
| Pro | R$29,90 | $7 |
| Business | R$99,90 | $19 |
| Enterprise | R$299,90 | $59 |

Para cada um:
1. Dashboard → Products → Add product
2. Nome: "eximIA Forms Pro" (ou Business/Enterprise)
3. Price: R$79/month (recurring, BRL)
4. Copie o Price ID (`price_xxx`)

### c) Configurar Webhook
1. Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://SEU-DOMINIO/api/webhooks/stripe`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copie o Webhook Signing Secret (`whsec_xxx`)

### d) Configurar Billing Portal
1. Dashboard → Settings → Billing → Customer portal
2. Ativar: "Allow customers to update subscriptions"
3. Ativar: "Allow customers to cancel subscriptions"

### e) Variáveis de ambiente
```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_BUSINESS=price_xxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxx
```

> **Dica:** Para testes, use as chaves do modo Test (`sk_test_xxx`).

---

## 3. Resend (Emails)

### a) Criar conta em https://resend.com

### b) Adicionar domínio e verificar DNS

### c) Variáveis de ambiente
```
RESEND_API_KEY=re_xxx
FROM_EMAIL=eximIA Forms <noreply@seudominio.com>
```

---

## 4. App URL

```
NEXT_PUBLIC_APP_URL=https://forms.eximia.co
```

---

## 5. Deploy

### Docker
```bash
docker build -t eximia-forms .
docker run -p 3000:3000 --env-file .env.production eximia-forms
```

### Vercel
```bash
vercel deploy --prod
```

Configure todas as variáveis de ambiente no dashboard do Vercel/Docker.

---

## Checklist de Go-Live

- [ ] Migrations rodadas no Supabase
- [ ] Stripe Products + Prices criados
- [ ] Stripe Webhook configurado
- [ ] Stripe Billing Portal ativado
- [ ] Resend configurado com domínio verificado
- [ ] Variáveis de ambiente configuradas no deploy
- [ ] Primeiro admin criado via `/api/setup`
- [ ] Testar: registro → login → criar form → publicar → responder
- [ ] Testar: upgrade via Stripe → webhook atualiza plano
- [ ] Testar: billing portal → cancelar → volta para free
