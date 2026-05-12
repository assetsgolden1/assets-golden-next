# Daily Log — Assets Golden Next

> Bitácora operativa del proyecto. Claude Code lee este archivo al
> iniciar sesión y lo actualiza al cerrar. NO modificar manualmente
> la sección "Historial de sesiones" — solo agregar entradas nuevas
> arriba.

---

## 🔴 Pendientes activos (orden de prioridad)

Lista viva. Claude Code la actualiza al final de cada sesión:
marca con `[x]` lo terminado, agrega nuevos pendientes detectados,
reordena si la prioridad cambió.

### Bloqueantes para go-live
- [x] BotID Basic implementado en formularios (reemplaza Cloudflare Turnstile — 3 endpoints + 1 server action)
- [ ] Refactor pipeline de leads: eliminar n8n, consolidar en `processLead`, agregar Resend a todos los endpoints (depende de acceso Resend de Atilio)
- [ ] Rotación de claves SUPABASE_SERVICE_ROLE_KEY y GOOGLE_SHEETS_CREDENTIALS_JSON
- [ ] Páginas legales GDPR: política de privacidad, términos, banner cookies (BORRADORES creados con [PLACEHOLDER]; pendiente validación legal y banner)
- [ ] Atilio o asesor legal: validar texto de las 3 páginas legales (`/politica-de-privacidad`, `/aviso-legal`, `/politica-de-cookies`) y reemplazar todos los `[PLACEHOLDER: …]` por valores reales (razón social, CIF, domicilio, registro mercantil, teléfono, emails, jurisdicción) — **CASI COMPLETO**: todos los 7 datos reemplazados excepto Tomo del Registro Mercantil (ver pendiente abajo)
- [ ] Atilio: aceptar/firmar los DPAs en los dashboards de Supabase, Vercel, Cloudflare, Google, Resend y Upstash. Algunos requieren accept-click, otros solicitar al soporte. Sin DPA aceptado, la frase de la política de privacidad §5 es inexacta.
- [ ] Aviso GDPR en formularios `/contacto` y `/mi-demanda`
- [ ] DNS de Atilio para conectar dominio assetsgolden.com

### Importantes (post go-live)
- [x] Audit log de cambios admin
- [ ] Migración de 166 imágenes legacy de Lovable a Supabase actual
- [ ] Test PDF en producción end-to-end con agente real
- [ ] Auditoría proyecto Supabase huérfano `yagrwbmsufpvjcgxkuoz`
- [ ] Definir criterios `/inversiones` con Atilio
- [ ] Monitoreo del cron y alertas
- [ ] Opt-out de AI training en Vercel Team Settings (revisar al migrar a Pro). Iván buscó en General, Security & Privacy, Billing, Members, Drains, Alerts del plan Hobby actual — toggle no visible. Posibilidades: (a) opción solo disponible en Pro, (b) Vercel movió/eliminó el setting, (c) está en sub-página no obvia. Re-evaluar después de upgrade.

### Limpieza técnica
- [ ] Borrar backup `properties_backup_20260429` (después de 1-2 crons sin issues)
- [ ] Limpiar variable zombie `conflictIds` del sync
- [ ] Actualizar `fast-xml-parser` de `^5.5.12` a `^5.7.0` (vuln MODERATE: XML comment/CDATA injection)
- [ ] Corregir `react-hooks/set-state-in-effect` en `PortalPropertiesGrid.tsx:341` (nueva regla React 19 en eslint-config-next@16.2.6) — nota: `nueva-propiedad/page.tsx` fue reescrito en sesión 9, verificar si el lint error persiste
- [ ] Refactor: extraer `<PropertyGalleryUpload />` como componente compartido entre create y edit forms (hoy es copy-paste idéntico)
- [x] Borrar carpeta vacía `src/app/admin/destinos/`
- [x] Borrar carpeta vacía `src/app/api/admin/update-destino/`
- [x] CSP: remover `api.anthropic.com`
- [x] Verificar bucket `team-photos` en Supabase (existe, público)

### Pendientes operativos (Atilio)
- [ ] Confirmar Tomo y Folio del Registro Mercantil de Barcelona con Atilio — bloqueante atenuado: Tomo y Folio quitados del texto público para no publicar con placeholder. Cuando Atilio los confirme, agregar al final de la cadena registral: `...Hoja B-562057, Inscripción 2, Tomo X, Folio Y`
- [ ] Acceso a cuenta Resend (dominio assetsgolden.com ya está verificado en su cuenta)
- [ ] Email del socio para crear cuenta admin
- [ ] Acceso al panel DNS del dominio
- [ ] Validar criterios `/inversiones`
- [ ] Firma de contrato comercial formal
- [ ] Decisión sobre infraestructura (cuentas IBott vs Assets Golden)
- [ ] Acceso Meta Business Manager, Google Ads, GA4, Search Console (Fase 2)

