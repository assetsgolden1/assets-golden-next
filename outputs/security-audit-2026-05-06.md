# Security Audit — Assets Golden — 2026-05-06

> Auditoría de secretos del proyecto. Solo lectura. Ningún cambio
> ejecutado. Plan de rotación documentado para ejecutar después.

## Resumen ejecutivo

- **¿Hay claves commiteadas en git?** **No.** El historial completo
  (`git log --all --full-history`) NO contiene ningún `.env`,
  `.env.local`, `.env.development`, `.env.production`, `.env.local.bak`,
  `.env.local.old` ni `.env.backup`. Los únicos matches con "env" en
  el path son `env.production.example` (template sin valores) y un
  endpoint `src/app/api/admin/debug-env/route.ts` (creado y luego
  removido — solo exponía booleanos/longitudes, no valores).
- **¿Hay secretos hardcoded en src/?** **No.** Cero matches para
  patrones de JWT Supabase, Stripe, Google OAuth tokens, AWS keys,
  PRIVATE KEY blocks, ni literales `API_KEY="…"`/`SECRET="…"`/
  `TOKEN="…"`. Todo el acceso a credenciales pasa por `process.env.X`.
- **Severidad global: 🟢 BAJA.** No hay exposición real. La rotación
  pedida es **preventiva** (las claves siguen activas y nunca fueron
  expuestas, pero conviene refrescarlas porque el JWT de Supabase
  vence recién en 2036 y la SA Google se compartió con otro proyecto
  de la agencia — ver hallazgos).
- **Tiempo estimado para rotación completa**: ~45–60 min para ambas
  claves, asumiendo acceso a Vercel + Supabase Dashboard + Google
  Cloud Console y un slot de redeploy disponible.

---

## Paso 2 — Historial git de archivos sensibles

Comandos ejecutados (salida vacía = OK):

```
git log --all --full-history -- .env.local           → (vacío)
git log --all --full-history -- .env                 → (vacío)
git log --all --full-history -- .env.development     → (vacío)
git log --all --full-history -- .env.production      → (vacío)
git log --all --full-history -- .env.local.bak       → (vacío)
git log --all --full-history -- .env.local.old       → (vacío)
git log --all --full-history -- .env.backup          → (vacío)
```

Verificación adicional — buscar cualquier archivo con "env" en path:

```
git log --all --name-only --oneline --full-history -- "*env*"
4e72574  feat: vercel config + sitemap + robots pre-deploy
   env.production.example                          ← template OK
6657607  debug: endpoint env vars
   src/app/api/admin/debug-env/route.ts            ← endpoint, no .env
1862b20  fix(security): requireAdmin en server actions + endpoints + matcher middleware
   src/app/api/admin/debug-env/route.ts            ← borrado en este commit
```

**Conclusión**: ningún archivo `.env*` con valores reales pasó por git.

---

## Paso 3 — `.gitignore`

Contenido completo:

