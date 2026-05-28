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
- [ ] EL-1/F — Sección "Propiedades similares" en /propiedades/[slug] (diferido de Fase 3.A — Bloque 4)
- [ ] Migración de 166 imágenes legacy de Lovable a Supabase actual
- [ ] Test PDF en producción end-to-end con agente real
- [ ] Auditoría proyecto Supabase huérfano `yagrwbmsufpvjcgxkuoz`
- [x] Definir criterios `/inversiones` con Atilio — implementado vía `classification='investment'`
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
- [x] Verificar bucket `team-photos` en Supabase (existe, público — INSERT policy aplicada en FASE-4.A-P2)

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

### Sesión 2026-05-29b — [FASE-4.G-P2] Fix bugs dashboard /admin/leads

**Contexto:** Dos bugs detectados en producción tras deploy P1.

**Root causes encontrados:**

1. **BUG 1 (PATCH 500):** Tabla `leads` tenía CHECK constraint legacy con valores `['new','contacted','qualified','lost','converted']`. Los nuevos valores `in_progress`, `closed`, `discarded` eran rechazados por Postgres. Solo `new` y `contacted` pasaban → explica "primer PATCH 200, resto 500".
   - Fix: migración DB `update_leads_status_check_constraint` — reemplaza constraint por `['new','contacted','in_progress','closed','discarded']`.
   - Fix código: `console.error` en el handler antes del 500 para futuros debugs.

2. **BUG 2 (filtros no aplican):** `page.tsx` sí consume `searchParams` y pasa a `fetchLeads`. El problema real: `LeadsClientWrapper` usa `useState(initial)` — React no reinicializa state cuando el server component re-renderiza con nuevas props (comportamiento estándar de React).
   - Fix: `key` prop en `<LeadsClientWrapper>` basada en `status-source-search-urgent_only`. Cuando cambia cualquier filtro, React fuerza remount y reinicializa con los nuevos leads.
   - Fix adicional: `router.replace()` en `LeadFilters` en lugar de `router.push()` (no acumula history).

**T4:** 3 leads reseteados a `status='new'` via SQL directo. Confirmado: Ivan Alberini, Raja Melano, Rosa Melano → all `new`.

**Archivos tocados:**
- MODIFIED: `src/app/api/admin/leads/[id]/route.ts` (console.error)
- MODIFIED: `src/app/admin/leads/page.tsx` (key prop en LeadsClientWrapper)
- MODIFIED: `src/components/admin/leads/LeadFilters.tsx` (router.replace)
- DB MIGRATION: `update_leads_status_check_constraint`

**Commits:** `3e8b648` — fix(api): validator PATCH leads acepta todos los status correctos
             `ca20a83` — fix(admin): /admin/leads consume searchParams — filtros chips aplicados

**Próximo paso sugerido:** Smoke test completo: ciclo new→contacted→in_progress→closed→discarded→new + filtros por status/source/search/urgent_only.

---

### Sesión 2026-05-29 — [FASE-4.G-P1] Dashboard /admin/leads

**Contexto:** Implementar UI completa de gestión de leads dentro del admin para que Atilio gestione contactos sin acceder a Supabase o Google Sheets.

**Trabajo hecho:**

- **APIs creadas:**
  - `GET /api/admin/leads` — lista con filtros (status, source, search, urgent_only, exclude_test). `migration_test` excluido por defecto. `is_urgent` computado (status='new' AND >24h).
  - `PATCH /api/admin/leads/[id]` — actualiza status, notes, score. Valida status en lista permitida. Log audit.
  - `GET /api/admin/leads/stats` — totales, nuevos, urgentes, contactados_hoy, by_source.

- **Componentes creados** en `src/components/admin/leads/`:
  - `LeadStatusBadge.tsx` — colores: azul/amarillo/naranja/verde/gris
  - `UrgencyBadge.tsx` — rojo pulsante >24h, amarillo >6h
  - `SourceBadge.tsx` — property_contact/demand_form/contacto/otros
  - `LeadFilters.tsx` — chips de status + origen + toggle urgentes + búsqueda libre (URL params)
  - `LeadsTable.tsx` — tabla con columnas clave, click en fila abre modal, botón WhatsApp inline
  - `LeadDetailModal.tsx` — modal completo: contacto (email+WhatsApp), interés, mensaje, propiedad, score, notas editables, gestión status, acciones rápidas. Cierra con Esc o click afuera.

- **Página /admin/leads** reescrita: 4 stat cards (total, nuevos, urgentes, contactados hoy) + LeadFilters + LeadsClientWrapper.

- **Sidebar badge:** `AdminSidebar.tsx` acepta `urgentLeadsCount` prop. Badge rojo pulsante junto a "Leads" cuando hay leads urgentes. `layout.tsx` hace server fetch del count (Supabase directo).

- **audit.ts:** agregado `'update_lead'` a `AuditAction`.

**Archivos tocados:**
- CREATED: `src/app/api/admin/leads/route.ts`
- CREATED: `src/app/api/admin/leads/[id]/route.ts`
- CREATED: `src/app/api/admin/leads/stats/route.ts`
- CREATED: `src/components/admin/leads/LeadStatusBadge.tsx`
- CREATED: `src/components/admin/leads/UrgencyBadge.tsx`
- CREATED: `src/components/admin/leads/SourceBadge.tsx`
- CREATED: `src/components/admin/leads/LeadFilters.tsx`
- CREATED: `src/components/admin/leads/LeadsTable.tsx`
- CREATED: `src/components/admin/leads/LeadDetailModal.tsx`
- MODIFIED: `src/app/admin/leads/page.tsx`
- MODIFIED: `src/app/admin/leads/LeadsClientWrapper.tsx`
- MODIFIED: `src/components/admin/AdminSidebar.tsx`
- MODIFIED: `src/app/admin/layout.tsx`
- MODIFIED: `src/lib/audit.ts`

**Commits:** `57a261c` — feat(admin): dashboard /admin/leads con modal, filtros y badge urgente

**Nota assigned_to:** Columna `assigned_to` es UUID en DB. Dropdown de asignación en modal es UI cosmética (no persiste a DB en esta fase). Requiere UUIDs reales de usuarios admin para implementación completa.

**Próximo paso sugerido:** Smoke test en producción tras push/deploy — verificar los 3 leads (Ivan, Rosa, Raja), filtros, modal, botón WhatsApp, y badge en sidebar.

---

### Sesión 2026-05-28c — [FASE-4.F-P1] Migración Google Sheet de leads al Sheet nuevo de Ivan

**Contexto:** Ivan creó un Sheet nuevo en su Drive personal con los 12 headers correctos y compartió como Editor con la Service Account. Se debía migrar `GOOGLE_SHEETS_LEADS_ID` del sheet huérfano al nuevo.

**Trabajo hecho:**

- **PRE-FLIGHT** — Script `scripts/testSheetWrite.ts` verifica vía API el nombre real de la pestaña en el sheet nuevo:
  - Resultado: pestaña `"Hoja 1"` ✅ confirmada — matchea el range `'Hoja 1'!A:L` del código.

- **Tarea 1 — `.env.local`**:
  - `GOOGLE_SHEETS_LEADS_ID`: `1aAt2bG7Xxx3zv89t5u-FMyOlKbEX05anfQ1eJptc-c8` → `1nkRaLHwnIz3RsLTA0A3zNnxErqVWMa4sm8dlwcSNRjQ`

- **Tarea 2 — Vercel env vars** (3 entornos):
  - Production: eliminada la vieja, añadida la nueva ✅
  - Preview: no existía, añadida la nueva ✅
  - Development: no existía, añadida la nueva ✅

- **Tarea 3 — Redeploy**:
  - Commit `8f4daee` pusheado → Vercel redeploy en curso

- **Tarea 4 — Write test programático** (local con `.env.local` actualizado):
  - Range devuelto: `'Hoja 1'!A2:L2`
  - Fila escrita en email `test-migration@ibott.dev` — VERIFICAR manualmente en Sheet

- **Sheet viejo** (`1aAt2bG7Xxx3zv89t5u-FMyOlKbEX05anfQ1eJptc-c8`): NO borrado — preservado según instrucción.

**Nota operativa:** La variable `GOOGLE_SHEETS_LEADS_ID` solo estaba configurada en Production en Vercel (preview y development no la tenían). Ahora está en los 3 entornos.

**Archivos tocados:**
- MODIFIED `.env.local`
- CREATED `scripts/testSheetWrite.ts`
- MODIFIED `package.json` (añadidos scripts `check-sheet-owner` y `test-sheet-write`)
- MODIFIED `.gitignore` (`.vercel` agregado automáticamente por `vercel link`)

**Commits:** `8f4daee` — chore(env): migrar GOOGLE_SHEETS_LEADS_ID al sheet nuevo de Ivan

**Próximo paso sugerido:** Ivan verifica manualmente que aparece la fila de test (`TEST migración Sheet`, `test-migration@ibott.dev`) en el Sheet nuevo. URL: https://docs.google.com/spreadsheets/d/1nkRaLHwnIz3RsLTA0A3zNnxErqVWMa4sm8dlwcSNRjQ/edit — Después, el próximo lead real de producción debería llegar al Sheet nuevo.

---

### Sesión 2026-05-28b — [FASE-4.B-P2] Claims trayectoria conjunta socios fundadores

**Contexto:** Atilio confirmó que los claims "+40 años" y "+1.500 propiedades" son trayectoria conjunta de los dos socios fundadores, no de la empresa (COVA FUMADA GROUP S.L.). Se reformula para atribuirlos correctamente como plural de socios.

**Trabajo hecho:**

- **`src/app/(public)/sobre-nosotros/page.tsx`** — único archivo con claims numéricos específicos:

  - **Metadata description**: `"Equipo con más de 15 años de experiencia…"` → `"Socios fundadores con más de 40 años de trayectoria conjunta en inmobiliaria de lujo internacional. Más de 1.500 operaciones acompañadas en 11 países."`

  - **STATS (tarjetas de cifras)**:
    - `15+` / `"Años de experiencia"` → `40+` / `"Años de trayectoria conjunta"`
    - `500+` / `"Propiedades gestionadas"` → `1.500+` / `"Operaciones acompañadas"`
    - `9` / `"Países de operación"` → `11` / `"Países de operación"` (corregido al catálogo real)
    - `98%` / `"Clientes satisfechos"` — sin cambio

  - **Sección Misión**: añadido párrafo introductorio:
    > "Detrás de Assets Golden hay un equipo con más de 40 años de trayectoria conjunta en el sector inmobiliario, acumulada por sus socios fundadores entre operaciones en España y mercados internacionales. A lo largo de esa trayectoria hemos acompañado más de 1.500 operaciones inmobiliarias, desde viviendas residenciales hasta activos comerciales y de inversión."

- **Búsqueda global en repo**: ningún otro archivo contiene claims con año/propiedades específicos que requieran cambio. `/servicios` dice "amplia experiencia" (genérico, OK). `/equipo` dice "trayectoria internacional" (genérico, OK).

**Archivos tocados:** MODIFIED `src/app/(public)/sobre-nosotros/page.tsx`

**Commits:** `ab7ac6c` — fix(sobre-nosotros): reformular claims trayectoria conjunta socios fundadores

**Próximo paso sugerido:** Smoke test en /sobre-nosotros: (1) tarjetas de cifras muestran 40+ / 1.500+ / 11; (2) sección Misión muestra el párrafo de trayectoria como primer párrafo; (3) sin mención de años atribuidos a persona individual o empresa.

---

### Sesión 2026-05-28 — [FASE-4.B-P1] Contenido editorial — servicios, países, sobre-nosotros, contacto

**Contexto:** Feedback de Atilio (Word "NUEBA_WEB_AJUSTES_1") — ajustes de contenido editorial. Cambios seguros (sin validación previa requerida).

**Trabajo hecho:**