---

## 📝 Historial de sesiones

Append-only. Cada entrada nueva va ARRIBA (más reciente primero).
Formato: fecha, contexto, decisiones tomadas, archivos tocados,
commits, próximo paso sugerido.

---

### Sesión 2026-05-13 — fix paginador /propiedades (reemplazo 'pagina' → 'page')

**Contexto:** El paginador de /propiedades no funcionaba: los números y "Siguiente" no cambiaban la página. Diagnóstico: `PaginationBar` siempre genera `?page=N` (inglés), pero `propiedades/page.tsx` leía `params.pagina` (español) → la página recibía `undefined` y volvía siempre a página 1. `/destinos/[slug]` leía `sp.page` → funcionaba correctamente.

**Trabajo hecho:**
- 3 cambios en `src/app/(public)/propiedades/page.tsx`:
  1. Interface `Props.searchParams`: `pagina?: string` → `page?: string` (línea 36)
  2. Read del param: `params.pagina ?? '1'` → `params.page ?? '1'` (línea 45)
  3. Llamada a `PaginationBar`: `currentParams={{ ...pageParams, pagina: undefined }}` → `currentParams={pageParams}` (línea 188)
- Verificación post-cambio: 0 matches de `pagina` en el archivo ✓
- Build: `Compiled successfully in 17.0s`, TypeScript OK, 1108 páginas ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/propiedades/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual de Iván antes de commit.

**Próximo paso sugerido:**
1. Iván abre `/propiedades` en dev server y verifica que los botones del paginador navegan correctamente entre páginas
2. Verificar también `/inversiones` (usa el mismo `PaginationBar` — confirmar que NO tiene el mismo bug de `pagina` vs `page`)
3. Si OK: commit + push

---

### Sesión 2026-05-12 — placeholders legales reemplazados (excepto Tomo Registro Mercantil)

**Contexto:** Atilio confirmó los datos legales reales. Reemplazar todos los `[PLACEHOLDER: …]` en las 3 páginas legales por los valores definitivos.

**Trabajo hecho:**
- Reemplazados 7 tipos de placeholder en `politica-de-privacidad`, `aviso-legal` y `politica-de-cookies`:
  - RAZÓN_SOCIAL → `COVA FUMADA GROUP S.L.` (3 ocurrencias en privacidad, 3 en aviso-legal, 1 en cookies)
  - CIF_NIF → `B05380886`
  - DOMICILIO_FISCAL → `José Agustín Goytisolo 31, L5, 08970 Sant Joan Despí (Barcelona)`
  - REGISTRO_MERCANTIL → `Inscrita en el Registro Mercantil de Barcelona, Tomo [TOMO_PENDIENTE: confirmar con Atilio], Folio 1, Hoja B-562057, Inscripción 2`
  - TELEFONO → `+34 611 85 30 01`
  - EMAIL_CONTACTO → `hola@assetsgolden.com`
  - EMAIL_DERECHOS_GDPR → `admin@assetsgolden.com` (3 ocurrencias en privacidad, 1 en aviso-legal, 1 en cookies)
  - JURISDICCION → `Barcelona`
- Grep de verificación: 0 matches de cualquier placeholder original ✓
- Único `[TOMO_PENDIENTE: confirmar con Atilio]` queda en 2 archivos (privacidad:38, aviso-legal:38) hasta confirmación
- Build: `Compiled successfully in 19.4s` ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/politica-de-privacidad/page.tsx`
- MODIFIED: `src/app/(public)/aviso-legal/page.tsx`
- MODIFIED: `src/app/(public)/politica-de-cookies/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual antes de commit.

**Próximo paso sugerido:**
1. Iván abre las 3 páginas en dev server y verifica visualmente que los datos legales aparecen correctamente
2. Confirmar con Atilio el Tomo del Registro Mercantil de Barcelona → reemplazar el único `[TOMO_PENDIENTE]` que queda
3. Una vez verificado: commit + push

---

### Sesión 2026-05-10 — resumen del día (sesiones 1-9 + housekeeping)

**Resumen ejecutivo de todo el 2026-05-10:**

