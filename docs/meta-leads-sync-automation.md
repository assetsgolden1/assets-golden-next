# Meta Lead Ads → Google Sheets — Sincronización automática

## Arquitectura del sistema

```
Vercel Cron (0 0 * * *)
    └─ GET /api/leads/sync-meta
            │
            ├─ fetchLeadsFromMeta()         ← Meta Graph API v19.0
            ├─ getSyncedLeadIds()           ← Supabase: meta_leads_synced
            ├─ getSyncedEmails()            ← Supabase: meta_leads_synced
            ├─ readMetaSheetEmails()        ← Google Sheets columna C
            │
            ├─ [filtra duplicados por ID + email]
            │
            ├─ parseMetaLead()             ← mapea field_data → Lead
            ├─ categorizeLead()            ← prioridad Alta/Media/Baja
            ├─ getSpecialStateNotes()      ← notas de estado
            │
            ├─ appendLeadToMetaSheet()     ← Google Sheets append A:K
            ├─ recordSyncedLeads()         ← Supabase: meta_leads_synced
            └─ updateSyncRun()             ← Supabase: meta_sync_runs
```

### Archivos clave

| Archivo | Rol |
|---|---|
| `src/lib/meta/leadsApi.ts` | Cliente Meta Graph API con paginación |
| `src/lib/meta/leadParser.ts` | Convierte field_data al formato del Sheet |
| `src/lib/meta/syncTracker.ts` | Deduplicación por ID/email en Supabase |
| `src/lib/meta/syncLog.ts` | Registro de runs en `meta_sync_runs` |
| `src/lib/leads/prioritizeLead.ts` | Lógica de priorización |
| `src/lib/googleSheets.ts` | Append + lectura de emails del Sheet |
| `src/app/api/leads/sync-meta/route.ts` | Cron endpoint (GET) |
| `src/app/api/leads/sync-meta/manual/route.ts` | Endpoint manual (POST) |

### Tablas Supabase

**`meta_leads_synced`** — un registro por lead ya cargado
```sql
meta_lead_id text PRIMARY KEY   -- ID de Meta (evita duplicados por ID)
form_id      text               -- separa leads de distintos formularios
email        text               -- evita duplicados por email
created_time timestamptz
synced_at    timestamptz DEFAULT now()
```

**`meta_sync_runs`** — un registro por ejecución del cron
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
form_id          text
started_at       timestamptz DEFAULT now()
finished_at      timestamptz
leads_fetched    int    -- total obtenidos de Meta
leads_duplicated int    -- salteados por deduplicación
leads_added      int    -- efectivamente cargados al Sheet
status           text   -- 'running' | 'ok' | 'error'
error_message    text
```

---

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `META_LEADS_SYNC_TOKEN` | Token del System User de Meta Business Manager |
| `META_LEADS_FORM_ID` | ID del formulario (hardcodeado: `1495878108643736`) |
| `META_LEADS_SHEET_ID` | ID del Google Sheet (hardcodeado: `1Q_PRvDe45XxRoB43JZGWVJyJli8Cqf0G2Ry8vJcvZcA`) |
| `META_LEADS_CRON_SECRET` | Token de seguridad para el endpoint cron |
| `GOOGLE_SHEETS_CREDENTIALS_JSON` | Service account JSON de Google |

---

## Cómo regenerar el System User Token si expira

1. Ir a **Meta Business Manager** → Configuración → Usuarios del sistema
2. Seleccionar el System User (ej: "Assets Golden Sync")
3. Clic en **"Generar token"**
4. Seleccionar permisos:
   - `leads_retrieval`
   - `ads_management`
   - `ads_read`
   - `pages_show_list`
   - `pages_read_engagement`
5. Copiar el token generado (solo se muestra una vez)
6. Actualizar `META_LEADS_SYNC_TOKEN` en:
   - `.env.local` (desarrollo local)
   - Vercel → Project Settings → Environment Variables → `META_LEADS_SYNC_TOKEN` (Production + Preview + Development)
7. Redeploy en Vercel para que tome el nuevo token

---

## Cómo cambiar el formulario (nueva campaña)

Si lanzás una nueva campaña con un formulario distinto:

1. En **Meta Ads Manager** → Lead Forms → copiar el ID del nuevo formulario
2. Actualizar `META_LEADS_FORM_ID` en `.env.local` y Vercel
3. Los leads del formulario anterior quedan registrados en `meta_leads_synced` con el `form_id` viejo — no afectan al nuevo

---

## Cómo cambiar el Sheet de destino

1. Crear el Sheet nuevo, compartirlo con la Service Account de Google (`assets-golden-sheets@...`)
2. Asegurarse que tenga una pestaña "Hoja 1" con headers en fila 1:
   `Fecha | Nombre | Email | Teléfono | Tipo | Presupuesto | Timeline | Purpose | Variante | Prioridad | Estado`
3. Actualizar `META_LEADS_SHEET_ID` en `.env.local` y Vercel

---

## Manual sync para debugging

```bash
# Con curl (local o producción)
curl -X POST https://[dominio]/api/leads/sync-meta/manual \
  -H "Authorization: Bearer [META_LEADS_CRON_SECRET]"