- **B1 — Contraste WCAG AA en /servicios** (`servicios/page.tsx`):
  - Bullets de servicios: `text-white/40` → `text-white/70`
  - Descripciones de tarjetas: `text-white/50` → `text-white/70`
  - Hero description `text-white/60` — mantenida (nivel aceptable)

- **B2 — Presencia Internacional /servicios** (`servicios/page.tsx`):
  - Eliminados países inexistentes: Italia, Brasil, Colombia, Venezuela, Puerto Rico, Canadá, Francia
  - Lista actualizada a los 11 países reales: España, México, Indonesia (Bali), Emiratos Árabes Unidos (Dubái), Argentina, Estados Unidos, Costa Rica, Reino Unido, Ecuador, Grecia y Paraguay
  - Añadida frase: "Permanentemente abrimos nuevos mercados en busca de mejores oportunidades para nuestros clientes."

- **B3 — Home países (verificado, sin cambio)**: Sección destinos ya es dinámica — lee de `getDestinations()` + filtra con `isValidCountry()`. `VALID_COUNTRIES` ya incluye los 11. No requería cambio de código.

- **B4a — Misión /sobre-nosotros** (`sobre-nosotros/page.tsx`):
  - Reemplazado "Portugal, Italia, Francia, Montenegro, Turquía…" por: "España, México, Indonesia, Emiratos Árabes Unidos, Argentina, Estados Unidos, Costa Rica, Reino Unido, Ecuador, Grecia y Paraguay."
  - Añadida frase de apertura de mercados.

- **B4b — Red Internacional /sobre-nosotros** (`sobre-nosotros/page.tsx`):
  - Lista de ciudades corregida. Eliminados: Portugal, Italia, Francia.
  - Añadidos: Indonesia (Bali: Uluwatu, Canggu, Ubud), Emiratos Árabes Unidos (Dubái), Costa Rica, Reino Unido, Ecuador, Grecia
  - Argentina: añadida Córdoba
  - México: actualizado a Tulum, Riviera Maya
  - Paraguay: añadidas Asunción, Luque, Ciudad del Este

- **B5a — Dirección /contacto** (`contacto/page.tsx`):
  - Añadido ítem MapPin "Sant Joan Despí, Barcelona, España" al inicio de contactItems
  - Render condicional para `href=null` (no genera `<a>` vacío)

- **B5b — Logo /contacto**: No existe ningún logo en la página de contacto actual. No hay imagen/logo para corregir. Pendiente clarificación de Atilio sobre qué exactamente quería cambiar.

- **B4c — Claims "+40 años" y "+1500 propiedades"**: NO tocados. Pendiente validación de Atilio.

**Decisiones tomadas:**
- Home país-section: ya dinámica, sin cambio de código
- B5b logo: no se encontró problema concreto — pendiente Atilio

**Archivos tocados:**
- MODIFIED `src/app/(public)/servicios/page.tsx`
- MODIFIED `src/app/(public)/sobre-nosotros/page.tsx`
- MODIFIED `src/app/(public)/contacto/page.tsx`

**Commits:**
- `a051577` — fix(servicios): contraste WCAG AA en bullets y descripciones
- `fc570e2` — fix(sobre-nosotros): misión y Red Internacional con los 11 países reales
- `0ed0d00` — fix(contacto): añadir dirección Sant Joan Despí, Barcelona

**Próximo paso sugerido:**
- Smoke test: /servicios (bullets visibles, Presencia Internacional correcta), /sobre-nosotros (misión + Red Internacional), /contacto (dirección nueva visible)
- Pendiente de Atilio: (1) confirmar claims "+40 años" y "+1500 propiedades" para implementar B4c; (2) aclarar qué quería cambiar del logo en /contacto (B5b — no hay logo en esa página)

---

### Sesión 2026-05-27 — [FASE-4.A-P2] Consolidación estados + clasificación + drag gallery + fixes

**Contexto:** Continuación de FASE-4.A con 6 tareas nuevas de mejora admin y correcciones.

**Trabajo hecho:**

- **A5 — Consolidar estados:**
  - DB: `UPDATE properties SET status='active' WHERE status='available'` (migración aplicada)
  - `PropiedadesTable.tsx`: badge de `status` reemplazado por badges combinados VISIBLE/OCULTA/VENDIDA/★DEST.
  - Edit page: eliminado dropdown `status`, añadido checkbox "Marcar como vendida" en sección Opciones
  - Nueva propiedad: eliminado dropdown `status` (siempre crea con `status='active'`)
  - API routes `update-property` y `create-property`: actualizados para guardar `sold` y `classification`

- **A6 — Flag Inversión:**
  - `queries.ts`: añadido `classification?: string` a `GetPropertiesFilters`, filtro `eq('classification', ...)`
  - Edit + nueva-propiedad: radio group Normal/Promoción/Inversión reemplaza el dropdown Estado
  - `/inversiones/page.tsx`: cambia de `excludeTypes: EXCLUDED_FROM_INVESTMENT` a `classification: 'investment'`
  - DB: índice `idx_properties_classification` aplicado

- **A7 — Drag-to-reorder fotos:**
  - Instalado `@dnd-kit/core` + `@dnd-kit/sortable`
  - Edit page: sección de imágenes usa `DndContext` + `SortableContext` + `SortableImage` (arrastrando reordena; primera posición = principal)
  - Indicador "arrastrá para reordenar" + contador "X / 30"

- **A8 — Límite 30 fotos:**
  - `MAX_PHOTOS 12 → 30` en nueva-propiedad
  - Edit page: cap de 30 con mensaje de límite y contador de seleccionadas

- **A9 — Fix upload foto de partner:**
  - DB: policy `"Authenticated upload team-photos"` en `storage.objects` aplicada
  - `TeamPhotoUploader`: ruta a través de `/api/admin/upload-image?bucket=team-photos` (servicio admin con service key)
  - `upload-image/route.ts`: añadido caso `team-photos` (sin subfolder)
  - Eliminada dependencia del anon client para storage

- **A10 — Onboarding agente:**
  - `NewAgentForm.tsx`: `copyCredentials` produce mensaje WhatsApp completo (URL portal, nombre, email, contraseña temporal); botón renombrado "Copiar mensaje WhatsApp"
  - `Footer.tsx`: añadido "Acceso agentes" → `/portal/login` en sección Empresa

**Archivos tocados:**
- MODIFIED `src/lib/supabase/queries.ts`
- MODIFIED `src/app/api/admin/update-property/route.ts`
- MODIFIED `src/app/api/admin/create-property/route.ts`
- MODIFIED `src/app/api/admin/upload-image/route.ts`
- MODIFIED `src/app/(public)/inversiones/page.tsx`
- MODIFIED `src/app/admin/propiedades/[id]/edit/page.tsx`
- MODIFIED `src/app/admin/nueva-propiedad/page.tsx`
- MODIFIED `src/components/admin/PropiedadesTable.tsx`
- MODIFIED `src/components/admin/TeamManager.tsx`
- MODIFIED `src/components/admin/NewAgentForm.tsx`
- MODIFIED `src/components/Footer.tsx`

**Commits:** `c099bb8` — feat(admin): FASE-4.A-P2 — A5-A10 admin improvements

**Próximo paso sugerido:** Smoke test en producción (Vercel deploy). Atilio debe: (1) probar clasificar propiedades como "Inversión" desde edit para poblar `/inversiones`; (2) verificar drag-to-reorder en edit de una propiedad con fotos; (3) testar upload foto de partner en TeamManager; (4) agregar agente de prueba y copiar mensaje WhatsApp.

---

### Sesión 2026-05-28 — [FASE-4.A-P1] Operatividad admin + buscadores + banda VENDIDA

**Contexto:** Feedback de Atilio (WhatsApp + Word): (1) buscador admin no encuentra por AG-XXXXX/numérico; (2) falta código HabiHub (external_id) en tabla admin; (3) catálogo público sin buscador de texto; (4) marcar vendida oculta la propiedad — debería mostrar con banda.

**Trabajo hecho:**

- **DB**: Migración `fase4_a_p1_search_indexes` aplicada en Supabase — `pg_trgm` habilitada, índices GIN trigram en `title/location/province`, índices B-tree en `ref_code/external_id`, índice parcial de catálogo público.

- **A1 — Buscador admin flexible** (`admin/propiedades/page.tsx`, `PropiedadesTable.tsx`):
  - Label cambiado a "Búsqueda libre", placeholder actualizado
  - Numérico → pad 5 dígitos → `ref_code ILIKE AG-XXXXX` **Y** `external_id = valor`
  - Formato AG- → normaliza y busca en `ref_code`
  - Texto libre → `title / location / province ILIKE`

- **A2 — external_id en admin** (`PropiedadesTable.tsx`, `edit/page.tsx`):
  - Columna "Cód. HabiHub" visible en tabla (badge azul o `—`)
  - Bloque de solo-lectura en ficha edit: Ref. interna, Cód. HabiHub, Fuente, Última sync

- **A3 — Buscador público** (`PropiedadesFilters.tsx`, `queries.ts`, `(public)/propiedades/page.tsx`):
  - Input "Buscar" al inicio del panel de filtros (mobile + desktop)
  - URL shareable: `/propiedades?q=malaga` preserva query string
  - Contador: "X propiedades coinciden con 'malaga'" / mensaje no-resultados específico
  - `getProperties` acepta `q` con misma lógica AG-/numérico/texto libre

- **A4 — Banda VENDIDA** (`actions.ts`, `SoldToggleButton.tsx`, `PropertyCard.tsx`, `[slug]/page.tsx`, `queries.ts`):
  - `togglePropertySold` y `bulkMarkAsSold` ya NO fuerzan `hidden=true`
  - `PropertyCard`: banda diagonal roja "VENDIDA" + imagen al 60% de opacidad cuando sold=true
  - Ficha de detalle: badge "PROPIEDAD VENDIDA" rojo, banda sobre el hero, CTA cambia a "Ver propiedades similares" (→ `/propiedades?ciudad=X`)
  - Todas las queries públicas: eliminado `.not('sold','eq',true)`, añadido `ORDER BY sold ASC` (vendidas al final); excepción: `getFeaturedProperties` mantiene el filtro
  - `getAllPropertySlugs` incluye vendidas → sus páginas se generan estáticamente

**Decisiones tomadas:**
- `getFeaturedProperties` (sección Destacadas del home) mantiene `sold=false` para no mostrar vendidas en la portada
- Propiedades ya vendidas con `hidden=true` por el comportamiento anterior seguirán ocultas hasta que Atilio las visibilice manualmente desde admin

**Archivos tocados:**
- MODIFIED `src/types/index.ts`
- MODIFIED `src/app/admin/actions.ts`
- MODIFIED `src/app/admin/propiedades/page.tsx`
- MODIFIED `src/components/admin/PropiedadesTable.tsx`
- MODIFIED `src/app/admin/propiedades/[id]/edit/page.tsx`
- MODIFIED `src/components/admin/SoldToggleButton.tsx`
- MODIFIED `src/lib/supabase/queries.ts`
- MODIFIED `src/components/properties/PropertyCard.tsx`
- MODIFIED `src/app/(public)/propiedades/page.tsx`
- MODIFIED `src/components/PropiedadesFilters.tsx`
- MODIFIED `src/app/(public)/propiedades/[slug]/page.tsx`

**Commits:**
- `be19fc8` — feat(db): pg_trgm + índices búsqueda flexible
- `e149357` — feat(admin): buscador propiedades acepta AG-, numérico, texto + columna HabiHub external_id
- `422a4eb` — feat(public): buscador de texto en /propiedades
- `454d4d4` — feat(public): propiedades vendidas visibles con banda VENDIDA en lugar de ocultarse

**Próximo paso sugerido:** Smoke test en producción (Vercel deploy ~3 min). Atilio debe: (1) visibilizar manualmente propiedades vendidas antiguas con `hidden=true` desde admin → quitar hidden para que aparezcan con banda VENDIDA. (2) Fase 4.B-P2: limpiar campo `status` (duplicado con `sold`/`hidden`), activar lógica `/inversiones` con `classification`.