| Commit | Sesión | Qué |
|---|---|---|
| `43142d2` | s6 | Security patch Next.js 16.2.6 + React 19.2.6 |
| `454f638` | s7 | BotID Basic en 3 endpoints + 1 server action |
| `4c5134a` | s8 | Fix extractor HabiHub — dedup URLs fotos |
| `03f1e70` | s9 | Fotos múltiples: público sin límite, create form, ⭐ Principal |

**También hoy (sin commit de código, operaciones MCP/datos):**
- Dedup retroactivo de fotos: 48 propiedades, 176 URLs duplicadas
  eliminadas vía SQL en producción (backup en
  `gallery_urls_backup_dedup_20260510` — borrar en 1-2 semanas)
- `.gitignore` actualizado para excluir `outputs/inventario-servicios.md`

**Commits anteriores referenciados en el day-log:**
- `adbb6fc` — páginas legales GDPR (sesión 3, 2026-05-06)
- `b324d1d` — audit log admin (sesión 4, 2026-05-10)
- `e9e0ca7` — filtro destacadas con conteo en tabs (sesión 5, 2026-05-10)

**Próximo paso sugerido:**
Esperando respuesta de Atilio en 6 puntos pendientes:
1. Acceso Resend → desbloquea refactor pipeline de leads (bloqueante go-live)
2. Datos legales reales (CIF, domicilio, etc.) → reemplazar PLACEHOLDERs
3. DNS → conectar assetsgolden.com
4. Decisión titularidad infra (IBott vs Assets Golden)
5. SA Google sheets — ¿compartida con n8n/agencia? → decide cómo rotar
6. DPAs: aceptar en Supabase, Vercel, Cloudflare, Google, Resend, Upstash

Mientras tanto, pendientes atacables independientes de Atilio:
- Aviso GDPR en formularios `/contacto` y `/mi-demanda`
- Refactor `<PropertyGalleryUpload />` (componente compartido create/edit)
- Lint: `react-hooks/set-state-in-effect` en `PortalPropertiesGrid.tsx:341`
- Actualizar `fast-xml-parser` a `^5.7.0` (vuln MODERATE)

---

### Sesión 2026-05-10 — sesión 9 (fotos propiedades: mostrar todas, galería en create, imagen principal elegible)

**Contexto:** Después del dedup retroactivo (sesión 8) y el fix del
extractor HabiHub, quedan 3 problemas de fotos: (1) público truncaba a
6, (2) create form solo permitía 1 foto, (3) no había UI para elegir
imagen principal.

**Trabajo hecho:**

*Display público (trivial):*
- `src/app/(public)/propiedades/[slug]/page.tsx:68` → eliminado
  `.slice(0, 6)`. Ahora se muestran todas las fotos (promedio ~24 por
  propiedad). El JSON-LD schema también incluye todas.
- `src/components/portal/PortalPropertyDetail.tsx:31` → eliminado
  `.slice(0, 10)`. Portal agente muestra galería completa.

*Create form — galería completa (mediano):*
- `src/app/admin/nueva-propiedad/page.tsx` reescrito. Reemplazado el
  input simple de 1 foto por UI de galería completa:
  - Estado `galleryFiles: File[]` + `galleryPreviews: string[]`
  - Límite de `MAX_PHOTOS = 12` con alert si se excede
  - Grid 4 columnas con thumbnails, badge "Principal" en i=0,
    botón ⭐ "Principal" en i≠0, botón × para eliminar
  - Upload secuencial a `/api/admin/upload-image`
  - Envía `image_url: uploadedUrls[0]` y `gallery_urls: uploadedUrls`
  - `URL.revokeObjectURL()` en `removePhoto` para evitar memory leaks
- `src/app/api/admin/create-property/route.ts`: agregado `gallery_urls`
  al INSERT con dedup server-side (`[...new Set(...)]` + filtro HTTP)

*Botón "Hacer principal" — edit form (mediano):*
- `src/app/admin/propiedades/[id]/edit/page.tsx`: agregada función
  `makeMainImage(i)` que mueve el item al índice 0 del array en memoria.
  Badge "Principal" (i=0) ya existía — se mueve automáticamente.
  Botón ⭐ "Principal" visible en cada thumbnail con i≠0.

**Decisión DRY:** La UI de galería NO se extrajo a un componente
compartido `<PropertyGalleryUpload />` — copy-paste entre create y edit
por simplicidad (extracción estimada en +30-45 min extra). Anotado como
pendiente de refactor en limpieza técnica.

**Build:** `Compiled successfully in 16.5s`, TypeScript OK, 1108 páginas

