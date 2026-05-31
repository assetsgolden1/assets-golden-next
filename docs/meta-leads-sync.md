# Meta Lead Ads → Google Sheets — Guía operativa

Sincronización automática de leads de Meta Instant Forms al Google Sheet dedicado.
El cron de Vercel dispara `/api/leads/sync-meta` cada 15 minutos.

---

## Variables de entorno requeridas

| Variable | Dónde conseguirla |
|---|---|
| `META_SYSTEM_USER_TOKEN` | Meta Business Manager → Configuración del negocio → Usuarios del sistema → Token |
| `META_LEAD_FORM_ID` | Meta Ads Manager → Formularios de clientes potenciales → ID del form |
| `META_LEADS_SHEET_ID` | URL del Sheet: `docs.google.com/spreadsheets/d/**{ID}**/edit` |
| `CRON_SECRET` | String aleatorio (ej: `openssl rand -hex 32`) |
| `GOOGLE_SHEETS_CREDENTIALS_JSON` | Ya configurado (Service Account compartida con el Sheet) |

Cargar todas en `.env.local` (desarrollo) y en **Vercel → Settings → Environment Variables** (producción).  
`META_SYSTEM_USER_TOKEN` debe marcarse como **Sensitive** en Vercel. Cargarlo **sin** ángulos `< >`.

---

## Estructura del Google Sheet (Meta Leads)

La pestaña debe llamarse `Hoja 1`. Columnas A→J:

| Col | Header sugerido |
|---|---|
| A | Fecha |
| B | Nombre |
| C | Email |
| D | Teléfono |
| E | Tipo propiedad |
| F | Presupuesto |
| G | Timeline |
| H | Purpose |
| I | Variante |
| J | Estado |

Compartir el Sheet como **Editor** con la Service Account:  
`assets-golden-sheets@agencia-automatizacion-490823.iam.gserviceaccount.com`

---

## Cómo regenerar el System User Token si expira

1. Ir a **Meta Business Manager** → Configuración del negocio → Usuarios → Usuarios del sistema
2. Seleccionar el usuario de sistema existente
3. Clic en **Generar nuevo token**
4. Seleccionar la app y permisos: `leads_retrieval`, `ads_read`
5. Copiar el token (sin ángulos)
6. Actualizar `META_SYSTEM_USER_TOKEN` en Vercel → redeploy automático

---

## Cómo cambiar el formulario (nueva campaña)

1. En Meta Ads Manager, abrir el formulario nuevo → copiar su ID numérico
2. Actualizar `META_LEAD_FORM_ID` en Vercel
3. Si el Sheet destino también cambia, actualizar `META_LEADS_SHEET_ID`
4. En el próximo ciclo de cron, el tracker buscará el historial del nuevo `form_id`  
   (primer sync recupera leads de los últimos 30 días)

---

## Cómo cambiar el Sheet destino

1. Crear el nuevo Sheet con pestaña `Hoja 1` y los 10 headers (ver tabla arriba)
2. Compartirlo como Editor con la Service Account
3. Copiar el ID del Sheet desde su URL
4. Actualizar `META_LEADS_SHEET_ID` en Vercel

---

## Sync manual (test o importar históricos)

```bash
# Desde terminal — sustituir {SECRET} y {URL}
curl -X GET "{URL}/api/leads/sync-meta" \
  -H "Authorization: Bearer {CRON_SECRET}"
```

En local (con `.env.local` cargado):
```bash
curl http://localhost:3000/api/leads/sync-meta \
  -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)"
```

La respuesta devuelve:
```json
{
  "ok": true,
  "leadsFound": 6,
  "leadsProcessed": 6,
  "errors": null
}
```

---

## Deduplicación

El sistema usa `meta_sync_log` en Supabase para trackear el timestamp del último sync exitoso.
En cada ejecución se piden solo leads creados **después** de ese timestamp (`since` en la Graph API).
No re-procesa leads anteriores.

Tabla en Supabase: `meta_sync_log`  
Columnas: `id`, `form_id`, `last_synced_at`, `leads_count`, `status`, `details`, `created_at`

---

## Diagnóstico / debugging

- **Vercel Logs** → Functions → `/api/leads/sync-meta` — logs en tiempo real del cron
- **Supabase** → Table editor → `meta_sync_log` — historial de cada ejecución con timestamp y conteo
- Si `status = 'error'`, la columna `details` contiene el mensaje de error
- El cron de Vercel requiere plan **Pro** o **Hobby con funciones Pro tier** para ejecutarse.  
  En plan Free puro, alternativa: GitHub Actions con schedule o Upstash QStash apuntando al mismo endpoint.