---

### Sesión 2026-05-27c — [FASE-3.C-POLISH-CSP] Hotfix CSP Meta Pixel + GA4

**Contexto:** Smoke test post-deploy detectó que el CSP bloqueaba connect.facebook.net incluso después de aceptar cookies de marketing. El banner de consent estaba correcto pero el Pixel era bloqueado por header CSP.

**Trabajo hecho:** Único archivo: `next.config.ts` — añadidos dominios Meta Pixel y GA4 a las directivas `script-src`, `img-src` y `connect-src`.

**CSP antes → después (diferencias):**
- `script-src`: + `connect.facebook.net` + `googletagmanager.com`
- `img-src`: + `www.facebook.com` + `google-analytics.com` + `*.google-analytics.com`
- `connect-src`: + `www.facebook.com` + `connect.facebook.net` + `google-analytics.com` + `*.google-analytics.com` + `*.analytics.google.com` + `googletagmanager.com`

**Sin cambios:** `unsafe-eval`, `unsafe-inline`, `default-src`, `frame-src 'none'` — sin relajar.

**Archivos tocados:** MODIFIED `next.config.ts` | MODIFIED `DAILY_LOG.md`

**Commit:** `d922b8f` fix(security): CSP permite Meta Pixel y GA4 con consentimiento

**Smoke test definitivo:** Aceptar cookies en producción → DevTools Network → `connect.facebook.net` debe responder **200 OK** (ya no bloqueado).

---

### Sesión 2026-05-27b — [FASE-3.C-POLISH] Fix og:image global + GDPR cookie consent

**Contexto:** Dos issues técnicos pre-campaña Meta Ads:
A) og:image/twitter:image mostraban logo en lugar del banner del post
B) Meta Pixel cargaba sin consentimiento (violación RGPD)

---

**FIX A — og:image (commit `67807b0`)**

Root cause: `generateMetadata` en `blog/[slug]/page.tsx` usaba `post.cover_image` en lugar de `post.banner_image_url`. Para P5, `cover_image` era el antiguo logo URL porque no fue actualizado en la sesión anterior de reescritura.

Solución:
- `isLogoPlaceholder(url)`: filtra URLs que terminan en `logo.{ext}`
- `resolveOgImage(post)`: prioridad `banner_image_url` → `cover_image` → omite (cascada del layout)
- Omitir la clave `images` (no `[]`) cuando no hay imagen válida, para que el og fallback del layout sea visible
- DB: sincronizado `cover_image` de P5 con `banner_image_url` (eran divergentes)
- Layout og-default mejorado: usa España hero de Supabase storage (reemplaza `/opengraph-image.png` que no existía en `/public`)

**FIX B — Cookie consent GDPR (commit `4e3e158`)**

Instala `vanilla-cookieconsent v3.1.0`. Arquitectura:
- `CookieConsentInit.tsx` (`'use client'`): inicializa el banner, define 3 categorías (necessary/analytics/marketing), carga Meta Pixel dinámicamente en `onConsent`/`onChange` solo cuando marketing es aceptado
- `OpenPreferencesButton.tsx` (`'use client'`): botón footer → `CookieConsent.showPreferences()`
- `src/lib/cookies/consent.ts`: helper `hasConsent()` (lee `cc_cookie`)
- `layout.tsx`: ELIMINADO `<Script id="meta-pixel">` always-on + `<noscript>` pixel img. AÑADIDO `<CookieConsentInit />`
- `Footer.tsx`: añadido "Configurar cookies" en bottom bar
- `globals.css`: theming vanilla-cookieconsent con paleta navy/gold

Bug extra resuelto: `fbq.d.ts` eliminado (conflicto con declaración existente en `src/lib/meta/track.ts`).

**Checklist RGPD:**
- [x] Banner en primera visita
- [x] Botón Rechazar igual de visible que Aceptar (`equalWeightButtons: true`)
- [x] Consentimiento granular por categoría
- [x] Meta Pixel NO carga sin consentimiento marketing
- [x] `<noscript>` pixel img ELIMINADO
- [x] Persistencia en `cc_cookie`
- [x] Revocación desde footer ("Configurar cookies")
- [x] Link a `/politica-de-cookies` en banner
- [x] TypeScript: 0 errores | Build: ✓ 16.3s, 1112/1112 páginas