**Verificaciones:**
- `.slice(0, 6)` en src → 0 matches ✓
- `.slice(0, 10)` en portal → 0 matches ✓
- `makeMainImage` definida (l.124) y usada (l.232) en edit ✓
- `gallery_urls` en create-property endpoint (l.64-65) ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/propiedades/[slug]/page.tsx`
- MODIFIED: `src/components/portal/PortalPropertyDetail.tsx`
- MODIFIED: `src/app/admin/nueva-propiedad/page.tsx` (reescrito)
- MODIFIED: `src/app/api/admin/create-property/route.ts`
- MODIFIED: `src/app/admin/propiedades/[id]/edit/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente validación visual.

**Próximo paso sugerido:**
1. Iván abre `/admin/nueva-propiedad` y prueba subir varias fotos,
   cambiar la principal, eliminar alguna, y crear la propiedad
2. Iván abre `/admin/propiedades/[id]/edit` en una propiedad con fotos
   y prueba el botón ⭐ Principal
3. Verificar que la galería pública de esa propiedad muestra todas las
   fotos (antes 6, ahora sin límite)
4. Si OK: commit + push

---

### Sesión 2026-05-10 — sesión 8 (fix extractor HabiHub — dedup URLs de fotos)

**Contexto:** Después del último sync se encontraron 48 propiedades (2%
del total) con URLs duplicadas en `gallery_urls`. Iván ejecutó SQL directo
en producción para limpiarlas (176 duplicados eliminados — no hay commit,
fue operación MCP directa). El bug estaba en el extractor del sync: el
array de imágenes del XML de HabiHub se asignaba sin deduplicar.

**Diagnóstico:** En `parseFeedProp()` (sync-habihub/route.ts), el array
`images` se construía con `.filter(url => url.length > 0 && url.startsWith('http'))`
pero sin eliminar repetidos. Luego se asignaba directo a `gallery_urls: images`.
El feed de HabiHub incluye URLs duplicadas en algunas propiedades, y sin
dedup en el extractor, cada sync lunes 03:00 UTC reintroducía los duplicados.

**Trabajo hecho:**
- Añadida función `dedupeImageUrls(urls: string[]): string[]` justo antes
  de `parseFeedProp` (línea 122). Preserva orden original (primera ocurrencia
  gana, usando Set + loop en lugar de `[...new Set()]` para control explícito
  de orden y filtrado de vacíos)
- En `parseFeedProp`: `const deduped = dedupeImageUrls(images)` antes del
  return; ambos campos ahora usan el array limpio:
  `image_url: deduped[0] ?? null` y `gallery_urls: deduped`
- Build limpio: `Compiled successfully in 17.1s`, TypeScript OK, 1108 páginas

**Nota operativa:** El SQL de dedup retroactivo (48 props, 176 fotos) fue
ejecutado por Iván desde Supabase MCP en sesión anterior — sin commit en el
repo, es una operación de datos, no de código.

**No hay tests del sync** — el extractor no tiene test suite propia. Para
validar habría que ejecutar el sync manual desde `/admin/sync` en staging/prod
y verificar que las propiedades previamente afectadas no vuelvan a tener
duplicados. Recomendable hacer la comprobación el próximo lunes tras el cron.

