# Deploy Guide — BarberCRM

## Antes de hacer deploy por primera vez

### 1. Generar los registries localmente
```powershell
node node_modules/@nextsparkjs/core/scripts/build/registry.mjs
```
Commitear `.nextspark/registries/` al repo (ya está configurado en `.gitignore`).

### 2. Verificar el build local
```powershell
pnpm run build
```
Si falla localmente, va a fallar en Vercel. Resolver antes de pushear.

### 3. Variables de entorno en Vercel
Cargar manualmente en Vercel → Settings → Environment Variables:

| Variable | Valor en producción |
|---|---|
| `DATABASE_URL` | URL de Supabase |
| `BETTER_AUTH_SECRET` | mismo valor que local |
| `NEXT_PUBLIC_ACTIVE_THEME` | `barbercrm` |
| `NEXT_PUBLIC_APP_URL` | `https://tu-dominio.vercel.app` |
| `STRIPE_SECRET_KEY` | key real de Stripe |
| `STRIPE_WEBHOOK_SECRET` | webhook secret de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | key publicable de Stripe |
| `RESEND_API_KEY` | key de Resend |
| `GOOGLE_CLIENT_ID` | client ID de Google OAuth |
| `GOOGLE_CLIENT_SECRET` | client secret de Google OAuth |
| `ANTHROPIC_API_KEY` | key de Anthropic |
| `CRON_SECRET` | string aleatorio seguro (no el de dev) |

**NO cargar:** `NODE_ENV` (Vercel lo pone automático), `CYPRESS_*` (solo para tests locales).

### 4. Build Command en Vercel
En Vercel → Settings → Build & Development Settings:
```
node node_modules/@nextsparkjs/core/scripts/build/registry.mjs && next build
```

### 5. Configuración de Vercel
- **Framework Preset:** Next.js
- **Root Directory:** vacío (raíz del repo)
- **Node.js Version:** 20.x

---

## Cuando regenerás entidades

Cada vez que agregás o modificás entidades en `contents/themes/barbercrm/entities/`, regenerá los registries y commiteá:

```powershell
node node_modules/@nextsparkjs/core/scripts/build/registry.mjs
git add .nextspark/registries/
git commit -m "chore: regenerate nextspark registries"
git push
```

---

## Checklist antes de cada deploy

- [ ] `pnpm run build` pasa localmente
- [ ] Variables de entorno actualizadas en Vercel
- [ ] Si agregaste entidades: registries regenerados y commiteados
- [ ] Páginas nuevas de dashboard tienen `export const dynamic = 'force-dynamic'`