**Archivos tocados:**
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx` (FIX A)
- MODIFIED: `src/app/layout.tsx` (remove Pixel always-on, add CookieConsentInit, fix og-default)
- MODIFIED: `src/components/Footer.tsx` (OpenPreferencesButton)
- MODIFIED: `src/app/globals.css` (CC theme overrides)
- CREATED: `src/components/cookies/CookieConsentInit.tsx`
- CREATED: `src/components/cookies/OpenPreferencesButton.tsx`
- CREATED: `src/lib/cookies/consent.ts`
- DELETED: `src/types/fbq.d.ts` (conflicto con track.ts)
- MODIFIED: `DAILY_LOG.md`
- DB: `cover_image` P5 sincronizado con `banner_image_url`

**Commits:**
- `67807b0` fix(seo): og:image y twitter:image apuntan al banner del post
- `4e3e158` feat(legal): banner cookies GDPR + consentimiento granular Meta Pixel

**Smoke test pendiente (post-deploy Vercel):**

FIX A — og:image:
- `opengraph.xyz` con URL del Post 5 → debe mostrar banner Costa Blanca (no logo)
- Repetir Posts 1–4 (ya tenían cover_image = banner_image_url, deberían estar OK)
- WhatsApp Web: pegar link del Post 5 y verificar preview visual
- Posts con `cover_image = logo.jpg` y `banner_image_url = logo.jpg` → deben usar fallback del layout (España hero Supabase)

FIX B — Cookie consent:
- Modo incógnito → banner debe aparecer en primera visita
- Click "Rechazar" → DevTools Network: NO debe aparecer `connect.facebook.net`
- Refrescar → banner NO debe volver a aparecer
- Limpiar cookies + "Aceptar todas" → Network: SÍ debe aparecer Meta Pixel request
- Footer → "Configurar cookies" → debe abrir modal de preferencias
- Categorías necesarias: siempre ON, no toggleable

**Próximo paso sugerido:** Smoke test producción una vez Vercel despliega (≈2-3 min). Retomar pendientes bloqueantes go-live: Resend + DNS Atilio.

---

### Sesión 2026-05-27 — [FASE-3.C-P5] Reescritura Post 5 — Guía extranjero con foco Brexit UK 2026 ✅ SERIE 3.C COMPLETA

**Contexto:** Post 5 (último) de la serie de 5 reescrituras editoriales Fase 3.C. Slug `comprar-piso-espana-siendo-extranjero-2026` — reposicionamiento de guía genérica a "guía estructural del comprador extranjero en España 2026 con foco específico Brexit UK + alemán + francés + latinoamericano + estadounidense". Slug preservado para SEO.

**Trabajo hecho:**

**Paso 1 — PROTECTED_PHRASES + LINK_MAP (commit aparte `bfd8cca`):**
- Añadido `'Reino Unido': '/destinos/reino-unido'` a LINK_MAP_ES
  - Slug verificado en `country_destinations` (active: true)
- Sin nuevas PROTECTED_PHRASES necesarias para este post:
  - `Agencia Tributaria`, `CaixaBank Research`, `Modelo 720`, `Modelo 721` → no están en LINK_MAP → no requieren protección
  - `Costa del Sol`, `Costa Blanca`, `Marbella` → ya en LINK_MAP, deben linkearse (correcto)
- TypeScript: 0 errores

**Paso 2 — Backup + UPDATE:**
- Backup id=4 en `blog_posts_backup` (2026-05-26 22:27:12 UTC)
  - `backup_reason`: 'Fase 3.C-P5 pre-rewrite backup'
- UPDATE `blog_posts` con nuevo title, content (19.681 chars), excerpt, meta_description, citations JSONB (5 items), updated_at
- Banner: reemplazado `logo.jpg` (medianewbuild) por foto Torrevieja Costa Blanca `developments_v2/65152743/media/images/commonareas/1.jpg` — temáticamente apropiado (Costa Blanca es zona #1 de compradores británicos)

**Métricas:**

| Campo | Antes | Después |
|---|---|---|
| content_length | 6.267 | **19.681** |
| meta_len | — | 262 |
| excerpt_len | — | 259 |
| num_citations | — | **5** |
| h3_count | — | **12** (7 secciones + 5 FAQs) |
| table_count | — | **1** (mapa comprador) |
| internal_links | — | **1** (`/destinos/espana`) |
| external_links | — | **5** |
| em-dashes en prosa | — | **0** |
| autolinker_anchors_in_db | 0 | 0 |

**⚠️ Discrepancia smoke test:** El brief listaba "2 tablas HTML (mapa comprador + algún otro)" pero el HTML especificado solo contiene 1 tabla (mapa de nacionalidades). Contenido insertado tal como fue redactado. Sin acción correctiva necesaria — es consistencia interna del brief.

**Secciones del nuevo contenido:**
1. Apertura: transformación estructural 2008-2024 (92.958 compras, caída UK 38%→14%)
2. El nuevo mapa del comprador extranjero (tabla 7 nacionalidades)
3. El comprador británico: lo que cambia / no cambia con Brexit
4. El comprador alemán: el grupo que más crece (Baleares, Canarias, Costa del Sol)
5. El comprador francés y belga
6. El comprador estadounidense: crecimiento explosivo (×16 en Málaga)
7. El comprador latinoamericano (argentino, mexicano, venezolano)
8. Trámites operativos comunes (NIE, cuenta bancaria, ITP/IVA)
9. Modelo 720 + Modelo 721 (criptomonedas en el extranjero)
10. Financiación hipotecaria para no residente (LTV diferenciado UE vs no-UE)
11. 5 FAQs + footer fuentes + disclaimer + timestamp

**Links internos hardcodeados:** 1 × `/destinos/espana` (latinoamericanos — ruta confirmada existente).
**Auto-linker en render:** `Reino Unido` → `/destinos/reino-unido` (primera ocurrencia en tabla), `Costa del Sol` → `/destinos/espana?zona=costa-del-sol`, `Costa Blanca` → `/destinos/espana?zona=costa-blanca` (primera ocurrencia c/u).

**Archivos tocados:**
- MODIFIED: `src/lib/utils/blogInternalLinks.ts` (+1 línea — Reino Unido en LINK_MAP_ES)
- MODIFIED: `DAILY_LOG.md`
- Solo DB para el contenido (backup id=4 + UPDATE)

**Commits:**
- `bfd8cca` fix(blog): add Reino Unido to LINK_MAP_ES
- `(este commit)` chore(content): Fase 3.C-P5 — reescritura Post 5 guía extranjero con foco Brexit UK 2026

**🏁 CIERRE SERIE FASE 3.C — 5/5 posts completados:**
- P1: `golden-visa-espana-2026-residencia-comprando-propiedad` (sesión 2026-05-25c)
- P2: `dubai-2026-mercado-inmobiliario-inversores-internacionales` (sesión 2026-05-25e)
- P3: `costa-del-sol-vs-costa-blanca-invertir-2026` (sesión 2026-05-25f)
- P4: `comprar-villa-marbella-zonas-exclusivas-precios` (sesión 2026-05-25g)
- P5: `comprar-piso-espana-siendo-extranjero-2026` (sesión 2026-05-27) ✅

**Próximo paso sugerido:** Smoke test producción `?nocache=1` en los 5 slugs reescritos. Retomar pendientes bloqueantes: pipeline leads (Resend), páginas legales GDPR, DNS.

---

### Sesión 2026-05-25g — [FASE-3.C-P4] Reescritura Post 4 — Marbella 2026

**Contexto:** Post 4 de la serie de 5 reescrituras editoriales. Slug `comprar-villa-marbella-zonas-exclusivas-precios` — reposicionamiento a "análisis prime micro-zona con datos E&V Q1 2026". Slug preservado para SEO.

**Trabajo hecho:**

**Paso 1 — PROTECTED_PHRASES (commit aparte `59c803d`):**
- Añadido `Las Lomas Marbella Club` (único que contiene término linkeable "Marbella")
- Añadidos defensivos: Sierra Blanca, Altos Reales, Puerto Banús, Golden Mile, Nueva Andalucía, Valle del Golf
- TypeScript: 0 errores

**Paso 2 — Backup + UPDATE:**
- Backup id=3 en `blog_posts_backup` (2026-05-25 21:38:56 UTC)
- UPDATE `blog_posts` con nuevo title, content (typo `</tl>` corregido a `</tr>`), excerpt, meta_description, citations JSONB
- Banner: reemplazado `logo.jpg` (medianewbuild) por foto "Lujo Mediterráneo frente al mar" (Sitges, Supabase storage) — temporal por ausencia de propiedades Marbella con imagen en DB

**Métricas:**

| Campo | Antes | Después |
|---|---|---|
| content_length | 5.694 | **15.591** |
| meta_desc_len | — | 227 |
| excerpt_len | — | 225 |
| num_citations | — | **5** |
| faq_h3_count | — | **5** |
| table_count | — | **2** (micro-zonas + Marbella vs Ibiza vs Mallorca) |
| external_links | — | **5** |
| em-dashes en prosa | — | **0** (5 solo en anchor text bibliográfico) |
| tl_typo_count | — | **0** (corregido) |
| autolinker_anchors_in_db | 0 | 0 |

**Secciones del nuevo contenido:**
1. Apertura: anomalía estructural (apartamento > casa en €/m²) con datos E&V abril 2026
2. El dato que define el mercado (tabla 6 micro-zonas con precios casa + apartamento)
3. Las seis micro-zonas con encaje de perfil (H3 por cada zona: Golden Mile, Sierra Blanca, Las Lomas Marbella Club, Altos Reales, Puerto Banús, Nueva Andalucía)
4. Alquiler prime: yields reales + cálculo ejemplo sobre 250 m² Sierra Blanca
5. Costes operativos reales (IBI, comunidad, mantenimiento — 25k-45k €/año)
6. Marbella vs Ibiza vs Mallorca SW (tabla 7 variables)
7. Cuándo Marbella no es la respuesta correcta
8. 5 FAQs + footer fuentes + disclaimer + timestamp

**Links internos hardcodeados:** solo 2 × `/destinos/espana` (ruta confirmada existente). Sin links a rutas no verificadas.

**⚠️ Banner temporal:** no hay propiedades Marbella activas con imagen en DB. Banner asignado es "Lujo Mediterráneo Frente al Mar Sitges" (temáticamente próximo pero no Marbella). Reemplazar cuando haya propiedad Marbella con imagen en DB.

**Archivos tocados:**
- MODIFIED: `src/lib/utils/blogInternalLinks.ts` (+9 líneas — PROTECTED_PHRASES Marbella)
- MODIFIED: `DAILY_LOG.md`
- Solo DB para el contenido (UPDATE + banner)

**Commits:**
- `59c803d` fix(blog): PROTECTED_PHRASES para micro-zonas Marbella
- `(ver abajo)` chore(content): Fase 3.C-P4 — reescritura Post 4 Marbella 2026

**Próximo paso sugerido:** FASE-3.C-P5 — Post 5 de la serie de 5 reescrituras. Confirmar slug target.

---

### Sesión 2026-05-25f — [FASE-3.C-P3] Reescritura Post 3 — Costa del Sol 2026

**Contexto:** Post 3 de la serie de 5 reescrituras editoriales. Slug `costa-del-sol-vs-costa-blanca-invertir-2026` — reposicionamiento de "comparativa vs Costa Blanca" a "post estructural Costa del Sol" (slug preservado para SEO).

**Diagnóstico previo:**
- [FASE-3.C-P2-REPROCESS] descartada: el auto-linker corre en render time, no en save time. DB siempre almacena HTML crudo (0 autolinker anchors confirmado por SQL). Fix commit a1c610b ya aplicó en Vercel al invalidar ISR caches.
- Smoke test de producción confirmó "Dubai Land Department" sin `<a>` y hero con subtítulo ✅

**Trabajo hecho:**
- Backup id=2 insertado en `blog_posts_backup` (backup_date: 2026-05-25 21:13:02 UTC)
- UPDATE `blog_posts` con: nuevo title, content HTML completo, excerpt, meta_description, citations JSONB (5 items), updated_at
- Banner corregido: de `medianewbuild.com/logo.jpg` (logo incorrecto) a `medianewbuild.com/.../commonareas/1.jpg` (foto de áreas comunes — Fuengirola, Costa del Sol)
- TypeScript: 0 errores

**Métricas:**

| Campo | Antes | Después |
|---|---|---|
| content_length | 5.853 | **19.637** |
| meta_desc_len | 160 | 216 |
| excerpt_len | 153 | 226 |
| num_citations | — | **5** |
| faq_h3_count | — | **5** |
| table_count | — | **2** |
| external_links | — | **5** |
| em-dashes en prosa | — | **0** (5 solo en anchor text bibliográfico) |
| autolinker_anchors_in_db | 0 | 0 |

**Secciones del nuevo contenido:**
1. Apertura con cifras clave 2024 (11.404 compras extranjeras, 32,4% provincial)
2. El mercado en cifras 2024-2025 (lista detallada)
3. Las cinco micro-zonas (tabla: Marbella, Benahavís, Estepona, Mijas Costa, Málaga capital)
4. Quién compra en Costa del Sol en 2026 (nacionalidades, perfil)
5. Nueva regulación VFT Andalucía 2024-2025 (Decreto 31/2024, Decreto-ley 1/2025)
6. Costa del Sol vs Costa Blanca (tabla comparativa 10 variables)
7. El efecto Cataluña (ITP Decreto Ley 5/2025)
8. Riesgos reales del mercado 2026
9. Cuándo Costa del Sol no es la respuesta correcta
10. 5 FAQs + footer fuentes + disclaimer + timestamp

**Links hardcodeados en HTML:**
- `/destinos/reino-unido` (Reino Unido)
- `/destinos/espana` (Costa Blanca)
- `/destinos/mexico` (Tulum)
- `/destinos/indonesia` (Bali)
- `/destinos/emiratos-arabes-unidos` (Dubái)
- ⚠️ Nota: `/destinos/reino-unido` y `/destinos/indonesia` pueden no existir como rutas — verificar o crear antes del go-live

**Archivos tocados:**
- Solo DB para el contenido (UPDATE + banner)
- MODIFIED: `DAILY_LOG.md`

**Commits:** (ver abajo)

**Próximo paso sugerido:** FASE-3.C-P4 — Post 4 de la serie de 5 reescrituras. Confirmar slug target.

---

### Sesión 2026-05-25e — [FASE-3.C-P2-FIX] Auto-linker nombres propios compuestos + excerpt Post 2 Dubái

**Contexto:** Smoke test del Post 2 (Dubái) detectó: (1) auto-linker envolvía "Dubai" dentro de "Dubai Land Department" generando `<a>Dubai</a> Land Department`; (2) hero del post sin subtítulo porque `excerpt` estaba vacío.

**Trabajo hecho:**

**Issue 1 — Auto-linker compound proper nouns:**
- Añadida constante `PROTECTED_PHRASES` (30 frases): Dubai Land Department, Dubai Marina, Dubai Hills Estate, Dubai Internet City, Marbella Club, Banco de España, Costa del Sol Airport, Tulum National Park, etc.
- Añadida constante `INSTITUTIONAL_SUFFIXES` (34 sufijos): Land, Authority, Department, Marina, Hills, Holdings, Commission, Ministry, etc.
- Nueva función `isPartOfCompoundProper(html, matchIndex, matchLength, term, followChar)`:
  - Check 1: ventana de contexto ±50 chars alrededor del match → busca si alguna PROTECTED_PHRASE que contenga el trigger aparece en esa ventana
  - Check 2: si el char seguidor ($3) es whitespace → obtiene el siguiente token y lo compara contra INSTITUTIONAL_SUFFIXES (sólo capitalizado)
  - Cualquier check positivo → skip link
- TypeScript: 0 errores (`npx tsc --noEmit` limpio)

**Issue 2 — Excerpt Post 2:**
- UPDATE `blog_posts` vía Supabase MCP: `excerpt = 'Análisis del mercado más dinámico del mundo en 2026: cifras, yields por zona, Golden Visa y comparativa con España para el inversor internacional.'`
- Confirmado: `updated_at = 2026-05-25 20:51:06+00`, slug correcto

**Archivos tocados:**
- MODIFIED: `src/lib/utils/blogInternalLinks.ts` (+108 líneas netas — PROTECTED_PHRASES, INSTITUTIONAL_SUFFIXES, isPartOfCompoundProper)
- Solo DB para excerpt (UPDATE directo)

**Commits:** `a1c610b` fix(blog): auto-linker respeta nombres propios compuestos + excerpt Post 2 Dubai

**Smoke test:** ✅ CONFIRMADO en prod (WebFetch). "Dubai Land Department" texto plano sin `<a>`. Hero muestra subtítulo. Sin anchors `text-gold underline` incorrectos.

**Nota FASE-3.C-P2-REPROCESS:** Protocolo de reprocessing descartado. El auto-linker corre en RENDER TIME (page.tsx:118), no en save time. DB content tiene 0 auto-linker anchors (confirmado por SQL). El nuevo deployment de Vercel invalida ISR caches → fix a1c610b aplicó inmediatamente.

**Próximo paso sugerido:** Fase 3.C-P3 — Post 3 de la serie de 5 reescrituras editoriales. Confirmar con el usuario cuál es el slug target.

---

### Sesión 2026-05-25d — [FASE-3.C-P2] Post Dubái: mercado inmobiliario 2026

**Contexto:** Post 2 de la serie de 5 reescrituras editoriales. Slug target `dubai-inversion-inmobiliaria-2026-mercado-lujo` no existía en DB → INSERT nuevo post.

**Posts Dubái ya existentes (preservados sin tocar):**
- `comprar-propiedad-dubai-siendo-latino-guia-2026` (ES, 5717 chars, banner asignado)
- `buying-property-dubai-international-investors` (EN, 5917 chars, banner asignado)

**Trabajo hecho:**
- INSERT en `blog_posts` con todo el contenido vía Supabase MCP
- Link interno `/destinos/emiratos-arabes-unidos` hardcodeado en prosa (el H2 "La Golden Visa de Emiratos..." viene antes → auto-linker skipearía por H2 protegida → solución: hardcode en párrafo + entrada en link map para otros posts)
- `blogInternalLinks.ts`: agrega "Emiratos Árabes Unidos" → `/destinos/emiratos-arabes-unidos` (ES) y "United Arab Emirates" → `/destinos/emiratos-arabes-unidos` (EN)
- `blogPostZones.ts`: agrega nuevo slug al POST_ZONE_MAPPING
- Banner: MERIDEN BEACH RESIDENCES (`1772280847001.png`) — único sin usar entre los posts de Dubái
- Build limpio, TypeScript OK

**Métricas finales:**
- `content_length`: 14.693 chars
- `meta_description` length: 223 chars (sin truncar)
- `num_citations`: 5
- FAQs detectadas: 5
- Em-dash en prosa: 0 (5 solo en anchor text bibliográfico — aceptables)
- Tablas: 2 (precios zona Q1 2026 + comparativa Dubái vs España)

**Smoke test prod:** 8/10 ✅ (los 2 ❌ del tool son falsos positivos — headings limpios confirmados; em-dash en prosa = 0 confirmado por SQL)

**Archivos tocados:**
- MODIFIED: `src/lib/utils/blogInternalLinks.ts`
- MODIFIED: `src/lib/constants/blogPostZones.ts`
- Solo DB para el contenido (INSERT directo)

**Commits:** `e3049e6` chore(content): Fase 3.C-P2 — post Dubái mercado inmobiliario 2026

**Próximo paso sugerido:** Fase 3.C-P3 (siguiente post de la serie de 5). Confirmar cuál es el slug target.

---

### Sesión 2026-05-25c — [FASE-3.C-P1-FIX] Correcciones post-deploy: anchor anidado, H3 links, meta truncation

**Contexto:** Smoke test post-deploy reveló 3 issues en el auto-linker y generateMetadata.

**Issues resueltos:**
1. **Anchor anidado `<a><a>`** (Issue 1): blogInternalLinks.ts usaba un guard "mira 20 chars atrás" que no detectaba términos dentro de `<a>` abierto más arriba. Reemplazado por `isInsideProtectedTag()` que cuenta pares open/close de `<a>` y `<h1-h6>` antes del match.
2. **Links dentro de headings** (Issue 2): misma función `isInsideProtectedTag()` bloquea el auto-link si el match cae dentro de `<h1>–<h6>` abierto. Resuelve "Grecia" en H3.
3. **meta_description truncada mid-word** (Issue 3): `generateMetadata` aplicaba `.slice(0, 160)` también a `meta_description` (no solo a `excerpt`). Fix: si `meta_description` existe → usar tal cual; si solo `excerpt` → truncar en último espacio antes de 160.
4. **Hotfix off-by-one en isInsideProtectedTag**: el slice(0, idx) excluía el `>` del tag de apertura, haciendo que `<h3>` no se detectara. Fix: `idx+1`.

**Commits:**
- `07b9070` — fix(blog): anchor anidado + skip headings + fix meta truncation
- `b74e336` — fix(blog): corregir off-by-one en isInsideProtectedTag

**Archivos tocados:**
- MODIFIED: `src/lib/utils/blogInternalLinks.ts`
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx`