**Archivos tocados:**
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts` (+12 líneas: helper + 2 cambios)
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación.

**Próximo paso sugerido:**
1. Iván valida el diff y autoriza commit
2. Verificar post-cron del lunes 13/05: que las 48 propiedades no vuelvan
   a tener duplicados en `gallery_urls`
3. Decidir si se ataca el límite de 6 fotos en la galería pública
   (`/propiedades/[slug]/page.tsx:68` → `.slice(0, 6)`) — trivial

---

### Sesión 2026-05-10 — sesión 7 (BotID Basic en formularios públicos)

**Contexto:** Implementar protección anti-bots en los 7 formularios
públicos. Decisión arquitectural: BotID Basic (Vercel-native, gratis,
sin env vars) en lugar de Cloudflare Turnstile (más integrado al stack).

**Trabajo hecho:**
- `npm install botid` → `botid@1.5.11` (1 package added, 723 auditados)
- `next.config.ts`: wrapeado con `withBotId()` de `botid/next/config`
- Creado `src/instrumentation-client.ts` con `initBotId()` protegiendo
  3 paths: `/api/leads`, `/api/demands`, `/api/collaborations` (POST)
- `src/app/api/leads/route.ts`: `checkBotId()` al inicio del try,
  antes de parsear el body → 403 si isBot
- `src/app/api/demands/route.ts`: mismo patrón
- `src/app/api/collaborations/route.ts`: mismo patrón
- `src/app/(public)/vender-tu-piso/actions.ts`: `checkBotId()` al
  inicio del server action, antes de cualquier validación →
  return ActionState con error si isBot
- Build limpio: `Compiled successfully in 18.0s`, TypeScript OK,
  1108 páginas estáticas (mismo count que sesión 6)

**Verificaciones:**
- `checkBotId` en 4 archivos (import + call en cada uno) ✓
- `initBotId` en `src/instrumentation-client.ts` (import + call) ✓
- `withBotId` en `next.config.ts` (import + export) ✓

**Nota arquitectural:** Las server actions no se protegen con
`protect[]` de `initBotId` (URL generada por Next.js); su protección
es directamente en el código del action con `checkBotId()` server-side.
El plan Basic no requiere upgrade — está incluido en cualquier plan Vercel.

**Archivos tocados:**
- MODIFIED: `package.json` (botid añadido)
- MODIFIED: `package-lock.json`
- MODIFIED: `next.config.ts` (import withBotId + wrap export)
- CREATED: `src/instrumentation-client.ts`
- MODIFIED: `src/app/api/leads/route.ts`
- MODIFIED: `src/app/api/demands/route.ts`
- MODIFIED: `src/app/api/collaborations/route.ts`
- MODIFIED: `src/app/(public)/vender-tu-piso/actions.ts`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación visual.

**Próximo paso sugerido:**
1. Iván confirma que el build es el esperado y autoriza commit
2. Próximo bloqueante go-live independiente de Atilio:
   - Aviso GDPR en formularios `/contacto` y `/mi-demanda`
   - DNS (depende Atilio)
3. Pendiente que depende de Atilio: Resend access → refactor pipeline leads
4. Opcional (si se quiere pasar a BotID Pro): upgrade plan Vercel para
   analytics de detección de bots

---

### Sesión 2026-05-10 — sesión 6 (security patch Next.js + React)

**Contexto:** Vulnerabilidades de seguridad de mayo 2026 (auth bypass
via segment-prefetch URL, dynamic route parameter injection). Diagnóstico
previo confirmó patch update (no major/minor), riesgo mínimo.

**Trabajo hecho:**
- Aplicado `npm install next@16.2.6 react@19.2.6 react-dom@19.2.6 eslint-config-next@16.2.6`
  (7 packages changed, 722 auditados)
- Build limpio post-update: `Compiled successfully in 16.6s`, TypeScript OK,
  1108 páginas estáticas generadas (mismo count que antes del patch)
- Lint: 27 problemas (9 errores, 18 warnings) — todos pre-existentes EXCEPTO
  posiblemente los 2 errores `react-hooks/set-state-in-effect` (nueva regla
  habilitada en eslint-config-next@16.2.6, ver hallazgos)
- Diff stat verificado: solo `package.json` y `package-lock.json` modificados
  en esta sesión (src/ intacto)

**Hallazgos del `npm audit` (9 vulnerabilidades, NINGUNA introducida por
este patch — son transitorias pre-existentes):**
- `fast-xml-parser@5.5.12` (dep directa) — MODERATE, vulnerable <5.7.0.
  **ACCIONABLE:** actualizar a `^5.7.0`. Agregado a pendientes.
- `postcss` via next@16.2.6 — el fix requeriría next@9.3.3 (downgrade
  catastrófico). Es un falso positivo del npm audit. NO correr
  `npm audit fix --force`. Bloqueado hasta que Vercel publique next@16.3.0+.
- `hono@4.12.12`, `express-rate-limit@8.3.2`, `ip-address` — transitivas
  vía `shadcn → @modelcontextprotocol/sdk`. No accionable sin actualizar shadcn.
- `basic-ftp`, `fast-uri` — origen probable puppeteer/googleapis. No accionable.

**Errores lint potencialmente nuevos** (habilitados por eslint-config-next@16.2.6):
- `react-hooks/set-state-in-effect` en `src/app/admin/nueva-propiedad/page.tsx:34`
  y `src/components/portal/PortalPropertiesGrid.tsx:341`. No son bugs críticos
  pero sí anti-patrón en React 19. Agregado a pendientes limpieza técnica.

**Archivos tocados:**
- MODIFIED: `package.json` (4 versiones bumpeadas)
- MODIFIED: `package-lock.json` (7 packages actualizados)
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación visual.

**Próximo paso sugerido:**
1. Iván confirma que el build/lint es el esperado y autoriza commit
2. Resolver `fast-xml-parser` (`npm install fast-xml-parser@^5.7.0`) en la
   misma sesión o en una siguiente
3. Atacar `react-hooks/set-state-in-effect` como limpieza técnica menor
4. Próximo bloqueante go-live: Captcha Cloudflare Turnstile

---

### Sesión 2026-05-10 — sesión 5 (filtro destacadas admin — conteos en tabs)

**Contexto:** Iván pidió que Atilio pueda ver rápido las propiedades
con `featured=true` desde `/admin/propiedades`. Al explorar el código
se detectó que el tab "Destacadas" ya existía; lo que faltaba eran los
**conteos numéricos** en los tabs ("Todas (N)" / "Destacadas (N)").

**Trabajo hecho:**
- Eliminada la constante estática `TABS` del módulo; movida dentro
  del server component para poder inyectar counts dinámicos
- Agregadas 2 queries HEAD en paralelo al `Promise.all` existente:
  count total del catálogo (sin filtros) y count solo `featured=true`
- Los tabs "Todas" y "Destacadas" ahora muestran el conteo entre
  paréntesis con `toLocaleString('es-ES')`; los demás tabs sin count
- TypeScript: la guarda inicial `'count' in tab` no estrechaba el tipo
  cuando la propiedad es opcional; corregida a `tab.count !== undefined`
- Build limpio: `Compiled successfully` + todas las páginas estáticas
  generadas sin errores

**Patrón elegido:** Opción A (URL query param, `?filter=featured`).
Era el patrón ya existente en la página; sin cambios al cliente ni
al componente `PropiedadesTable`.

**Archivos tocados:**
- MODIFIED: `src/app/admin/propiedades/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación visual.