# O con el header alternativo
curl -X POST https://[dominio]/api/leads/sync-meta/manual \
  -H "X-Manual-Sync: [META_LEADS_CRON_SECRET]"
```

La respuesta es:
```json
{ "ok": true, "fetched": 10, "duplicated": 9, "added": 1 }
```

---

## Frecuencia del cron y limitación Vercel Hobby

El cron está configurado en `vercel.json` como `0 0 * * *` (medianoche UTC, 1 vez por día).

**Vercel Hobby** solo permite schedules de cron diario. El schedule `*/15 * * * *` (cada 15 min) causó que todos los builds fallaran silenciosamente (ver DAILY_LOG sesión 2026-06-01 FASE-4.L-DEPLOY-DEBUG).

### Opciones para sync más frecuente

**Opción A — Upgrade a Vercel Pro ($20/mes)**
- Cambiar `vercel.json` schedule a `*/15 * * * *`
- No requiere cambios de código

**Opción B — Upstash QStash (cron externo, plan gratuito)**
```
Dashboard: console.upstash.com → QStash → Schedules
Endpoint: POST https://[dominio]/api/leads/sync-meta/manual
Headers: Authorization: Bearer [META_LEADS_CRON_SECRET]
Schedule: */15 * * * *
```

**Opción C — GitHub Actions**
```yaml
# .github/workflows/sync-meta-leads.yml
on:
  schedule:
    - cron: '*/15 * * * *'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST ${{ secrets.SITE_URL }}/api/leads/sync-meta/manual \
            -H "Authorization: Bearer ${{ secrets.META_LEADS_CRON_SECRET }}"
```

---

## Regla de deduplicación

Para cada lead obtenido de Meta, se saltea si:
1. Su `meta_lead_id` ya existe en `meta_leads_synced` (tabla Supabase)
2. Su `email` ya existe en `meta_leads_synced` (tabla Supabase)
3. Su `email` ya existe en la columna C del Sheet (cubre leads cargados manualmente)

Solo se usa `APPEND` con `insertDataOption: INSERT_ROWS` — **nunca** se borran ni sobreescriben filas existentes.

---

## Diagnóstico de errores comunes

| Error | Causa | Solución |
|---|---|---|
| `Meta token inválido (401)` | Token expirado | Regenerar META_LEADS_SYNC_TOKEN |
| `Sin permiso leads_retrieval (403)` | Token sin permisos suficientes | Regenerar token con permisos correctos |
| `GOOGLE_SHEETS_CREDENTIALS_JSON no configurado` | Falta variable env | Verificar variable en Vercel |
| `duplicate key value violates unique constraint` | Bug en deduplicación | Revisar logs de la run en `meta_sync_runs` |

---

## Monitoreo

Ver historial de runs:
```sql
SELECT id, started_at, finished_at, leads_fetched, leads_duplicated, leads_added, status, error_message
FROM meta_sync_runs
ORDER BY started_at DESC
LIMIT 20;
```

Ver leads ya sincronizados:
```sql
SELECT meta_lead_id, email, form_id, synced_at
FROM meta_leads_synced
ORDER BY synced_at DESC
LIMIT 20;
```