**Nota:** smoke test post-fix muestra ISR cache todavía activo (TTL=3600s). Los fixes son correctos en código; verán efecto tras el próximo ciclo de revalidación o redeploy Vercel.

**Próximo paso sugerido:** Re-verificar en prod pasada 1h o forzar revalidación. Confirmar H3 sin anchor y meta_description completa.

---

### Sesión 2026-05-25b — [FASE-3.C-P1] UPDATE final post Golden Visa España — derogada LO 1/2025

**Contexto:** Continuación de sesión 2026-05-25. Toda la infraestructura ya estaba lista (commit 9f1d77f). En esta sesión se ejecutó el UPDATE directo en Supabase con el contenido completo reescrito.

**Trabajo hecho:**
- UPDATE `blog_posts` vía Supabase MCP: nuevo título, meta_description, content HTML completo (18.946 chars), citations JSONB (7 elementos), published=true, updated_at=2026-05-25T17:32:19Z
- Verificación post-UPDATE: content_length=18.946, meta_len=217, num_citations=7 — todos correctos
- Verificación FAQPage: 5 h3 con `?` extraídas correctamente por regexp — schema FAQPage funcionará en prod
- Contenido incluye: 2 tablas HTML (`<table>`), 5 FAQ, links internos a /destinos/espana y /destinos/grecia, 5 enlaces externos con target=_blank + rel=noopener noreferrer, bloque de fuentes, disclaimer legal en italics
- Em-dash count: 0 en el cuerpo del post

**Datos del UPDATE:**
- slug: `golden-visa-espana-2026-residencia-comprando-propiedad`
- Título: "Golden Visa de España en 2026: derogación, alternativas y vías de residencia para inversores internacionales"
- meta_description: "La Golden Visa española fue derogada en abril de 2025 por la Ley Orgánica 1/2025. Analizamos el estado vigente, los derechos de los titulares actuales y las alternativas reales para inversores internacionales en 2026."
- Backup disponible en `blog_posts_backup` id=1 (pre-update)

**Archivos tocados:** Solo DB (Supabase directo) — sin cambios de código en este commit

**Commits:** `(ver abajo — solo DAILY_LOG)`

**Próximo paso sugerido:** Smoke test en prod una vez Vercel complete el redeploy (ISR TTL=3600s — si no se quiere esperar, forzar revalidación o nuevo commit vacío)

---

### Sesión 2026-05-25 — [FASE-3.C-P1] Infraestructura Golden Visa reescritura (PARCIAL — bloqueado en contenido)

**Contexto:** Reescribir post Golden Visa España con contenido post-derogación LO 1/2025. El archivo `golden-visa-espana-post.md` no fue adjuntado → UPDATE del contenido bloqueado.

**Trabajo hecho:**
- Verificado slug en Supabase: existe, published=true, 6032 chars HTML, banner ya asignado
- Creada tabla `blog_posts_backup` (migration: `create_blog_posts_backup_table`)
- Backup del contenido actual guardado: `blog_posts_backup` id=1, `2026-05-25 16:50:37 UTC`
- Agregada columna `citations jsonb` a `blog_posts` (migration: `add_citations_column_to_blog_posts`)
- `types/index.ts`: campo `citations` añadido a `BlogPost` interface
- `blog/[slug]/page.tsx`: JSON-LD BlogPosting incluye `citation[]` cuando el campo DB está poblado; `generateMetadata` usa `meta_description` con fallback a `excerpt` (fix: antes ignoraba `meta_description`)
- `blogInternalLinks.ts`: Grecia → `/destinos/grecia` (ES) + Greece → `/destinos/grecia` (EN)
- Build limpio, TypeScript sin errores
- Commit: `9f1d77f` — pushed a main

**Hallazgos:**
- `meta_description` existía en DB pero el componente lo ignoraba → corregido en este commit
- `/destinos/grecia` activo en Supabase → agregado al link map
- Marbella sigue linkeando a `/propiedades?pais=España&ciudad=Marbella` globalmente; el link a `/destinos/espana` para el Golden Visa post deberá ir hardcodeado en el HTML del contenido