**Próximo paso sugerido:**
1. Iván valida visualmente que los tabs muestran los conteos correctos
   y que el tab "Destacadas" filtra bien
2. Una vez validado: commit + push (junto con sesión 4 si aún no se
   hizo)
3. Próximos pendientes bloqueantes go-live:
   - Captcha Cloudflare Turnstile (mayor prioridad)
   - Refactor pipeline leads cuando llegue acceso Resend de Atilio

---

### Sesión 2026-05-10 — sesión 4 (audit log admin)

**Contexto:** Iván pidió implementar un sistema de audit log para rastrear
cambios críticos de admins: tabla Supabase, helper reutilizable, aplicación
en server actions + endpoints críticos, y página `/admin/audit`.

**Trabajo hecho:**
- Migración `20260510000001_create_admin_audit_log.sql` creada en repo y
  aplicada vía Supabase MCP (tabla + 3 índices + RLS). Confirmada por Iván
  antes de proceder
- Creado `src/lib/audit.ts` con `logAdminAction()` best-effort: actor
  opcional (evita doble getUser), import estático de createClient,
  nullish coalescing consistente
- Modificado `src/app/admin/actions.ts`: 14 funciones ahora llaman
  `logAdminAction` — toggleFeatured, togglePropertyVisibility, deleteProperty,
  bulkDeleteProperties, createProperty, togglePropertySold, bulkMarkAsSold,
  deleteLead, createBlogPost, updateBlogPost, deleteBlogPost, createTeamMember,
  updateTeamMember, deleteTeamMember. Para deletes: fetch previo del label.
  Para creates: `.select('id').single()` para capturar el ID generado
- Modificados 6 endpoints API: create/update/delete/toggle-agent,
  send-password-reset, sync-habihub (condición `!isCronAuth`; pasa `actor`
  desde el user ya disponible en el route handler para evitar tercer getUser)
- Creada página `src/app/admin/audit/page.tsx`: tabla paginada (50/página),
  filtros GET por actor/action/entity_type, badges de color por tipo de acción,
  metadata collapsable vía `<details>`, paginación por URL params, enlace
  "Limpiar" cuando hay filtros activos
- Modificado `AdminSidebar.tsx`: agregado enlace "Auditoría" con icono
  ClipboardList antes de Ajustes

**Nota técnica:** `updateProperty` del spec original no existe como server
action en `actions.ts` — es el route handler `/api/admin/update-property/`.
No fue incluido en este scope (no estaba en PASO 6). Puede auditarse en
sesión futura si se prioriza.

**Archivos tocados:**
- CREATED: `supabase/migrations/20260510000001_create_admin_audit_log.sql`
- CREATED: `src/lib/audit.ts`
- CREATED: `src/app/admin/audit/page.tsx`
- MODIFIED: `src/app/admin/actions.ts` (14 funciones + import audit)
- MODIFIED: `src/app/api/admin/create-agent/route.ts`
- MODIFIED: `src/app/api/admin/update-agent/route.ts`
- MODIFIED: `src/app/api/admin/delete-agent/route.ts`
- MODIFIED: `src/app/api/admin/toggle-agent/route.ts`
- MODIFIED: `src/app/api/admin/send-password-reset/route.ts`
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`
- MODIFIED: `src/components/admin/AdminSidebar.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación visual del usuario.