```
# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

Cobertura de los patterns pedidos:

| Pattern         | Cubierto | Nota                                    |
|-----------------|----------|-----------------------------------------|
| `.env*`         | ✅       | línea 34                                |
| `.env.local`    | ✅       | cubierto por `.env*`                    |
| `.env.*.local`  | ✅       | cubierto por `.env*`                    |
| `*.pem`         | ✅       | línea 25                                |
| `*.key`         | ⚠️ falta | no listado explícitamente               |

**Recomendación menor**: agregar `*.key` y `*.json` (selectivo) cuando
se haga la rotación, por si en el futuro alguien guarda credenciales
de service account como archivo en el repo.

---

## Paso 4 — Búsqueda de secretos hardcoded

Patrones probados sobre `src/`, `scripts/`, `supabase/`, `public/`:

| Pattern                                                     | Matches |
|-------------------------------------------------------------|---------|
| `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` (JWT Supabase)       | 0       |
| `sk_live_\|sk_test_\|pk_live_\|pk_test_` (Stripe)           | 0       |
| `ya29\.` (Google OAuth tokens)                              | 0       |
| `BEGIN PRIVATE KEY\|BEGIN RSA PRIVATE KEY\|BEGIN OPENSSH …` | 0       |
| `AKIA[0-9A-Z]{16}` (AWS access key)                         | 0       |
| `(API_KEY\|SECRET\|TOKEN)\s*[:=]\s*"[…]{20,}"`              | 0       |

**Todos los accesos a secretos pasan por `process.env.X`.** Cero
hallazgos críticos.

---

## Paso 5 — Mapeo de uso de secretos (por env var)

### `SUPABASE_SERVICE_ROLE_KEY` (16 archivos)

Runtime (server-side, deployed):
- `src/lib/supabase/admin.ts:5` — cliente admin centralizado
- `src/app/api/admin/sync-habihub/route.ts:26` — cron HabiHub
- `src/app/api/admin/upload-image/route.ts:25` — uploads admin
- `src/app/api/leads/route.ts:90` — formulario público leads
- `src/app/api/demands/route.ts:16` — formulario `/mi-demanda`
- `src/app/api/collaborations/route.ts:16` — formulario colabs

Scripts CLI / one-off (solo dev local, NO deploy):
- `scripts/upload-hero-to-supabase.mjs:6`
- `scripts/seed-blog-posts.ts:26`
- `scripts/import-properties.ts:35`
- `scripts/import-team.ts:27`
- `scripts/import-destinations.ts:27`
- `scripts/import-blog.ts:27`
- `src/scripts/syncDestinations.ts:6`
- `src/scripts/rescrapeRetry.ts:7`
- `src/scripts/rescrapeDetails.ts:7`
- `src/scripts/forceUpdateDestinations.ts:6`

### `GOOGLE_SHEETS_CREDENTIALS_JSON` (2 archivos runtime)

- `src/lib/googleSheets.ts:18` — único consumidor real
- `src/app/api/admin/test-sheets/route.ts:26-29` — solo
  `console.log` con booleano y `length` (no expone el valor)

### `CRON_SECRET` (1 archivo)

- `src/app/api/admin/sync-habihub/route.ts:194`

### `UPSTASH_REDIS_REST_TOKEN` (1 archivo)

- `src/lib/ratelimit.ts:9` — fallback graceful si falta

### `RESEND_API_KEY` (1 archivo)

- `src/app/api/leads/route.ts:150`

### `N8N_WEBHOOK_URL` (4 archivos)

- `src/lib/supabase/queries.ts:489`
- `src/app/api/leads/route.ts:139`
- `src/app/api/demands/route.ts:47`
- `src/app/api/collaborations/route.ts:46`

Nota: el inventario previo (`outputs/inventario-servicios.md:109`)
indica que en `.env.local` el valor es placeholder
`your_n8n_webhook_url`. En código el `fetch` está condicionado a
que la env exista, así que no rompe — simplemente no dispara n8n.

---

## Paso 6 — Inventario de env vars del proyecto

Variables descubiertas en `src/` (todas via `process.env.X`):

| Env var                          | Tipo       | Notas                                        |
|----------------------------------|------------|----------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | PÚBLICA    | URL pública del proyecto Supabase            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | PÚBLICA    | anon key (segura para frontend, RLS)         |
| `NEXT_PUBLIC_SITE_URL`           | PÚBLICA    | https://assetsgolden.com                     |
| `SUPABASE_SERVICE_ROLE_KEY`      | SENSIBLE 🔴 | bypass RLS, acceso total a la DB             |
| `GOOGLE_SHEETS_CREDENTIALS_JSON` | SENSIBLE 🔴 | JSON con private key de service account      |
| `RESEND_API_KEY`                 | SENSIBLE 🟡 | envío email transaccional                    |
| `CRON_SECRET`                    | SENSIBLE 🟡 | autoriza el cron HabiHub                     |
| `UPSTASH_REDIS_REST_TOKEN`       | SENSIBLE 🟡 | rate limiting                                |
| `N8N_WEBHOOK_URL`                | SENSIBLE 🟡 | URL del webhook (semi-pública pero opaca)    |
| `GOOGLE_SHEETS_LEADS_ID`         | CONFIG     | ID del Sheet (semi-sensible)                 |
| `UPSTASH_REDIS_REST_URL`         | CONFIG     | endpoint Upstash (público)                   |
| `HABIHUB_FEED_BLANCA_CALIDA`     | CONFIG     | URL del feed XML                             |
| `HABIHUB_FEED_SOL`               | CONFIG     | URL del feed XML                             |
| `NODE_ENV`                       | CONFIG     | runtime                                      |
| `VERCEL_ENV`                     | CONFIG     | runtime (Vercel internal)                    |
| `AWS_LAMBDA_FUNCTION_NAME`       | CONFIG     | runtime (detecta serverless en PDF route)    |

---

## Plan de rotación — `SUPABASE_SERVICE_ROLE_KEY`

### a) Acceso al dashboard

Proyecto Supabase: **`mromkwpqrxpxbbxhdofs`** (URL en
`NEXT_PUBLIC_SUPABASE_URL`).

Ruta: `dashboard.supabase.com` → seleccionar proyecto → **Project
Settings → API → "service_role secret" → "Reveal" + "Reset"** (en
versiones recientes el botón puede llamarse "Roll" o "Generate new
key"; verificar UI actual antes de hacer click).

⚠️ El reset NO invalida la clave vieja inmediatamente en algunos
planes — Supabase deja una ventana de gracia. Aún así, asumir que
una vez generada la nueva, el **plan correcto es desplegar la nueva
en todos los entornos antes de revocar la vieja explícitamente**.

### b) Archivos del repo que la usan

**Runtime (deploy):** ver Paso 5, sección runtime (6 archivos).
Todos consumen via `process.env`, así que NO requieren cambio de
código — solo de la env var en Vercel.

**Scripts CLI:** 10 archivos. NO requieren cambio de código
tampoco; corren solo en local con `.env.local`.

### c) Entornos donde está configurada (Iván confirmar)

- [ ] Vercel — Environment "Production"
- [ ] Vercel — Environment "Preview"
- [ ] Vercel — Environment "Development" (si está configurado)
- [ ] `.env.local` de Iván (local dev)
- [ ] GitHub Actions secrets (verificar; no se vio workflow que
      la use, pero confirmar en `.github/workflows/`)
- [ ] Cualquier otra máquina/VM que corra los scripts de `import-*`

### d) Orden de rotación recomendado

1. **Generar la clave nueva** en Supabase Dashboard (la vieja sigue
   activa).
2. **Pegarla en Vercel** para los 3 entornos (Production, Preview,
   Development), una a la vez. Vercel re-encripta y la activa al
   siguiente deploy.
3. **Pegarla en `.env.local`** local de Iván.
4. **Disparar redeploy** en Vercel (Production primero — un commit
   trivial o "Redeploy" desde la UI).
5. **Verificar smoke tests** en producción (ver punto e).
6. **Revocar la clave vieja** en Supabase Dashboard solo después de
   confirmar que el deploy nuevo funciona end-to-end.

### e) Cómo verificar que la rotación funcionó

- `GET /api/admin/sync-habihub` (con sesión admin) responde 200 OK
  y procesa el feed.
- Lectura de tabla `properties` desde `/admin` carga la lista.
- Insert en tabla `leads` desde formulario público
  (`/contacto` → submit) crea registro nuevo.
- Si los 3 OK → rotación exitosa.

### f) Plan de rollback

- La clave vieja sigue activa hasta que se hace "revoke" explícito
  en Supabase, así que la rotación es reversible mientras no se
  haya hecho ese paso final.
- Si tras el redeploy algo falla con la nueva clave: editar la env
  var en Vercel volviendo al valor viejo, redeploy, y diagnosticar
  con calma.
- **No revocar la vieja** hasta que producción esté estable con la
  nueva por al menos 1 ciclo de cron HabiHub completo (7 días si el
  cron es semanal — confirmar frecuencia en `vercel.json`).

---

## Plan de rotación — `GOOGLE_SHEETS_CREDENTIALS_JSON`

### a) Service account actual

```
client_email: assets-golden-sheets@agencia-automatizacion-490823.iam.gserviceaccount.com
gcp_project:  agencia-automatizacion-490823
```

### b) Decisión: rotar key existente VS crear SA nueva

Según `outputs/inventario-servicios.md:113-124`, el proyecto GCP
`agencia-automatizacion-490823` es el **mismo** que usa el sistema
de la agencia (Maps Places, PageSpeed, etc.) desde n8n. **Sin
embargo**, la SA específica `assets-golden-sheets@…` parece
exclusiva de este proyecto (el nombre lo sugiere y el inventario
no menciona otros consumidores). Verificar antes:

- En GCP Console → IAM & Admin → Service Accounts →
  `assets-golden-sheets@…` → "Permissions" / "Used by": ver si hay
  workloads externos que usen sus keys.
- En el repo del proyecto agencia (`C:\…\agencia\…` si existe en
  local) y en n8n: buscar referencias a este `client_email`.

| Opción | Pros | Contras |
|--------|------|---------|
| **A — Rotar key de la SA actual** | Mínimos cambios. SA conserva permisos sobre el Sheet de leads. | Si la SA se usa en otros sistemas, los rompe. |
| **B — Crear SA nueva, dar acceso al Sheet, descartar la vieja** | Aislamiento total. Vieja SA queda intacta para otros usos. | Hay que reconfigurar share del Sheet y borrar permisos viejos. |

**Recomendación**: empezar con la verificación. Si la SA solo se usa
en este repo → **Opción A**. Si se descubre que la usa también
n8n/agencia → **Opción B**.

### c) Pasos — Opción A (rotar key existente)

1. **GCP Console** → IAM & Admin → Service Accounts → click en
   `assets-golden-sheets@agencia-automatizacion-490823…` → tab
   **"Keys"** → **"Add Key" → "Create new key" → JSON**.
2. Descargar el JSON, abrirlo, **copiar todo el contenido como una
   sola línea** (sin saltos de línea reales — los `\n` de la
   `private_key` se mantienen como literales `\n` dentro del
   string JSON; eso es correcto, no romperlo).
3. Pegar en Vercel como `GOOGLE_SHEETS_CREDENTIALS_JSON` en los 3
   entornos.
4. Pegar en `.env.local` de Iván para mantener dev sincronizado.
5. **Verificar share del Sheet**: el Sheet de leads
   (`GOOGLE_SHEETS_LEADS_ID`) ya está compartido con
   `assets-golden-sheets@…iam.gserviceaccount.com` con permiso
   "Editor". Como el `client_email` no cambia (es la misma SA),
   no hay que recompartir.
6. **Redeploy** en Vercel.
7. **Smoke test**: `GET /api/admin/test-sheets` (con sesión admin)
   → debe responder `{success: true}` y aparecer una fila "Test
   Usuario / test@test.com" en el Sheet.
8. Test end-to-end: enviar lead desde `/contacto` → confirmar que
   llega al Sheet **y** se persiste en Supabase `leads`.
9. **Borrar la key vieja**: GCP Console → la SA → tab "Keys" →
   identificar el key id viejo (mirar `private_key_id` en el JSON
   actual de `.env.local` antes de reemplazarlo) → "Delete".

### d) Pasos — Opción B (SA nueva)

1. GCP Console → IAM & Admin → Service Accounts → "Create service
   account" → nombre p.ej. `assets-golden-sheets-2026` → role
   "Editor" en el Sheet (NO en el proyecto entero).
2. Generar key JSON.
3. Compartir el Sheet de leads con el nuevo `client_email` (Editor).
4. Pegar JSON en Vercel + `.env.local` (los 3 entornos).
5. Redeploy + smoke tests (igual a Opción A pasos 6-8).
6. Una vez validado: revocar el share del Sheet con la SA vieja
   `assets-golden-sheets@…` y, si ya no la usa nadie más, borrar
   esa SA o su key.

### e) Plan de rollback

Idéntico al de Supabase: **la SA vieja queda activa hasta que se
borra la key explícitamente**. Si el redeploy falla, revertir la
env var al JSON viejo en Vercel, redeploy, diagnosticar.

Tip: guardar el JSON viejo en un password manager (no en el repo,
no en `.env.local` con un nombre temporal) durante la ventana de
rotación, para tener rollback inmediato disponible.

---

## Hallazgos adicionales

### 🟡 1. `test-sheets/route.ts` logea metadatos de credenciales

`src/app/api/admin/test-sheets/route.ts:24-29` imprime con
`console.log`:

- `GOOGLE_SHEETS_LEADS_ID` (valor completo — es un sheet ID, no
  ultra-secreto pero permite leer el Sheet si se combina con la
  SA).
- `!!GOOGLE_SHEETS_CREDENTIALS_JSON` y su `.length` (booleano y
  número, OK).

El log queda persistido en Vercel logs. No es crítico (endpoint
está protegido por `requireAdmin`), pero los logs de Vercel se
consultan a veces sin auth (vía CLI con token). Recomendación
menor: cambiar el log del Sheet ID a primeros/últimos 4 chars
(`xxxx…yyyy`) cuando se haga la rotación.

### 🟡 2. `debug-env/route.ts` existió en historia

Commit `6657607` (2026-04-26) creó
`src/app/api/admin/debug-env/route.ts` que devolvía via JSON
booleanos y longitudes de envs. Fue borrado en `1862b20`. **No
exponía valores reales**, así que no es un leak — pero queda como
recordatorio de no commitear endpoints así sin `requireAdmin` desde
el inicio (ese fue justamente el motivo del commit `1862b20`).

### 🟡 3. `.gitignore` no cubre `*.key`

Pattern menor a agregar. No hay `.key` en el repo hoy, pero por
defensa en profundidad conviene listarlo.

### 🟢 4. `N8N_WEBHOOK_URL` placeholder en `.env.local`

Según inventario, el valor en `.env.local` es
`your_n8n_webhook_url` (no real). Los 4 endpoints que lo usan tienen
`if (webhookUrl)` antes del fetch, así que no rompen. Verificar que
en Vercel **sí** apunte a la instancia real (o esté ausente y
graceful-disabled).

### 🟢 5. SA Google compartida con proyecto agencia

El GCP project `agencia-automatizacion-490823` aloja la SA pero
también es usado por n8n del sistema de la agencia (Maps Places,
PageSpeed). La SA específica `assets-golden-sheets@…` parece
exclusiva, pero **verificar antes de elegir Opción A vs B** del
plan de rotación de Sheets.

---

## Recomendación final

- **¿Es seguro rotar las claves esta semana?** Sí. No hay
  exposición activa, así que la rotación es planificada y reversible.
- **¿Hay algún blocker antes de rotar?**
  1. Confirmar acceso de Iván al Supabase Dashboard del proyecto
     `mromkwpqrxpxbbxhdofs` (titularidad PENDIENTE en inventario).
  2. Confirmar acceso a la GCP Console del proyecto
     `agencia-automatizacion-490823` (titularidad PENDIENTE).
  3. Si la SA Google se comparte con el sistema de la agencia,
     coordinar con Atilio antes de rotar (Opción B) o validar que la
     SA es exclusiva del repo Assets Golden (Opción A).
  4. Definir ventana de mantenimiento corta (~15 min) en horario
     bajo-tráfico para hacer redeploy sin riesgo de leads perdidos.
- **¿Qué claves rotar primero?**
  1. **`SUPABASE_SERVICE_ROLE_KEY`** — más crítica (acceso total a
     DB) y más simple (no toca terceros).
  2. **`GOOGLE_SHEETS_CREDENTIALS_JSON`** — segunda, una vez resuelto
     el dilema A/B.
  3. (Opcional, no pedido pero sano hacerlo en la misma ventana):
     `CRON_SECRET`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_TOKEN` —
     todos de bajo riesgo y rotación trivial (solo cambiar en Vercel).