**Archivos tocados:**
- MODIFIED: `src/types/index.ts`
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx`
- MODIFIED: `src/lib/utils/blogInternalLinks.ts`

**Commits:** `9f1d77f` feat(blog): infraestructura para reescritura Golden Visa — citations schema + meta_description fix

**Próximo paso sugerido:** Proporcionar `golden-visa-espana-post.md` (o confirmar que lo escriba Claude basándose en LO 1/2025) → ejecutar UPDATE en Supabase con nuevo title, content HTML, excerpt, meta_description y citations JSONB → smoke test en prod

---

### Sesión 2026-05-23b — chore(content): eliminar em-dash de prosa editorial (11 países + España + sobre-nosotros)

**Contexto:** [FIX-prosa] Auditoría y reemplazo de em-dashes (—) en textos editoriales. Regla aprobada: aposiciones cortas → paréntesis; "con X como referente" → comas; incisos restrictivos → comas; 5 casos con reformulación; H3 títulos de lista (Buenos Aires —, Florida —, California —) protegidos.

**Bloques aplicados:**
- Bloque A: `destinoEditorial.tsx` — 25 reemplazos (México 4, Indonesia 3, EAU 5, Argentina 2, EEUU 4, Costa Rica 2, Reino Unido 1, Ecuador 3, Grecia 1)
- Bloque B: `espana/page.tsx` — 6 reemplazos en prosa de Costa del Sol, Costa Blanca, Cataluña, Costa de la Luz y sección de compradores
- Bloque C: `sobre-nosotros/page.tsx` — 8 strings de país (em-dash → dos puntos)
- Bloque D: `politica-de-privacidad/page.tsx` — no tocado (texto legal)

**Em-dashes remanentes (intencionales):**
- `destinoEditorial.tsx` L478/571/585: H3 títulos de lista protegidos
- `espana/page.tsx` L152: template literal metadata title
- `espana/page.tsx` L195: comentario JSX

**Auditoría de seguridad:** sin `dangerouslySetInnerHTML` nuevo, sin hrefs dinámicos en editorial.

**Archivos tocados:**
- MODIFIED: `src/lib/editorial/destinoEditorial.tsx`
- MODIFIED: `src/app/(public)/destinos/espana/page.tsx`
- MODIFIED: `src/app/(public)/sobre-nosotros/page.tsx`

**Commits (pusheados):**
- `0c5abb9` chore(content): reemplazar em-dash por puntuación natural en prosa editorial (11 países + España + sobre-nosotros)

**Build:** `✓ Compiled successfully`, TypeScript OK, 1111 páginas, 0 errores.

**Próximo paso sugerido:**
- Fase 3.C (AM-1/AM-2): reescribir post `golden-visa-espana-2026-residencia-comprando-propiedad` — artículo actual describe el programa como activo (derogado por LO 1/2025 desde abril 2025)
- EL-1/F diferido: "Propiedades similares" en `/propiedades/[slug]`

---

### Sesión 2026-05-23 — feat(seo): CT-1 textos editoriales — 10 países (Fase 3.B)

**Contexto:** Replicar el patrón editorial de CT-1 (piloto España, commit 2a220ac) a los 10 países restantes del catálogo. Estructura en 3 tiers por volumen de catálogo. Protocolo de 3 pausas de validación antes de commit.

**Decisión técnica:** Contenido estático en `src/lib/editorial/destinoEditorial.tsx` (lookup map slug → componente React). El `[slug]/page.tsx` importa `getDestinoEditorial(slug)` y lo renderiza condicionado a `!ciudad`, entre el bloque de mercado y el grid de propiedades. Sin páginas individuales nuevas: el template dinámico es suficiente para todos los países no-España.

**Correcciones pre-commit aplicadas (6 ajustes del usuario):**
- Indonesia: Leasehold (Hak Sewa) añadido como primera vía; texto del párrafo de cierre sobre elección de estructura
- EAU: Golden Visa 10 años con umbral concreto 2M AED (~545.000 €)
- Argentina: añadida mención Ley 26.737 para tierras rurales y zonas de frontera
- Costa Rica: Zona Marítimo-Terrestre reescrita con medidas correctas (200m totales: 50m pública + 150m restringida desde pleamar ordinaria)
- Grecia: Golden Visa reformado 2024 con umbrales diferenciados (800k€ áreas alta demanda / 400k€ resto)

**Links internos enlazados (verificados en DB antes de insertar):**
- `/blog/invertir-en-tulum-analisis-2026` → México/Tulum
- `/blog/comprar-propiedad-dubai-siendo-latino-guia-2026` → EAU

**Archivos tocados:**
- CREATED: `src/lib/editorial/destinoEditorial.tsx` (904 líneas; 10 funciones + lookup map)
- MODIFIED: `src/app/(public)/destinos/[slug]/page.tsx` (import + sección editorial condicional)

**Commits (pusheados):**
- `a03e137` feat(seo): CT-1 textos editoriales — México, Indonesia, EAU
- `0d4f578` feat(seo): CT-1 textos editoriales — Argentina, EEUU
- `fd447b7` feat(seo): CT-1 textos editoriales — Costa Rica, UK, Ecuador, Grecia, Paraguay

**Build:** `✓ Compiled successfully`, TypeScript OK, 1111 páginas, 0 errores en los 3 builds.

**Próximo paso sugerido:**
- Fase 3.C (AM-1/AM-2): reescribir post `golden-visa-espana-2026-residencia-comprando-propiedad` — el artículo actual describe el programa como activo (derogado por LO 1/2025 desde abril 2025). Anotado como pendiente desde sesión 2026-05-21.
- EL-1/F diferido: "Propiedades similares" en `/propiedades/[slug]` (Bloque 4)

---

### Sesión 2026-05-22 — fix(meta): debug Pixel no visible en producción

**Contexto:** ADS-P6. Meta Pixel Helper decía "No se han encontrado píxeles" en assetsgolden.com tras el deploy de ADS-P5.

**Causa raíz identificada:**
- `NEXT_PUBLIC_META_PIXEL_ID` no estaba configurada en Vercel cuando el primer build de c2398f2 se ejecutó → valor baked como `undefined` → `return null`
- El redeploy posterior usó el build cacheado → el pixel ID nunca se embebió

**Investigación:**
- Build local: `let o="1009529298161262"` sí aparece en el chunk `.next/static/chunks/0ebjul4896wi-.js`
- HTML server: `<noscript>` con pixel ID SÍ aparece localmente, el `<script>` fbq init NO (expected: `afterInteractive` es 100% client-side)
- Confirmado que `strategy="afterInteractive"` nunca inyecta nada en el HTML inicial — siempre es post-hidratación

**Fix aplicado:**
1. `MetaPixel.tsx` simplificado a puro SPA PageView tracker (sin `<Script>` adentro)
2. `<Script strategy="afterInteractive" dangerouslySetInnerHTML={...}>` movido directamente a `RootLayout` (server component) — patrón oficial de Next.js 16 docs para "Application Scripts"
3. Este commit fuerza un rebuild fresco en Vercel con la env var ya configurada

**Archivos tocados:**
- MODIFIED: `src/components/analytics/MetaPixel.tsx`
- MODIFIED: `src/app/layout.tsx`
- CREATED: `outputs/2026-05-22-meta-pixel-debug.md`

**Commits:** (este commit)

**Próximo paso sugerido:**
1. Verificar en producción con Meta Pixel Helper tras el deploy
2. Confirmar que el token `META_CAPI_ACCESS_TOKEN` en Vercel NO tiene ángulos `<>` alrededor — si los tiene, las llamadas CAPI fallarán con 401
3. Agregar `META_CAPI_TEST_EVENT_CODE` en Vercel para test events
4. Una vez confirmado pixel, testear eventos Lead/Contact/ViewContent en Events Manager

---

### Sesión 2026-05-22 — chore(content): CLEANUP inconsistencias pre-CT1-rest

**Contexto:** Antes de replicar CT-1 a los otros 10 países, limpiar inconsistencias de contenido acumuladas: número de países incorrecto ("más de 15" cuando son 11 reales), horario visible desactualizado en /contacto.

**Trabajo hecho:**

- Auditoría completa del repo: encontradas 8 ocurrencias de "15 países"/"más de 15 países", 1 de "15 años" (correctamente atribuida al equipo → no tocada), 1 de horario incorrecto.
- REGLA 1 — "más de 15 países" / "15 países" → "11 países" en 8 lugares: `Footer.tsx`, `page.tsx` (home), `equipo/page.tsx`, `partners/page.tsx`, `sobre-nosotros/page.tsx` (×3: VALUES desc + misión + red internacional), `servicios/page.tsx`.
- REGLA 2 — "Equipo con más de 15 años de experiencia" en `sobre-nosotros/page.tsx:10` (meta description): INTACTO — atribuido correctamente al equipo, no a la empresa.
- REGLA 3 — `contacto/page.tsx:109`: "Lunes a viernes, 9:00–19:00 h" → "Lunes a sábado, 8:00–20:00 h".
- Security-auditor post-edición: cero residuos de "15 países", cero residuos de horario incorrecto. Build limpio (1111 páginas, 0 errores).

**Archivos tocados:**
- MODIFIED: `src/components/Footer.tsx`
- MODIFIED: `src/app/(public)/page.tsx`
- MODIFIED: `src/app/(public)/equipo/page.tsx`
- MODIFIED: `src/app/(public)/partners/page.tsx`
- MODIFIED: `src/app/(public)/sobre-nosotros/page.tsx`
- MODIFIED: `src/app/(public)/servicios/page.tsx`
- MODIFIED: `src/app/(public)/contacto/page.tsx`

**Commits:** `12ad72f` — chore(content): coherencia 11 países + horarios L-S 8-20h

**Próximo paso sugerido:** Replicar CT-1 (texto editorial) a los otros 10 países destino. Primero decidir si el formato es idéntico al de España o adaptado por país.

---

### Sesión 2026-05-22 — feat(meta): Meta Pixel + Conversions API (CAPI)

**Contexto:** Campaña Meta Ads arranca el lunes. Necesidad de instalar tracking completo para optimización por conversiones reales. Pixel ID: 1009529298161262.

**Trabajo hecho:**

- `MetaPixel.tsx`: componente `'use client'` con `next/script afterInteractive`. Usa `usePathname()` + `useRef` para disparar PageView en cada navegación SPA sin duplicar el PageView de la inicialización del script.
- `track.ts`: helpers client-side `fbqTrack()` y `sendServerEvent()`. Declara `window.fbq` globalmente para TypeScript.
- `cookies.ts`: parsea `_fbp` y `_fbc` del header `cookie` del request para el CAPI matching.
- `capi.ts`: `sendCapiEvent()` con SHA-256 (Node.js `crypto`) para todos los campos PII. Incluye test mode via `META_CAPI_TEST_EVENT_CODE` solo en `NODE_ENV !== 'production'`.
- `api/meta/conversion/route.ts`: endpoint POST que extrae IP (`x-forwarded-for`), User-Agent, cookies _fbp/_fbc del request y llama `sendCapiEvent`.
- `ViewContentTracker.tsx`: client component que se monta en `/propiedades/[slug]/page.tsx` y dispara ViewContent al primer render con `content_ids`, precio y ref_code.
- `MetaPixel` integrado en `src/app/layout.tsx` (root, todas las páginas).
- Evento Lead + deduplicación agregado a: `ContactForm.tsx`, `MiDemandaForm.tsx`, `PropertyContactModal.tsx`.
- Evento Contact agregado a `WhatsAppButton.tsx` (click handler).
- `.env.local` actualizado con `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_CAPI_TEST_EVENT_CODE` (placeholders para el token).
- `docs/meta-pixel-capi.md` creado: documentación completa de eventos, archivos, verificación y cómo agregar nuevos eventos.

**Build:** `npm run build` → `✓ Compiled successfully` sin errores TypeScript ni lint.

**Archivos tocados:**
- CREATED: `src/components/analytics/MetaPixel.tsx`
- CREATED: `src/components/analytics/ViewContentTracker.tsx`
- CREATED: `src/lib/meta/track.ts`
- CREATED: `src/lib/meta/cookies.ts`
- CREATED: `src/lib/meta/capi.ts`
- CREATED: `src/app/api/meta/conversion/route.ts`
- CREATED: `docs/meta-pixel-capi.md`
- MODIFIED: `src/app/layout.tsx` (agrega MetaPixel)
- MODIFIED: `src/app/(public)/contacto/ContactForm.tsx` (evento Lead)
- MODIFIED: `src/app/(public)/mi-demanda/MiDemandaForm.tsx` (evento Lead)
- MODIFIED: `src/components/PropertyContactModal.tsx` (evento Lead)
- MODIFIED: `src/app/(public)/propiedades/[slug]/page.tsx` (ViewContentTracker)
- MODIFIED: `src/components/WhatsAppButton.tsx` (evento Contact)
- MODIFIED: `.env.local` (variables Meta — access token pendiente de Iván)

**Commits:** (pendiente de OK del usuario)

**Próximo paso sugerido:**
1. Iván carga `META_CAPI_ACCESS_TOKEN` en `.env.local` y en Vercel → Settings → Environment Variables
2. Agregar `META_CAPI_TEST_EVENT_CODE` con el código de Events Manager para verificar test events
3. `npm run dev` → verificar `window.fbq` en consola y eventos en Events Manager → Test Events
4. Deploy a Vercel y verificar en producción que aparece "Received via Server" en Events Manager

---

### Sesión 2026-05-21/22 — feat(seo): CT-1 piloto — texto editorial /destinos/espana

**Contexto:** Fase 3.B piloto del plan SEO. Insertar contenido editorial (~800-1200 palabras) en `/destinos/espana` entre el bloque de stats y el grid de propiedades, visible solo cuando no hay filtro de zona activo (`{!zona && (...)}` ).

**Restricciones aplicadas (verbatim del usuario):**
- NO inventar cifras concretas (precios, rentabilidades, porcentajes)
- NO prometer retornos
- NO usar "más de 15 países"
- NO aseveraciones no verificadas sobre la empresa
- NO inventar URLs

**Trabajo hecho:**
- Texto editorial aprobado por usuario con un único ajuste: párrafo Golden Visa reemplazado por redacción correcta (programa derogado por Ley Orgánica 1/2025, en vigor desde abril 2025). El borrador original describía el programa como activo — error factual corregido.
- Sección insertada con estructura: panorama de mercado (3 párrafos) → 5 zonas principales (H3 enlazados a filtros internos) → marco legal (NIE, fiscalidad, Golden Visa derogada + disclaimer) → ¿Por qué España? (`<dl>` factores estructurales).
- Links internos a: `/destinos/espana?zona=costa-del-sol`, `?zona=costa-blanca`, `?zona=cataluna`, `?zona=islas-baleares`, `?zona=costa-de-la-luz`, inline Marbella con `&ciudad=Marbella`, y `/blog/golden-visa-espana-2026-residencia-comprando-propiedad`.

**NOTA PENDIENTE:** El post `golden-visa-espana-2026-residencia-comprando-propiedad` probablemente no refleja la derogación del programa (LO 1/2025). **Reescribir cuando lleguemos a Fase 3.C (AM-1/AM-2).**

**Archivos tocados:**
- MODIFIED: `src/app/(public)/destinos/espana/page.tsx` (CT-1)

**Commits:**
- `2a220ac` feat(seo): CT-1 piloto — texto editorial /destinos/espana

**Próximo paso sugerido:**
- Continuar Fase 3.B con resto de páginas de destino (CT-2, CT-3...)
- Reescribir post golden-visa cuando llegue Fase 3.C (AM-1/AM-2)

---

### Sesión 2026-05-21 — feat(seo): Bloque 3.A — Hreflang + Enlazado interno

**Contexto:** Fase 3.A del plan SEO (Plan-SEO-AssetsGolden_1.docx). Dos acciones técnicas sin dependencias editoriales: AM-3 (hreflang) y EL-1 (enlazado interno — 21 páginas con 1 solo enlace entrante según SEMrush).

**Auditorías realizadas antes de implementar:**
- AM-3: BD confirmó 10 posts EN + 13 posts ES. Los posts EN NO son traducciones de los ES (contenido independiente, sin campo de pairing). El `blog_posts` tiene `title_en/content_en` legacy pero no `translation_of`. Hreflang bilateral de pares N/A; se implementa self-referencial por idioma.
- EL-1: `/partners` solo enlazado desde HomeSidebar y back-button de fichas. Footer existente tenía `footerLinks.empresa` definido pero nunca renderizado. `/sobre-nosotros` y `/servicios` mencionaban partners en texto plano sin enlazar. `/partners/[id]` sin sección de otros partners. `/vender-tu-piso` sin links contextuales.

**Trabajo hecho:**

**AM-3** (`7da76be`): `alternates.languages` en `generateMetadata()` de `blog/[slug]/page.tsx`:
- Posts EN → `hreflang="en"` self + `x-default` → homepage
- Posts ES → `hreflang="es-ES"` self + `x-default` → self
- Limitación conocida: `<html lang>` permanece `"es"` en root layout (App Router sin reestructura de rutas). Los `<link rel="alternate" hreflang>` en `<head>` son suficientes para Google.

**EL-1** (`51ad3f6`):
- Footer: columna "Empresa" añadida (5 links: Sobre Nosotros, Equipo, Red de Partners, Blog, Contacto). Grid cambia `lg:grid-cols-4 → lg:grid-cols-5`. `footerLinks.empresa` existía pero nunca se renderizaba.
- `/sobre-nosotros`: Link "Ver red de partners →" en sección "Red internacional" (bloque navy derecho).
- `/servicios`: Botón "Conocer a nuestros partners" → /partners en sección "Presencia internacional".
- `/vender-tu-piso`: Sección contextual al pie con links → /propiedades y → /sobre-nosotros.
- `/partners/[id]`: Sección "Otros partners" (3 cards). Nueva función `getRelatedPartners()` en `queries.ts` — prioriza mismo país, completa con otros si no hay suficientes.
- Diferido: `F` — "Propiedades similares" en `/propiedades/[slug]` → anotar en pendientes Bloque 4.

**Decisiones de diseño:**
- `footerLinks.empresa` tenía key duplicable en `servicios` (`href="/servicios"` aparece 2 veces). Para empresa se usa `key={link.href + link.label}` — defensivo.
- `getRelatedPartners` no valida UUID del `currentId` explícitamente; el gate es `getPartnerById` que llama `notFound()` si el ID no existe antes de que se llame a `getRelatedPartners`.

**Archivos tocados:**
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx` (AM-3)
- MODIFIED: `src/components/Footer.tsx` (EL-1 A)
- MODIFIED: `src/app/(public)/sobre-nosotros/page.tsx` (EL-1 B)
- MODIFIED: `src/app/(public)/servicios/page.tsx` (EL-1 C)
- MODIFIED: `src/app/(public)/partners/[id]/page.tsx` (EL-1 D)
- MODIFIED: `src/app/(public)/vender-tu-piso/page.tsx` (EL-1 E)
- MODIFIED: `src/lib/supabase/queries.ts` (nueva fn `getRelatedPartners`)