**Próximo paso sugerido:**
1. Iván valida visualmente `/admin/audit` y confirma que las acciones se
   loguean correctamente (hacer una operación de prueba y verificar la fila)
2. Una vez validado: commit + push
3. Próximos pendientes a atacar (en orden sugerido):
   - Captcha Cloudflare Turnstile en formularios (bloqueante go-live)
   - Refactor pipeline de leads cuando llegue acceso Resend de Atilio
   - Migración de 166 imágenes legacy de Lovable (no depende de Resend)

---

### Sesión 2026-05-06 — sesión 3 (páginas legales GDPR — borradores)

**Contexto:** Iván pidió crear las páginas legales GDPR-compliant
requeridas antes del go-live: política de privacidad, aviso legal y
política de cookies. Banner de cookies + checkbox GDPR queda fuera
de esta sesión (depende de captcha + refactor de leads).

**Trabajo hecho:**
- Detectado en PASO 1 que `/politica-de-privacidad` ya existía
  (legacy de Lovable, 10 secciones razonables pero con datos
  hardcoded y secciones faltantes); decidida con el usuario la
  Opción B (ampliar manteniendo estructura)
- Reescrita `/politica-de-privacidad` con secciones añadidas:
  identidad completa (CIF, registro mercantil), transferencias
  internacionales (EU-US DPF + SCCs), lista completa de proveedores
  (Supabase, Vercel, Cloudflare, Resend, Google, Upstash), referencias
  a artículos del RGPD (15-22), citas a LOPDGDD y LSSI-CE
- Convertidos a `[PLACEHOLDER: …]` todos los datos hardcoded
  (razón social, CIF, domicilio, registro mercantil, teléfono,
  emails, jurisdicción) con sufijo del valor sospechado y nota
  para confirmación con Atilio
- Creada `/aviso-legal` desde cero con 10 secciones LSSI-CE Art. 10:
  identificación del prestador, objeto y aceptación, condiciones
  de uso, propiedad intelectual, información sobre los inmuebles
  (no constituye oferta contractual), limitación de responsabilidad,
  comunicaciones electrónicas, protección de datos, modificaciones,
  legislación aplicable y jurisdicción
- Creada `/politica-de-cookies` desde cero con 8 secciones según
  guía AEPD: definición, tipos (técnicas estrictamente necesarias
  con tabla detallada de cookies Supabase/Cloudflare/Vercel,
  analíticas previstas con GA4, publicitarias previstas con Meta
  Pixel/Google Ads), base jurídica, gestión y revocación con
  enlaces a navegadores, transferencias internacionales,
  retención (24 meses AEPD), modificaciones
- Footer (`src/components/Footer.tsx`): agregados enlaces a
  `/aviso-legal` y `/politica-de-cookies` junto al ya existente de
  privacidad en el bottom-bar; ajustado layout para que envuelva en
  móvil
- Sitemap (`src/app/sitemap.ts`): añadidas las 3 rutas con
  `priority: 0.3` y `changeFrequency: 'yearly'`
- Build limpio: `Compiled successfully` + `Finished TypeScript`,
  las 3 rutas legales aparecen como `○ (Static)`

**Archivos tocados:**
- MODIFIED: `src/app/(public)/politica-de-privacidad/page.tsx`
  (reescrita, v1.0 → v2.0)
- CREATED: `src/app/(public)/aviso-legal/page.tsx`
- CREATED: `src/app/(public)/politica-de-cookies/page.tsx`
- MODIFIED: `src/components/Footer.tsx`
- MODIFIED: `src/app/sitemap.ts`
- MODIFIED: `DAILY_LOG.md` (esta entrada + nuevo pendiente Atilio)

**Commits:** ninguno todavía — pendiente de validación visual del
usuario.

**Próximo paso sugerido:**
1. Iván abre las 3 páginas en el dev server y revisa visualmente
   (espaciado, jerarquía, tabla de cookies en mobile).
2. Una vez validado: commit + push.
3. Después atacar uno de los siguientes pendientes activos:
   - **Banner de cookies + GDPR checkbox** en formularios
     (pareja natural: aprovechar para integrar Cloudflare Turnstile
     en los 3 endpoints + 1 server action que ya están como
     bloqueante go-live)
   - O esperar acceso Resend de Atilio para refactor pipeline leads