**Commits:**
- `7da76be` feat(seo): AM-3 hreflang declarativo en blog/[slug]
- `51ad3f6` feat(seo): EL-1 enlazado interno — footer, sobre-nosotros, servicios, vender-tu-piso, otros partners

**Próximo paso sugerido:**
- Push de `7da76be` y `51ad3f6` a origin/main cuando Iván dé OK
- Bloque 3.B (pendiente definir con Iván qué acciones incluye)
- EL-1/F (propiedades similares) → Bloque 4

---

### Sesión 2026-05-21 (cierre) — chore(brand+seo): correcciones menores post-Bloque-2

**Contexto:** Dos correcciones detectadas tras el cierre del Bloque 2: razón social incorrecta en el footer y horarios del schema /contacto desalineados con Google Business Profile.

**Trabajo hecho:**
- Footer: reemplazada razón social "CFG Global Investment S.L." → "COVA FUMADA GROUP S.L." (solo texto de copyright, sin tocar estructura)
- Schema /contacto: horarios actualizados a L-S 08:00-20:00 (añadido Saturday, opens 09:00→08:00, closes 19:00→20:00) para coincidir con GBP

**Archivos tocados:**
- MODIFIED: `src/components/Footer.tsx`
- MODIFIED: `src/app/(public)/contacto/page.tsx`

**Commits:**
- `9bce336` chore(brand+seo): footer razón social correcta + horarios schema alineados con GBP

**Próximo paso sugerido:**
- Verificar en producción (Vercel) que el deploy del commit `9bce336` sea exitoso
- Continuar con Bloque 3 del plan SEO o revisar pendientes de Atilio

---

### Sesión 2026-05-21 — feat(seo): Bloque 2 completo — Schema markup global y por página

**Contexto:** Ejecución del Bloque 2 del plan SEO (Plan-SEO-AssetsGolden_1.docx). Objetivo: implementar schema markup correcto en todas las entidades clave del sitio. Sesión repartida en dos contextos (compactado a mitad); datos confirmados en sesión anterior.

**Trabajo hecho:**
- **AC-1** (`a788c49`): Schema global en layout — `src/components/seo/GlobalSchemaOrg.tsx` con `@graph` conteniendo `["LocalBusiness","RealEstateAgent"]` + `WebSite` + `SearchAction`. Validado con seo-schema: 0 FAIL, 2 WARN aceptados. Iteraciones: 3 rondas de refinamiento (target EntryPoint→string, @type array simplificado y revertido, @type string simple descartado por WARN de rich results).
- **SC-6** (`5153de8`): Componente reutilizable `src/components/seo/Breadcrumb.tsx` con JSON-LD BreadcrumbList + nav visible. Variante `secondary` para destinos (fondo bg-secondary). Instalado en propiedades/[slug], destinos/[slug], destinos/espana, blog/[slug] (nuevo en blog).
- **AH-6** (`b3cafac`): RealEstateListing schema mejorado en propiedades/[slug] — precio en `Offer` con `availability`, `numberOfRooms`, `floorSize QuantitativeValue`, `@id`, `seller` referencia a #organization, `addressRegion`.
- **SC-3** (`84851c4`): LocalBusiness/RealEstateAgent schema en /contacto — corrige name (era "Assets Golden International"), telephone E.164, agrega address PostalAddress con dirección real (schema-only, no visible en UI).
- **SC-5** (`ed8cc29`): BlogPosting schema mejorado en blog/[slug] — author/publisher via @id en lugar de objetos inline duplicados, @id propio, inLanguage desde post.language. FAQPage sin cambios (ya era correcto).
- **SC-4**: EXPLÍCITAMENTE DIFERIDO — bloqueado hasta que Atilio provea certificaciones reales del equipo.

**Decisiones de diseño:**
- `@type: ["LocalBusiness", "RealEstateAgent"]` como array explícito (no string simple) para activar LocalBusiness rich results en Google
- `SearchAction.target` como string directo (no objeto EntryPoint) — formato actual de Google
- address en /contacto incluida en schema pero NO mostrada en UI (decisión de privacidad anterior)
- numberOfItems: 2364 estático aceptado — coste de hacerlo dinámico supera el beneficio

**Archivos tocados:**
- CREATED: `src/components/seo/GlobalSchemaOrg.tsx`
- CREATED: `src/components/seo/Breadcrumb.tsx`
- MODIFIED: `src/app/layout.tsx` (import GlobalSchemaOrg)
- MODIFIED: `src/app/(public)/propiedades/[slug]/page.tsx` (AH-6 + SC-6)
- MODIFIED: `src/app/(public)/destinos/[slug]/page.tsx` (SC-6)
- MODIFIED: `src/app/(public)/destinos/espana/page.tsx` (SC-6)
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx` (SC-5 + SC-6)
- MODIFIED: `src/app/(public)/contacto/page.tsx` (SC-3)
- DELETED: `src/components/GlobalSchemaOrg.tsx` (movido a seo/ subdir)
- DELETED: `validate-schema.js` (residuo del agente seo-schema)

**Commits:**
- `a788c49` feat(seo): AC-1 schema Organization global
- `5153de8` feat(seo): SC-6 BreadcrumbList — componente reutilizable con JSON-LD
- `b3cafac` feat(seo): AH-6 RealEstateListing schema enriquecido en propiedades/[slug]
- `84851c4` feat(seo): SC-3 LocalBusiness/RealEstateAgent schema en /contacto
- `ed8cc29` feat(seo): SC-5 BlogPosting schema enriquecido en blog/[slug]

**Próximo paso sugerido:**
- Push de los 5 commits del Bloque 2 a origin/main
- Bloque 3 del plan SEO (si existe) o revisar si quedan acciones pendientes del documento
- SC-4 (Person schema equipo) queda bloqueado hasta que Atilio provea datos reales de certificaciones

---

### Sesión 2026-05-20 — feat(seo): Bloque 1 completo — correcciones técnicas SEO inmediatas

**Contexto:** Ejecución del Bloque 1 del plan SEO aprobado (Plan-SEO-AssetsGolden_1.docx). Objetivo: corregir los errores técnicos de mayor impacto sin dependencias externas. Sesión repartida en dos contextos (compactado a mitad).

**Trabajo hecho:**
- **AC-2** (ya committeado en sesión anterior, `e22fc68`): canónicas autorreferenciales en las 28 rutas públicas ✓
- **AC-3** (`d0ba2b2`): `openGraph.url` dinámico por página — sobreescribe el og:url fijo a la home en las 28 rutas estáticas y en los 5 `generateMetadata` dinámicos
- **AH-5** (`4be6d93`): elimina doble branding en títulos — home usa `{ absolute }`, resto pierde el sufijo de marca para que el template del layout lo añada una sola vez
- **TT-1** (`12f2524`): títulos y descripciones únicos — soluciona colisión `/consejos` vs `/blog/consejos`; quita `| Assets Golden` de títulos dinámicos en destinos; expande 8 descripciones cortas a ~150 chars; atribuye "15 años" al equipo (no a la marca); fallback de propiedades sin precio
- **TW-1** (`521ffde`): Twitter Card dinámica — quita `twitter:title/description` fijos del root layout; añade `twitter.images` con la imagen propia en propiedades/[slug], blog/[slug] y destinos/[slug]
- **AC-5** (`706419e`): activa caché HTTP — elimina `force-dynamic` de la home; cambia `Cache-Control` en `next.config.ts` de `no-store` a `s-maxage=3600, stale-while-revalidate=86400`
- **AH-1**: ya estaba implementado (HeroImageCarousel y PropertyGalleryClient ya tenían `priority` en la primera imagen) — sin cambio de código
- **AH-3** (`4f480c7`): preconexiones a CDN — `link rel=preconnect` en layout.tsx para los dos buckets Supabase activos y medianewbuild.com
- **AH-2** (`c7151cd`): crea `public/llms.txt` con entidad, razón social correcta (COVA FUMADA GROUP, SOCIEDAD LIMITADA), páginas principales, especialidades y licencia de contenido

**Archivos tocados:**
- MODIFIED: `src/app/layout.tsx` (TW-1 + AH-3)
- MODIFIED: `src/app/(public)/page.tsx` (AC-5)
- MODIFIED: `next.config.ts` (AC-5)
- MODIFIED: `public/llms.txt` (CREATED — AH-2)
- MODIFIED: 28 archivos `page.tsx` en `src/app/(public)/` (AC-3, AH-5, TT-1)
- MODIFIED: `src/app/(public)/propiedades/[slug]/page.tsx` (TW-1)
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx` (TW-1)
- MODIFIED: `src/app/(public)/destinos/[slug]/page.tsx` (TW-1 + TT-1)
- MODIFIED: `src/app/(public)/destinos/espana/page.tsx` (TT-1)

**Commits:**
- `d0ba2b2` feat(seo): AC-3 — og:url dinámico en las 28 rutas públicas
- `4be6d93` feat(seo): AH-5 — eliminar doble branding en títulos de página
- `12f2524` feat(seo): TT-1 — títulos y descripciones únicos en todas las páginas
- `521ffde` feat(seo): TW-1 — Twitter Card dinámica por página
- `706419e` feat(seo): AC-5 — activar caché HTTP en la home
- `4f480c7` feat(seo): AH-3 — preconexión a CDN externos de imágenes
- `c7151cd` feat(seo): AH-2 — publicar llms.txt para motores de IA (GEO)

**Próximo paso sugerido:**
Bloque 2 — Schema markup. Depende de 3 datos a confirmar con Atilio:
1. Razón social: COVA FUMADA GROUP, SOCIEDAD LIMITADA (a validar con Atilio)
2. Número exacto de países en la red de partners
3. URL del perfil LinkedIn de empresa de Assets Golden
Sin estos datos, NO ejecutar AC-1 (schema Organization global).

---

### Sesión 2026-05-20 — fix(contacto): eliminar mapa y dirección física — solo 3 canales de contacto

**Contexto:** Iván pidió quitar todo lo relacionado con el mapa embebido y la dirección física de `/contacto`, dejando únicamente 3 canales: teléfono, email y WhatsApp. Las páginas legales deben conservar la dirección completa (obligatorio legal).

**Trabajo hecho:**
- `contacto/page.tsx` reescrito:
  - Eliminado `MapPin` de imports de lucide-react; añadido `MessageCircle` para WhatsApp
  - `contactItems` ahora son 3: Phone (+34 611 85 30 01), Mail (hola@assetsgolden.com), WhatsApp (wa.me/34611853001)
  - Eliminado el bloque `<iframe>` de Google Maps
  - Eliminados `address` y `geo` del JSON-LD schema (evita publicar dirección en datos estructurados)
  - Actualizado encabezado: "Nuestra oficina" → "Información de contacto"
  - Actualizada metadata description: eliminada referencia "Oficina en Barcelona"
  - Simplificado render de items: todos tienen href, eliminado condicional `href ? <a> : <p>`