4. Cuando Atilio tenga lista la documentación legal real (CIF,
   registro mercantil, dirección completa, emails de privacidad),
   reemplazar los `[PLACEHOLDER: …]` en las 3 páginas + bottom-bar
   del footer si la razón social difiere de "CFG Global Investment S.L.".

---

### Sesión 2026-05-06 — sesión 2 (auditoría de claves + plan de rotación)

**Contexto:** Iván pidió un diagnóstico completo del estado de
secretos del proyecto antes de ejecutar la rotación pendiente. Solo
lectura — sin modificaciones, sin rotación.

**Trabajo hecho:**
- Verificado historial git completo (`--all --full-history`) para
  `.env`, `.env.local`, `.env.development`, `.env.production` y
  variantes `.bak/.old/.backup`: ninguno commiteado nunca
- Auditado `.gitignore`: cubre `.env*` y `*.pem`; falta `*.key`
  (recomendación menor, no bloqueante)
- Búsqueda exhaustiva de secretos hardcoded en src/scripts/supabase
  (patrones JWT Supabase, Stripe, OAuth, AWS, PRIVATE KEY,
  literales API_KEY/SECRET/TOKEN): **0 matches críticos**, todo
  pasa por `process.env.X`
- Mapeados los 16 archivos que consumen `SUPABASE_SERVICE_ROLE_KEY`
  (6 runtime + 10 scripts CLI) y los 2 que consumen
  `GOOGLE_SHEETS_CREDENTIALS_JSON`
- Inventariadas 16 env vars del proyecto, clasificadas en
  pública/sensible/config
- Plan de rotación documentado para ambas claves con orden, smoke
  tests, rollback y blockers identificados
- Hallazgos menores anotados: `test-sheets/route.ts` logea
  Sheet ID completo en Vercel logs; `debug-env/route.ts` existió
  en historia (sin leak real, ya removido); SA Google compartida
  con proyecto agencia (relevante para Opción A vs B)

**Severidad global del audit:** 🟢 BAJA — no hay exposición real, la
rotación es preventiva.

**Archivos tocados:**
- CREATED: `outputs/security-audit-2026-05-06.md`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de OK del usuario.

**Próximo paso sugerido:**
1. Iván revisa `outputs/security-audit-2026-05-06.md`.
2. Confirmar antes de rotar:
   - Titularidad/acceso al Supabase Dashboard `mromkwpqrxpxbbxhdofs`
   - Titularidad/acceso a GCP Console `agencia-automatizacion-490823`
   - Si la SA `assets-golden-sheets@…` se comparte con n8n/agencia
     (decide Opción A vs B para rotar Sheets)
3. Coordinar ventana de mantenimiento (~15 min) en horario bajo-tráfico
4. Ejecutar rotación: primero `SUPABASE_SERVICE_ROLE_KEY`, después
   `GOOGLE_SHEETS_CREDENTIALS_JSON`. Opcionalmente aprovechar para
   rotar también `CRON_SECRET`, `RESEND_API_KEY`,
   `UPSTASH_REDIS_REST_TOKEN`.

---

### Sesión 2026-05-06 (cleanup técnico + sistema DAILY_LOG)

**Contexto:** sesión de limpieza menor + introducción del sistema DAILY_LOG.

**Trabajo hecho:**
- Borradas carpetas vacías `src/app/admin/destinos/` y `src/app/api/admin/update-destino/`
- Eliminada variable zombie `conflictIds` del sync HabiHub (era Set sin .add())
- Removido `api.anthropic.com` del CSP de next.config.ts (no se usaba)
- Verificado bucket `team-photos` en Supabase (existe y está OK)
- Creado este DAILY_LOG.md con el sistema de bitácora

**Archivos tocados:**
- DELETED: `src/app/admin/destinos/`, `src/app/api/admin/update-destino/`
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`, `next.config.ts`, `CLAUDE.md`
- CREATED: `DAILY_LOG.md`

**Commits:**
- `e73892a` — chore(cleanup): borrar carpetas vacías + variable zombie + CSP unused
- `4cd32b4` — feat(devx): sistema DAILY_LOG.md para bitácora entre sesiones

**Próximo paso sugerido:** Esperar acceso a Resend de Atilio para hacer
el refactor del pipeline de leads. Mientras tanto, atacar item de
pendientes activos (auditoría de claves o páginas legales GDPR).

---

*Última edición automática por Claude Code: 2026-05-10 (cierre del día)*