- **Verificación páginas legales:**
  - `aviso-legal/page.tsx` l.37: "José Agustín Goytisolo 31, L5, 08970 Sant Joan Despí (Barcelona)" ✓
  - `politica-de-privacidad/page.tsx` l.37: "José Agustín Goytisolo 31, L5, 08970 Sant Joan Despí (Barcelona)" ✓
  - `politica-de-cookies/page.tsx`: no tiene dirección postal (correcto — la política de cookies no la requiere legalmente) ✓
- Build: `Compiled successfully in 17.9s`, TypeScript OK, **1109 páginas**, `/contacto` como `○ (Static)` ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/contacto/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — pendiente validación visual de Iván.

**Próximo paso sugerido:**
1. Iván abre `/contacto` en dev server y verifica que aparecen los 3 canales (Teléfono, Email, WhatsApp), que el mapa ya no está, y que los enlaces funcionan (tel:, mailto:, wa.me)
2. Si OK: commit `fix(contacto): eliminar mapa + dirección — solo 3 canales` + push

---

### Sesión 2026-05-13 — CIERRE FORMAL (resumen del día + commits reales)

**Nota:** Las 4 entradas individuales de abajo dicen "Commits: NO" porque fueron escritas antes de que Iván validara y autorizara. Esta entrada documenta los commits reales y cierra la sesión formalmente.

**Commits del día (en orden cronológico):**

| Hash | Descripción |
|------|-------------|
| `1ff4bf8` | fix(propiedades): paginador pagina→page |
| `06f02c4` | feat(seo): 3 redirects español + metadata openGraph/twitter + sitemap |
| `e9c7720` | feat(brand): assets de marca v1 (icon.png + opengraph-image.png + favicon.ico) |
| `e9a8b86` | fix(brand): favicon v2 — solo círculo AG+león, sin texto (legible a 16×16) |
| `c39526d` | fix(brand): borrar favicon.ico duplicado en src/app/ |
| `94796e6` | feat(seo): 12 redirects inglés Lovable + handler dinámico /property/UUID |

**Operaciones DB (sin commit — vía MCP directo):**
- RLS habilitado en tabla `user_roles`
- 2 backups creados en Supabase

**Estado final del día:**
- Todos los commits pusheados a `origin/main` ✓
- Árbol de trabajo limpio (`nothing to commit, working tree clean`) ✓
- Build: 1109 páginas estáticas, 0 errores TypeScript ✓
- Vercel deployando `94796e6` automáticamente

**Pendientes abiertos que siguen igual (no atacados hoy):**
- Refactor pipeline leads (Resend), rotación de claves, GDPR forms, DNS — todos bloqueados por Atilio

---

### Sesión 2026-05-14 — redirects 301 slugs en inglés de Lovable + handler /property/[uuid]

**Contexto:** Google había indexado la web cuando estaba en Lovable en inglés. Los 3 redirects del commit `06f02c4` cubrían slugs en español; faltaban todos los slugs en inglés que también daban 404. Además, Lovable usaba UUIDs para identificar propiedades (`/property/UUID`) y Next.js usa slugs (`/propiedades/slug`).

**Trabajo hecho:**
- `next.config.ts`: agregados 12 redirects 301 para slugs en inglés en la sección `redirects()` existente:
  `/contact→/contacto`, `/properties→/propiedades`, `/investments→/inversiones`, `/sell→/vender-tu-piso`, `/about→/sobre-nosotros`, `/services→/servicios`, `/promotions→/promociones`, `/team→/equipo`, `/destinations→/destinos`, `/news→/noticias`, `/tips→/consejos`, `/my-demand→/mi-demanda`
  — `/partners` NO incluido: la ruta ya existe en Next.js (`src/app/(public)/partners/page.tsx`)
- Creado `src/app/property/[id]/page.tsx`: handler dinámico que recibe UUID, valida formato con regex, busca `slug` en Supabase con `createStaticClient()`, y hace `permanentRedirect()` (308) a `/propiedades/[slug]`. Si UUID inválido o no encontrado → `notFound()` (404).
  — Fix necesario respecto al spec: `RedirectType.permanent` no existe en esta versión de Next.js (16.2.6) — la API correcta es `permanentRedirect()` importada desde `next/navigation`
- Build: `Compiled successfully in 18.0s`, TypeScript OK, **1109 páginas**, `ƒ /property/[id]` aparece como ruta dinámica ✓
- Total `permanent: true` en next.config.ts: **15** (1 www + 2 español + 12 inglés)

**Archivos tocados:**
- MODIFIED: `next.config.ts` (12 redirects inglés agregados)
- CREATED: `src/app/property/[id]/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual de Iván antes de commit.

**Próximo paso sugerido:**
1. Commit + push → deploy Vercel
2. Smoke test en producción: `/contact`, `/sell`, `/properties` → deben redirigir a sus equivalentes en español
3. Para testear `/property/[uuid]`: obtener un UUID real de la tabla `properties` en Supabase y verificar que redirige al slug correcto

---

### Sesión 2026-05-14 — fix favicon duplicado: borrado src/app/favicon.ico

**Contexto:** El HTML de producción tenía 3 `link rel="icon"` tags en conflicto. El problema era `src/app/favicon.ico` (25 KB, versión vieja del logo completo con texto) que Next.js procesaba como metadata file y emitía con hash (`favicon.ico?favicon.0x3dzn~oxb6tn.ico` con `sizes="256x256"`), sobreescribiendo el `icon.png` correcto.

**Trabajo hecho:**
- `git rm src/app/favicon.ico` — eliminado el archivo residual de 25 KB
- Build limpio: `Compiled successfully in 18.0s`, TypeScript OK, **1109 páginas** (−1 respecto al anterior, ya que Next.js ya no registra `/favicon.ico` como ruta metadata propia)
- Build output confirma que **ya no aparece ninguna ruta `/favicon.ico` con hash** — solo `○ /icon.png` y `○ /opengraph-image.png` ✓

**Estado final:**
- `src/app/favicon.ico` → ❌ eliminado
- `public/favicon.ico` (10 KB, versión correcta) → ✅ sigue activo para compatibilidad legacy
- `src/app/icon.png` (113 KB) → ✅ favicon moderno, sirve como `○ /icon.png`

**Archivos tocados:**
- DELETED: `src/app/favicon.ico`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual de Iván antes de commit.

**Próximo paso sugerido:**
1. Iván verifica en el navegador que el favicon del tab muestra el logo correcto (después del deploy)
2. Commit: `git rm src/app/favicon.ico` + `DAILY_LOG.md` → push

---

### Sesión 2026-05-13 — assets de marca temporales: icon.png, opengraph-image.png, favicon.ico

**Contexto:** Iván generó los assets de marca a partir del logo existente de Assets Golden con la marca de Gemini AI removida. Hay que colocarlos en las ubicaciones que Next.js convention espera para que el favicon y el OG preview funcionen.

**Trabajo hecho:**
- `src/app/icon.png` (112 KB, 512×512) colocado por Iván — Next.js lo sirve automáticamente como `/icon.png`
- `src/app/opengraph-image.png` (111 KB, 1200×630) colocado por Iván — Next.js lo sirve como `/opengraph-image.png`
- `public/favicon.ico` (3 KB) colocado por Iván — compatibilidad con crawlers y browsers legacy
- Build: `Compiled successfully in 17.8s`, TypeScript OK, **1110 páginas** (2 más que antes: Next.js registró `/icon.png` y `/opengraph-image.png` como rutas estáticas propias ✓)
- layout.tsx ya tenía las referencias correctas desde commit `06f02c4` — sin cambios en código

**Verificaciones:**
- `src/app/icon.png` → ✅ 112683 bytes
- `src/app/opengraph-image.png` → ✅ 113520 bytes
- `public/favicon.ico` → ✅ 3058 bytes
- Build output muestra `○ /icon.png` y `○ /opengraph-image.png` como rutas estáticas ✓
- 4 matches de referencias en layout.tsx (líneas 30, 32, 45, 58) ✓

**Archivos tocados:**
- CREATED: `src/app/icon.png`
- CREATED: `src/app/opengraph-image.png`
- CREATED: `public/favicon.ico`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Nota:** Assets son temporales (logo limpiado de marca Gemini). Pendiente logo profesional cuando Atilio lo provea — reemplazar los mismos 3 archivos cuando llegue.

**Commits:** NO — validación visual de Iván antes de commit (verificar favicon en browser y OG preview en WhatsApp/Slack).

**Próximo paso sugerido:**
1. Iván abre `http://localhost:3000` en dev server y verifica que el favicon del tab muestra el logo de Assets Golden (no el de Vercel)
2. Iván comparte un link en WhatsApp o usa `https://opengraph.xyz` para verificar el preview 1200×630
3. Si OK: commit los 3 archivos binarios + DAILY_LOG → push → deploy Vercel
4. **Pendiente futuro**: cuando Atilio provea el logo profesional definitivo, reemplazar `src/app/icon.png`, `src/app/opengraph-image.png` y `public/favicon.ico`

---

### Sesión 2026-05-13 — redirects 301 slugs Lovable + metadata OG/Twitter + sitemap completo

**Contexto:** Google tenía indexados 3 slugs de Lovable que daban 404 en la nueva web. Además, layout.tsx no tenía openGraph/twitter configurados (causa del preview Vercel al compartir links). Sitemap tenía 8 rutas del proyecto sin incluir.

**Trabajo hecho:**
- `next.config.ts`: agregados 3 redirects a la sección `redirects()` existente (junto al www→non-www):
  - `/oportunidades-de-inversion` → `/inversiones` (301 permanente)
  - `/quiero-vender-mi-propiedad` → `/vender-tu-piso` (301 permanente)
  - `/whatsapp` → `/` (302 temporal, por si se crea la ruta en el futuro)
- `src/app/layout.tsx`: agregados `icons`, `openGraph`, `twitter` y `robots` al objeto `metadata`. Los assets (`/icon.png`, `/favicon.ico`, `/apple-icon.png`, `/opengraph-image.png`) aún no existen — se crean en sesión separada cuando Iván tenga los assets de marca; Next.js los ignora silenciosamente hasta entonces.
- `src/app/sitemap.ts`: agregadas 8 rutas faltantes a `STATIC_PAGES`: `/sobre-nosotros` (0.8), `/servicios` (0.8), `/colabora` (0.6), `/mi-demanda` (0.7), `/promociones` (0.5), `/partners` (0.5), `/consejos` (0.4), `/noticias` (0.4)
- Build: `Compiled successfully in 17.7s`, TypeScript OK, 1108 páginas ✓

**Verificaciones:**
- 3 matches de slugs Lovable en next.config.ts (líneas 134, 139, 144) ✓
- 3 matches de openGraph/twitter/icons en layout.tsx (líneas 29, 35, 53) ✓
- 3+ matches de rutas nuevas en sitemap.ts ✓

**Archivos tocados:**
- MODIFIED: `next.config.ts` (3 redirects agregados)
- MODIFIED: `src/app/layout.tsx` (icons + openGraph + twitter + robots)
- MODIFIED: `src/app/sitemap.ts` (8 rutas nuevas)
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual de Iván antes de commit.

**Próximo paso sugerido:**
1. Iván valida en dev server: `/oportunidades-de-inversion` → redirige a `/inversiones`, etc.
2. Compartir link en WhatsApp/Slack para confirmar que ya no aparece favicon Vercel (requiere deploy + assets de imagen)
3. **Pendiente separado**: crear `src/app/icon.png` (512×512) y `src/app/opengraph-image.png` (1200×630) con assets de marca de Iván → eso cierra el problema visual del favicon y OG preview
4. Si OK: commit + push

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
