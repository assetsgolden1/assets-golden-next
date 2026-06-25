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
- [x] [LEADS-SEQ-P03] Motor de secuencia de nurture sobre `meta_leads`: segmento A/B por `presupuesto_raw`, 5 plantillas de email (no 3), envío escalonado con `seq_email1..5_sent_at` + respeto de `seq_paused`, endpoint cron + workflow. **ACTIVADO 2026-06-16** (commit `e5be41a`): `schedule` descomentado → cron diario **09:00 UTC** vivo. `META_LEADS_CRON_SECRET` ya operativo en Vercel (el endpoint validó el Bearer hoy con HTTP 200). Primera corrida automática: 2026-06-17 09:00 UTC.
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
- [x] Refactor: extraer `SortableImage` como componente compartido entre create y edit forms (sesión 2026-06-01)
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
- [ ] Cargar en Vercel: META_LEADS_SYNC_TOKEN (Sensitive), META_LEADS_FORM_ID, META_LEADS_SHEET_ID, META_LEADS_CRON_SECRET (Sensitive) — valores en .env.local
- [ ] Test manual del sync: `POST /api/leads/sync-meta/manual` con `Authorization: Bearer [META_LEADS_CRON_SECRET]`
- [ ] Verificar que los 7 leads históricos se saltean todos (deduplicación por email)
- [x] Si se quiere sync cada 15min: upgrade Vercel Pro o configurar QStash/GitHub Actions — resuelto con GitHub Actions cada hora (0 * * * *)

---

## 📝 Historial de sesiones

Append-only. Cada entrada nueva va ARRIBA (más reciente primero).

---

## 2026-06-24 (cont.) — Fix upload imágenes (compresión en cliente)

- Atilio no podía crear una propiedad: error "File too large (max 5MB)" al subir foto.
- Causa: validación de 5MB en el endpoint src/app/api/admin/upload-image/route.ts (bucket property-images), sin compresión previa.
- Solución (commit 0a12406, verificado READY en prod): helper src/lib/utils/compressImage.ts (browser-image-compression, maxSizeMB 4.5, maxWidthOrHeight 2560, quality 0.8, preserva nombre, passthrough si no es imagen o si falla). Integrado en el loop de subida de nueva-propiedad/page.tsx y propiedades/[id]/edit/page.tsx. La validación de 5MB queda como red de seguridad posterior.
- Pendiente menor: aplicar el mismo helper a destinos/[slug]/edit/page.tsx y TeamManager.tsx (los usa Ivan, no Atilio; baja prioridad).

---

## 2026-06-24 — Cambios de Atilio + rebranding + 3 posts de blog

### Cambios pedidos por Atilio (cerrados y verificados en prod)
1. Destinos del home dinámicos + carrusel — commit 67561b4
   - Eliminada whitelist VALID_COUNTRIES/isValidCountry que ocultaba países (Rep. Dominicana no aparecía).
   - Nuevo componente src/components/home/DestinationsCarousel.tsx (scroll-snap horizontal, flechas, reutiliza DestinationCard3D).
   - Verificado: 12 países visibles incl. Rep. Dominicana.
2. Foto 1 y 2 repetidas en galería — commit a7d6622
   - Dedupe Array.from(new Set([image_url, ...gallery_urls].filter(Boolean))) en
     src/app/[locale]/(public)/propiedades/[slug]/page.tsx y src/components/portal/PortalPropertyDetail.tsx.
3. Rebranding "lujo/luxury" -> "exclusivas/exclusividad" (4 capas)
   - Código marca/UI: commit df727dc (messages es/en, JSON-LD, metadata, componentes; descriptor "Inmobiliaria Internacional de Propiedades Exclusivas" / "International Exclusive Real Estate"; "11 países" -> "12").
   - Editoriales: commit 5d622bb (destinoEditorial.tsx + destinos/espana/page.tsx, con concordancia).
   - DB destinos: 3 country_destinations (Costa Rica, Emiratos, Ecuador) actualizados por MCP.
   - DB blog: 13 posts limpiados por MCP (preservando "flujo"). Verificado 0 "lujo/luxury" real.

### Blog: 3 posts nuevos (pedido de Atilio, estilo "tips"), bilingües, published=true
Cargados por Supabase MCP (filas separadas por idioma; columnas _en son legacy, vacías):
- A: como-trabajar-con-consultor-inmobiliario-propiedad-exclusiva / work-with-real-estate-consultant-exclusive-property (cat guías/guides, read_time 8, banner AG-01425 Tiana)
- B: comprar-propiedad-extranjero-sin-estar-presente / buy-property-abroad-without-being-there (read_time 8, banner AG-04298 Platja d'Aro)
- C: checklist-segunda-residencia-mediterraneo / checklist-mediterranean-second-home (read_time 9, banner AG-04296 Sant Just)
Los 3 verificados en prod: 200, hero, FAQPage + BlogPosting + Breadcrumb OK, enlaces dorados funcionando.

### Pendientes para próxima sesión
- Blog: corregir post ES comprar-piso-espana-siendo-extranjero-2026 (Golden Visa/NLV); Fase C EN (7 posts por expandir).
- Viejos: cuenta admin de Joan; PDF portal end-to-end; confirmación Atilio crear propiedades; criterios /inversiones; NOSOTROS truncado; bug created_time meta_leads_synced.
- SEO/infra: verificar GSC + reenviar sitemap; thumbnails/egress; banner cookies + gateo GA4/Pixel (GDPR).

---

### 2026-06-19 — [FASE-SEO-B1 + B2 + B2.1] Reposicionamiento internacional home + traducción de títulos/alt de propiedad en EN

**Contexto:** Bloque "B" del SEO: (B1) reescribir title/description de la home hacia un posicionamiento internacional (off-market, 12 países) en vez del foco "Barcelona"; (B2) traducir en runtime los títulos de propiedad en la vista EN (en la DB están en español, patrón "{Tipo} en {Ciudad}", auto-generados por el sync) sin tocar la DB ni el ES; (B2.1) extender esa traducción también al `alt` de las imágenes.

**Trabajo hecho — B1 (home title/description):**
- El `generateMetadata` de la home (`src/app/[locale]/(public)/page.tsx`) lee `Home.meta_title` / `Home.meta_description` de next-intl. Se reemplazaron en AMBOS idiomas:
  - ES: `Propiedades de Lujo en España y el Mundo | Assets Golden` + description off-market / 12 países.
  - EN: `Luxury Property in Spain & Worldwide | Assets Golden` + description off-market / 12 countries / Book a consultation.
- El `openGraph` de la home solo definía `url` (title/description heredaban del layout). Se extendió con `title`/`description` + bloque `twitter`, reusando las mismas traducciones, para coherencia del preview social por idioma.
- NO se tocó H1/hero ni texto visible — solo metadata.

**Trabajo hecho — B2 (títulos de propiedad en EN):**
- **Hallazgo:** ya existía `translatePropertyTitle` en `src/lib/propertyTypes.ts`, pero su lógica estaba ROTA para los datos reales (asumía feed en inglés: `if (locale==='en') return title`), por eso la web EN mostraba los títulos en español. Se REESCRIBIÓ esa función (no se creó duplicado) con la lógica correcta: si `locale!=='en'` o título vacío → tal cual; match case-insensitive `^(<tipo>)\s+en\s+(.+)$`; mapa de 15 tipos (apartamento/piso→Apartment, villa/chalet→Villa, ático→Penthouse, adosado→Townhouse, casa→House, dúplex→Duplex, estudio→Studio, bungalow→Bungalow, finca→Country house, terreno/parcela→Plot, local→Commercial unit, penthouse→Penthouse), clave normalizada a minúscula+sin acento; si matchea → `${TipoEN} in ${ciudad}` (ciudad SIN traducir); si no → título sin cambios.
- Como el `PropertyCard` central (`src/components/properties/PropertyCard.tsx`) ya llamaba `translatePropertyTitle(title, locale)`, todos los listados que lo usan quedaron cubiertos automáticamente al arreglar la función: `/propiedades`, `/inversiones`, `/promociones`, `/destinos/[slug]` y España (`SpainPropertiesGrid`).
- Puntos que mostraban el título crudo y se corrigieron a mano: `HomePropertiesCarousel.tsx` (carousel destacadas, ya recibía `locale`), `RelatedProperties.tsx` (relacionadas del blog, recibe `language`), y en el detalle `propiedades/[slug]/page.tsx`: `<title>` + `og:title` + `twitter.title` del `generateMetadata`, `name` del JSON-LD `RealEstateListing` y el último crumb del breadcrumb. El H1 del detalle ya usaba el helper con locale.

**Trabajo hecho — B2.1 (alt de imágenes en EN):**
- Se aplicó `translatePropertyTitle(title, locale)` al `alt` en: `PropertyCard` (cubre todos los listados), `HomePropertiesCarousel`, `RelatedProperties`, y la galería del detalle (`PropertyGalleryClient` usa el título solo para el alt → se le pasa `title={localizedTitle}` ya traducido desde el server). Las palabras del template del alt ("imagen"/"miniatura") quedan en español (fuera de scope).

**Verificación:** `npx tsc --noEmit` → 0 errores (en B2 y B2.1). JSON de mensajes válido (B1). Prueba de la lógica del helper con 10 casos reales: tipos conocidos traducen (ciudad intacta), ES sin cambios, tipos fuera del mapa ("Loft en Valencia") y títulos ya en inglés ("Penthouse in Marbella") quedan igual.

**No tocado (correcto):** portal de agentes (`PortalPropertiesGrid`/`PortalPropertyDetail` llaman al helper con default `'es'` → sin cambio de comportamiento), admin, PDFs, DB y la vista ES. `LocationBrowser` no se modificó (código muerto, no renderizado, sin locale en scope).

**Archivos tocados:**
- MODIFIED: `messages/es.json`, `messages/en.json`, `src/app/[locale]/(public)/page.tsx` (B1).
- MODIFIED: `src/lib/propertyTypes.ts`, `src/components/HomePropertiesCarousel.tsx`, `src/components/RelatedProperties.tsx`, `src/app/[locale]/(public)/propiedades/[slug]/page.tsx` (B2).
- MODIFIED: `src/components/properties/PropertyCard.tsx`, `src/components/HomePropertiesCarousel.tsx`, `src/components/RelatedProperties.tsx`, `src/app/[locale]/(public)/propiedades/[slug]/page.tsx` (B2.1).

**Commits (todos a `main`):** `0c6fb35` — feat(seo): title+description home internacional ES/EN + OG · `e95a268` — feat(seo): traducir titulos de propiedad en vista EN (runtime, sin tocar DB) · `d18cd1c` — fix(seo): traducir alt de imagenes de propiedad en vista EN.

**Avisos / cosas a revisar:**
- El badge de tipo en `HomePropertiesCarousel` (`typeLabels`, línea ~82) sigue en español hardcodeado — fuera de scope de estas fases (solo títulos/alt). Evaluar si se quiere traducir el badge en EN.
- Verificar en prod: home EN/ES con el nuevo title; una propiedad en `/en/propiedades/...` con el título traducido en H1, `<title>`, breadcrumb y alt de las imágenes.

**Próximo paso sugerido:** Validar en prod los títulos EN y el nuevo posicionamiento de la home. Retomar bloqueantes go-live (refactor pipeline de leads / páginas legales GDPR / DNS de Atilio).

---

### 2026-06-18 — [FASE-SEO-P1 + FASE-SEO-P2] Verificación Search Console (meta) + cierre de fase SEO + limpieza

**Contexto:** Cierre del bloque SEO del día. P1: verificación de Google Search Console por dos vías (meta en el `<head>` + archivo HTML en `public/`). P2: limpieza — el archivo de verificación HTML resultó no servible por el routing de next-intl, así que se quita y se deja SOLO la meta (que ya quedó en prod); además se saca del tracking un script one-off que se había colado en un commit previo.

**Trabajo hecho — P1 (verificación):**
- **Meta de verificación** (`src/app/layout.tsx`, layout RAÍZ): se agregó `verification: { google: '_PodCQHuUTmkjLHShE5nV4Pm3DYb3XqxXCzC_Cqx5Gg' }` al export `metadata`. Next emite `<meta name="google-site-verification" content="…">` en TODAS las páginas. Esta es la vía de verificación definitiva.
- **Archivo HTML** (`public/google0f1c578b5bda96a4.html`): se creó en P1 pero en P2 se DESCARTÓ — el routing de next-intl no lo sirve en `https://assetsgolden.com/google0f1c578b5bda96a4.html`, así que era inútil. La verificación queda cubierta 100% por la meta del head.

**Trabajo hecho — P2 (limpieza):**
- **`scripts/importHistoricalLeads.ts`**: salió del tracking con `git rm --cached` (sigue en disco, no se borró) y se agregó al `.gitignore` en el bloque de scripts one-off. Se había colado por el `git add -A` del commit `7e30894` (verificación), ya estaba marcado como "decidir si va al repo" desde la sesión SEO-P0/A.
- **`public/google0f1c578b5bda96a4.html`**: borrado del disco y del repo.

**Resumen del bloque SEO completo del día (P0 + A + P1 + P2):**
- **GA4** instalado (ID **G-5E27WGKEDF**) vía `@next/third-parties`, siempre activo (no consent-gated, decisión explícita).
- **Sitemap**: paginado de **1000 → 2464** propiedades (`getAllPropertySlugs` con `.range()` en lotes de 1000).
- **Canonical self por idioma**: las páginas EN ahora canonicalizan a su propia URL `/en/...` (antes a la ES).
- **robots**: `Disallow: /portal/` (sumado a `/admin/`).
- **hreflang** confirmado en propiedades (vía `buildAlternates`).
- **Footer + `sameAs`**: redes agregadas (LinkedIn, Instagram, Fotocasa).
- **Verificación Search Console**: por meta `google-site-verification` en el `<head>` (vía `metadata.verification.google`).

**Archivos tocados:**
- MODIFIED: `src/app/layout.tsx` (campo `verification`), `.gitignore` (+`scripts/importHistoricalLeads.ts`), `DAILY_LOG.md` (esta entrada).
- CREATED y luego DELETED: `public/google0f1c578b5bda96a4.html`.
- UNTRACKED (rm --cached, sigue en disco): `scripts/importHistoricalLeads.ts`.

**Commits:** `7e30894` — chore(seo): verificacion Search Console (meta + archivo) · (esta sesión) — chore(seo): cierre fase + sacar script one-off + quitar archivo de verificacion no servible. Ambos a `main`.

**Avisos / cosas a revisar:**
- Tras el deploy, completar la verificación del dominio en Google Search Console (la propiedad debería verificar sola al detectar la meta). Si Google pide el método de archivo HTML, NO usarlo: next-intl no lo sirve — usar la meta o un registro DNS.
- Pendiente de prod (heredado de SEO-P0/A): validar GA4 en Realtime, conteo del sitemap (~2464) y canonical de las `/en/...`.

**Próximo paso sugerido:** Verificar la propiedad en Search Console una vez deployado. Retomar bloqueantes go-live (refactor pipeline de leads / páginas legales GDPR / DNS de Atilio).

---

### 2026-06-18 — [FASE-SEO-P0 + FASE-SEO-A] GA4 + Fotocasa + canonical self / sitemap paginado / robots

**Contexto:** Dos fases SEO en una sesión. P0: instalar GA4 (no había ningún tag de analytics medible en la web aparte del Meta Pixel consent-gated) y sumar Fotocasa al footer + `sameAs`. A: arreglar sitemap (listaba solo 1000 de ~2400 propiedades), canonical self-referencing por idioma (las páginas EN canonicalizaban a la ES), `Disallow: /portal/` en robots y confirmar hreflang en propiedades.

**Trabajo hecho — P0:**
- **GA4**: `npm install @next/third-parties` (v16.2.9). En el layout RAÍZ (`src/app/layout.tsx`, el que tiene `<html>/<body>`) se importa `{ GoogleAnalytics }` y se renderiza `<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-5E27WGKEDF'} />` como hermano de `<body>` (patrón oficial Next.js). ID usado: **G-5E27WGKEDF**.
- **Env**: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-5E27WGKEDF` agregado a `.env.local` (no trackeado) y a un **`.env.example` nuevo** (no existía). Como `.gitignore` ignoraba `.env*`, se agregó excepción `!.env.example` para trackear el template.
- **CSP**: ya permitía `googletagmanager.com` (script-src) + `google-analytics.com`/`*.analytics.google.com` (img/connect-src). NO se tocó. Confirmado en `next.config.ts:83-89`.
- **Fotocasa en footer** (`src/components/Footer.tsx`): el footer NO tenía ninguna red social. Se agregó una fila de redes en la columna de marca con LinkedIn, Instagram y Fotocasa. `lucide-react@1.8.0` ya NO exporta los íconos de marca `Linkedin`/`Instagram` (solo quedó `Building2`), así que LinkedIn e Instagram se renderizan con SVG inline (paths simple-icons) y Fotocasa con el ícono `Building2`. Todos con `target=_blank`, `rel=noopener noreferrer`, `aria-label`+`title`.
- **sameAs** (`src/components/seo/GlobalSchemaOrg.tsx`): pasó de `['linkedin']` a `[LinkedIn, Fotocasa, Instagram]`. NO se agregó Facebook (no hay URL en el sitio) ni Habitaclia.

**Trabajo hecho — A:**
- **Sitemap** (`src/lib/supabase/queries.ts` → `getAllPropertySlugs`): paginado con `.range(from, from+999)` en lotes de 1000 + `.order('slug')` hasta agotar; antes traía solo 1000 por el cap de Supabase. Mantiene los filtros visibles (`status in active/available`, `NOT hidden`, `NOT hidden_by_sync`, `slug NOT null`). Beneficio colateral: `generateStaticParams` de propiedades ahora genera todos los slugs, no 1000.
- **Canonical self por idioma** (`src/lib/utils/seoAlternates.ts`): `buildAlternates(path, locale='es')` ahora pone `canonical = locale==='en' ? /en+path : path` (antes siempre el ES). `languages` (hreflang) sigue apuntando a ambas versiones + `x-default` al ES. Call sites actualizados para pasar `locale`: home, propiedades (lista + [slug]), destinos (lista + [slug] + espana), contacto, mi-demanda. Blog `[slug]` tiene alternates propios (cada post existe en 1 solo idioma): se corrigió el canonical a self (EN → `/en/blog/slug`, ES → `/blog/slug`) y la URL `en:` del hreflang a la que le faltaba el prefijo `/en`.
- **robots** (`src/app/robots.ts`): `disallow` pasó de `'/admin/'` a `['/admin/', '/portal/']`.
- **hreflang propiedades**: ya viene cubierto — `propiedades/[slug]` usa `buildAlternates`, que devuelve `alternates.languages`.

**Verificación:** `npx tsc --noEmit` → 0 errores. ESLint en archivos tocados → limpio (los 2 errores `any` en `queries.ts:118,150` son PREEXISTENTES, fuera de mi cambio).

**Archivos tocados:**
- MODIFIED: `src/app/layout.tsx`, `src/components/Footer.tsx`, `src/components/seo/GlobalSchemaOrg.tsx`, `.gitignore`, `package.json`, `package-lock.json`, `src/lib/utils/seoAlternates.ts`, `src/lib/supabase/queries.ts`, `src/app/robots.ts`, y los `generateMetadata` de: `[locale]/(public)/page.tsx`, `propiedades/page.tsx`, `propiedades/[slug]/page.tsx`, `destinos/page.tsx`, `destinos/[slug]/page.tsx`, `destinos/espana/page.tsx`, `contacto/page.tsx`, `mi-demanda/page.tsx`, `blog/[slug]/page.tsx`.
- CREATED: `.env.example`.

**Commits:** `ff48cb6` — feat(seo/analytics): instalar GA4 + Fotocasa en footer y sameAs · `ca01059` — fix(seo): sitemap paginado completo + canonical self por idioma + Disallow /portal/ + hreflang en propiedades. Ambos pusheados a `main` (`3d40373..ca01059`).

**Avisos / cosas a revisar:**
- **GA4 sin consent-gating**: el resto del sitio gatea el Meta Pixel tras consentimiento de marketing (vanilla-cookieconsent); GA4 quedó SIEMPRE activo (decisión explícita del prompt). Si se requiere cumplimiento GDPR estricto, evaluar gatearlo igual que el Pixel.
- `scripts/importHistoricalLeads.ts` apareció untracked y NO se commiteó (no relacionado con SEO). Decidir si va al repo o al `.gitignore`.
- Verificar en prod: GA4 dispara `page_view` (Realtime de GA), el sitemap.xml lista ~2400 propiedades, y las páginas `/en/...` muestran su propio canonical.

**Próximo paso sugerido:** Validar GA4 en GA Realtime y el conteo del sitemap en prod. Retomar bloqueantes go-live (refactor pipeline de leads / páginas legales / DNS).

---

### 2026-06-16 — [LEADS-SEQ] Disparo manual del Email 1 + activación del cron diario

**Contexto:** El usuario pidió (1) disparar la secuencia en prod para que `dennis@ibizaliveradio.com` reciba el Email 1 (Claude ya había ajustado su `created_time` a 3 días atrás con `seq_email1_sent_at` NULL; consigna explícita de NO tocar la base) y (2) activar el cron diario descomentando el `schedule` del workflow. Sesión puramente operativa: sin cambios de lógica de aplicación.

**Trabajo hecho:**
- **Disparo manual del endpoint de prod** `GET https://assetsgolden.com/api/leads/sequence` con `Authorization: Bearer <META_LEADS_CRON_SECRET>` (leído de `.env.local`). Respuesta: `ok:true, scanned:18, sent:2, failed:0`. `sentByEmail.1 = 2`. Enviados: `dennis@ibizaliveradio.com` (Email 1) y `cherhardy@aol.com` (Email 1, lead de aol que se reintentó OK). Confirma que el endpoint y el secret están operativos en prod (HTTP 200).
- **Activación del cron**: descomentado el bloque `schedule` (`cron: '0 9 * * *'`, 09:00 UTC) en `.github/workflows/meta-leads-sequence.yml`. `workflow_dispatch` se mantiene intacto. El secret `${{ secrets.META_LEADS_CRON_SECRET }}` se referencia igual que en `meta-leads-sync.yml:17`.

**Archivos tocados:**
- MODIFIED: `.github/workflows/meta-leads-sequence.yml` (2 líneas: schedule descomentado), `DAILY_LOG.md` (esta entrada).
- DB: NO se tocó (el ajuste de `created_time` de dennis@ lo hizo Claude en una sesión previa).

**Commits:** `e5be41a` — Activar cron diario de la secuencia de nurture de leads (push a `main`, `101078b..e5be41a`).

**Avisos / cosas a revisar:**
- **`gh` CLI no está instalado** en la máquina → no se pudo verificar directamente que `META_LEADS_CRON_SECRET` exista en GitHub Actions secrets. Evidencia indirecta fuerte: el sync usa el mismo secret y corre cada hora en prod. Confirmar 100% en GitHub → Settings → Secrets and variables → Actions si hay dudas. Si la primera corrida automática del 2026-06-17 falla con HTTP 401/403, ese secret es el primer sospechoso.
- El **header comment** del workflow (líneas 3-7) sigue diciendo "NO ACTIVADO… comentado a propósito" → quedó desactualizado. No se tocó porque la consigna era solo descomentar el `schedule`. Limpiarlo en un commit aparte cuando convenga.
- Primera corrida automática: **2026-06-17 09:00 UTC**.

**Próximo paso sugerido:** Monitorear la primera corrida automática (2026-06-17 09:00 UTC) desde la pestaña Actions; verificar HTTP 200 y `sent`. Atacar el pendiente "Monitoreo del cron y alertas". Opcional: actualizar el header comment desactualizado del workflow.

---

### 2026-06-15 — [LEADS-SEQ-P03] Motor de la secuencia de nurture (infra + lógica + envío)

**Contexto:** Implementar el motor de la secuencia de nurture de 5 correos sobre `meta_leads`, a partir del spec `Downloads/LEADS-SEQ-contenido.md` (fuente de verdad del copy y la ramificación). Consigna: dejar el cron LISTO pero NO activarlo en prod; verificar los params reales de `/propiedades` antes de armar los links.

**Trabajo hecho:**
- **Migración** `20260615000000_add_seq_email4_5_to_meta_leads.sql`: agrega `seq_email4_sent_at` / `seq_email5_sent_at` (timestamptz, `ADD COLUMN IF NOT EXISTS`). **Aplicada a prod vía MCP** y verificada (las 5 columnas `seq_emailN_sent_at` + `seq_paused` presentes).
- **Helpers** (`src/lib/email/nurtureHelpers.ts`): `deriveSegment` (A hasta €1M / B €1M+), `formatBudgetRange` (frase EN), `formatPropertyType` (frase EN, "a new build home" para any/null), `buildFilteredLink`, `derivePurposeBlock` (investment/second_home/neutral para Email 2), `firstNameFrom`. **Robustos al formato real**: en `meta_leads`, `tipo_propiedad` y `purpose` se guardan MAPEADOS a español (el parser aplica los MAP), no crudos; los helpers aceptan ambos. `presupuesto_raw` sí está crudo.
- **Params reales de `/propiedades`** (verificados en `src/app/[locale]/(public)/propiedades/page.tsx` + `queries.ts`): `pais`, `zona`, `precio_min`, `precio_max`, `tipo`. ⚠️ `queries.ts:56` solo aplica `zona` si `pais` incluye "espa" → siempre se incluye `pais=España&zona=costa-del-sol`. SÍ existe filtro por precio. `tipo` usa el valor EN (`apartment|villa|penthouse|townhouse`); si es any/null no se agrega.
- **Plantillas** (`src/lib/email/sequenceTemplates.ts`): una función por correo → `{subject, html, text}`, copy exacto del spec. HTML email-safe (tablas + CSS inline, shell 600px, botón CTA bulletproof, SIN imágenes) + texto plano. Email 1 ramifica A/B; Email 2 = común + 3 stats HTML/CSS + bloque por purpose; Emails 3/4/5 comunes.
- **Endpoint cron** `GET /api/leads/sequence` (`src/app/api/leads/sequence/route.ts`): protegido con `META_LEADS_CRON_SECRET` (mismo patrón que el sync). Lee `meta_leads` con `seq_paused=false`, `dias=floor(now-created_time)`, umbrales E1≥3/E2≥8/E3≥15/E4≥22/E5≥60, envía SOLO el próximo pendiente (1 por lead/corrida), marca `seq_emailN_sent_at=now()` tras OK por Resend, idempotente. Reusa infra Resend vía `sendSequenceEmail.ts`.
- **Workflow** `.github/workflows/meta-leads-sequence.yml`: diario `0 9 * * *` pero con el `schedule` COMENTADO (NO activado). `workflow_dispatch` activo para test manual.
- `npx tsc --noEmit` → 0 errores.

**Archivos tocados:**
- CREATED: `supabase/migrations/20260615000000_add_seq_email4_5_to_meta_leads.sql`, `src/lib/email/nurtureHelpers.ts`, `src/lib/email/sequenceTemplates.ts`, `src/lib/email/sendSequenceEmail.ts`, `src/app/api/leads/sequence/route.ts`, `.github/workflows/meta-leads-sequence.yml`
- DB (vía MCP): columnas `seq_email4/5_sent_at` en `meta_leads`.
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** `a7a8abd` — feat(leads): motor de secuencia de nurture (helpers + plantillas + cron) (push a `main`, `73a0204..a7a8abd`).

**Avisos / cosas a revisar antes de activar:**
- `META_LEADS_CRON_SECRET` sigue sin cargar en Vercel (pendiente operativo): sin ella, `isAuthorized` devuelve `true` y el endpoint queda ABIERTO (igual fallback que `sync-meta`). Cargarla antes de activar.
- El cron NO está activado (schedule comentado). El push deja el endpoint accesible pero nada lo dispara solo.
- Fallback de `formatBudgetRange` para presupuesto desconocido = "your" (lee "in the your range"); solo aplica si el lead no tiene presupuesto (campo requerido en el form).

**Próximo paso sugerido:** Test manual del endpoint vía `workflow_dispatch` (o `GET /api/leads/sequence` con `Authorization: Bearer …`) contra un lead de prueba, validar render de los 5 correos en cliente real, y recién entonces cargar `META_LEADS_CRON_SECRET` en Vercel + descomentar el `schedule` del workflow. Considerar también monitoreo/alertas del nuevo cron.

---

### 2026-06-13 — [LEADS-SEQ-P01/P02] Relevamiento parser Meta + persistir leads en tabla `meta_leads`

**Contexto:** Base para una secuencia de nurture ramificada por presupuesto para leads de Meta. P01 fue relevamiento de solo lectura del parser; P02 persiste cada lead nuevo de Meta en una tabla nueva con sus campos parseados, ADICIONAL al Sheet + `meta_leads_synced` + welcome email (sin tocar dedup ni el append al Sheet).

**P01 — Relevamiento (solo lectura, sin cambios):**
- `leadParser.ts` extrae del `field_data`: nombre (`full_name`/`first_name`+`last_name`/`name`), `email`, `phone_number`/`phone`, tipo de propiedad, presupuesto, timeline, purpose. Derivados: `meta_lead_id` (raw.id), `fecha` (created_time formateado), `variante` (regex sobre `ad_name`).
- **Presupuesto:** existe, `BUDGET_MAP` con 6 rangos en EUR (`under_300k_eur`…`above_2m_eur`). ⚠️ Solapamiento detectado entre `2m_5m_eur` ("2M-5M") y `above_2m_eur` ("Más de 2M") — revisar con el form real antes de ramificar.
- **Zona/ubicación:** NO se captura en el form ni en el parser. Si la secuencia la necesita, hay que agregar la pregunta en Meta + campo nuevo.
- Mapeo al Sheet `'Hoja 1'!A:K` (11 cols): Fecha, Nombre, Email, Teléfono, Tipo, Presupuesto, Timeline, Purpose, Variante, Prioridad, Estado (Prioridad/Estado se calculan en la ruta con `categorizeLead`/`getSpecialStateNotes`).
- Confirmado: los leads de Meta **nunca** se insertan en la tabla `leads` (eso es exclusivo del form web `/api/leads`). Meta → Sheet + `meta_leads_synced` (tracking) + welcome email.

**P02 — Persistencia (cambios):**
- **Tabla `meta_leads`** (migración `20260613000000_create_meta_leads.sql`, aplicada a prod vía MCP): `id` uuid PK, `meta_lead_id` text unique not null, email/nombre/telefono, tipo_propiedad, `presupuesto_raw` (crudo, ej `1m_2m_eur`) + `presupuesto` (etiqueta), timeline, purpose, variante, created_time, synced_at default now(), `seq_email1/2/3_sent_at`, `seq_paused` bool default false. RLS habilitado SIN policy (solo service_role, igual que `meta_leads_synced`). Índices en `created_time` (DESC) y `email`.
- `leadParser.ts`: `ParsedMetaLead` ahora expone `created_time` (ISO crudo de Meta) y `presupuesto_raw` (antes del `BUDGET_MAP`). El Sheet sigue usando `presupuesto` mapeado — sin cambio de comportamiento.
- `syncTracker.ts`: nueva `upsertMetaLead(parsed)` → upsert a `meta_leads` con `onConflict: 'meta_lead_id'` (idempotente); captura su error y NO lanza (no rompe Sheet/dedup si falla).
- `sync-meta/route.ts` y `sync-meta/manual/route.ts`: import + `await upsertMetaLead(parsed)` dentro del loop de leads nuevos, justo después de `appendLeadToMetaSheet`. Solo leads NUEVOS (los que pasan la dedup) — sin backfill de históricos.
- NO se calcula el segmento A/B acá (se derivará en el cron). `npx tsc --noEmit` → 0 errores.

**Archivos tocados:**
- CREATED: `supabase/migrations/20260613000000_create_meta_leads.sql`
- MODIFIED: `src/lib/meta/leadParser.ts`, `src/lib/meta/syncTracker.ts`, `src/app/api/leads/sync-meta/route.ts`, `src/app/api/leads/sync-meta/manual/route.ts`
- MODIFIED: `DAILY_LOG.md` (esta entrada)
- DB (vía MCP): tabla `meta_leads` creada con RLS + índices en prod.

**Commits:** `d8a2edb` — feat(leads): persistir leads Meta en tabla meta_leads para secuencia nurture (push a `main` OK, `04a2233..d8a2edb`).

**Próximo paso sugerido:** Armar el cron de la secuencia de nurture: derivar el segmento A/B por `presupuesto_raw`, redactar las 3 plantillas de email, y la lógica de envío escalonado con `seq_email1/2/3_sent_at` + respeto de `seq_paused`. Revisar antes el solapamiento de rangos `2m_5m_eur`/`above_2m_eur` contra el form real de Meta.

---

### 2026-06-13 — FASE-5-P10/P11: Sync REAL (slug-match + fallback) + seguridad Supabase + cierre

**Contexto:** Ejecutar el sync REAL diferido de P9 (con match por slug + fallback fila-por-fila) y aplicar las remediaciones de seguridad pendientes en Supabase. Cierre de sesión + identificación de scripts de carga puntual que se colaron al repo en P8.

**Sync REAL (P10) — resultado:**
- Total de propiedades **2207 → 2500** (**+293 nuevas reales** insertadas con el fallback fila-por-fila).
- **3 resincronizadas por slug** (`matched_by_slug`): external_id reasignado por HabiHub, resueltas como UPDATE (no como duplicado).
- **36 ocultadas** (`hidden_by_sync=true`, fuera del feed actual).
- **4 colisiones** = duplicados del propio feed (doble-referencia id sincronizado + stale). Aisladas y logueadas en `sync_logs.details.insert_errors`; no se perdió data ni se crearon duplicados. Confirma la proyección del dry-run de P9 (293 entran, 4 fallan).

**Seguridad Supabase:**
- **RLS activado** en `meta_leads_synced` y `meta_sync_runs` (estaban sin RLS; solo se acceden vía service role desde el backend).
- **5 tablas backup dropeadas.** Se **mantiene** `properties_backup_20260429` (sigue en cuarentena hasta 1-2 crons sin issues).
- **`search_path=public` fijado** en 6 funciones (mitiga el advisor de `function_search_path_mutable`).

**Scripts de carga puntual a sacar del repo (P11 — identificados, NO removidos aún):**
- En el commit de P8 (`4980425`) se colaron **19 scripts** `.py`/`.ts` de carga one-off de Bali/Samaná, ninguno importado por `src/` ni parte del producto. Lista confirmada (ver detalle en el chat). Próximo paso: `git rm --cached` + entrada en `.gitignore`. Los scripts de producto/seed (`import-*.ts`, `seed-blog-posts.ts`, `uploadMetaLeadsToSheet.ts`, `optimize-hero.mjs`, etc.) se mantienen.

**Archivos tocados:**
- MODIFIED: `DAILY_LOG.md` (esta entrada)
- DB (vía MCP, sin migración de código): RLS en 2 tablas, DROP de 5 backups, `search_path` en 6 funciones.

**Commits:** `chore: cierre DAILY_LOG sesion sync P10 + seguridad supabase` (solo DAILY_LOG, push).

**Próximo paso sugerido:** Sacar los 19 scripts del repo con `git rm --cached` + `.gitignore` (confirmar lista primero). Evaluar si los 4 duplicados del feed ameritan ignore permanente. Continuar con refactor pipeline de leads (depende de acceso Resend de Atilio).

---

### 2026-06-11 — FASE-5-P9: Match por slug (resync external_id reasignado) + fallback fila-por-fila en INSERT

**Contexto:** Tras P8 quedó visible que las "nuevas" del feed fallaban por `properties_slug_key`. Hipótesis de entrada: ~298 colisiones por external_ids reasignados por HabiHub. Objetivo: agregar un nivel de match por slug antes de tratar una fila como nueva, + fallback fila-por-fila en el INSERT.

**Trabajo hecho (`src/app/api/admin/sync-habihub/route.ts`):**
- **Nivel 3 de match (slug):** orden ahora es 1º external_id, 2º huella, 3º (nuevo) slug, y recién lo que sobra va al INSERT. Se genera `candidateSlug = slugify(title)-external_id` (mismo helper que el INSERT) y se busca en un nuevo mapa `bySlug`. Si existe y la fila no fue ya procesada → es la misma con external_id reasignado: UPDATE resincronizando `external_id` + price/gallery/descripción/province/dev_id/unit + `hidden_by_sync=false` + `last_synced_at`, se agrega a `processedIds` (la Fase 4 no la oculta) y se cuenta en `matched_by_slug`. NO se toca el slug existente.
- `slug` agregado al SELECT de candidatos y a la interfaz `ExistingProp`. Nuevo array `toUpdateBySlug` aplicado en Fase 5 en lotes de 50. `matched_by_slug` sumado a `stats`, a `updated_count` y a `sync_logs`.
- **Fallback fila-por-fila en el INSERT:** los lotes de 50 de P8 ahora, si fallan (INSERT atómico → rollback total), reintentan fila por fila para aislar la/s mala/s y NO perder las buenas. Cada fila que aún falle se loguea en `sync_logs.details.insert_errors` con su `slug`.
- Diagnósticos nuevos: `to_update_by_slug_size`, `insert_slug_already_exists`, `insert_slug_collision_sample`. `code_version='v7-slugmatch'`.

**DB:** `ALTER TABLE sync_logs ADD COLUMN IF NOT EXISTS matched_by_slug integer NOT NULL DEFAULT 0` (aplicado a prod vía MCP + migración `supabase/migrations/20260611000000_add_matched_by_slug_to_sync_logs.sql`). **Importante:** sin esta columna el UPDATE de `sync_logs` (`...stats`) fallaba entero y NO guardaba details/diagnostics — por eso los primeros dry-runs de P9 dejaban `diagnostics=null`.

**Resultado DRY-RUN (sin escribir, logId `f8850f48`):**
- matched_by_external_id = 2075 · matched_by_fingerprint = 67 · **matched_by_slug = 3** · **nuevas reales = 297** · a ocultar = 36 · errors = 0.
- **La premisa era incorrecta:** NO había ~298 colisiones. `insert_slug_already_exists = 4` → de las 297 "nuevas", solo **4** tienen slug ya existente; las otras **~293 son genuinamente nuevas**. En P8 las ~7 filas que sí colisionan (3 resync + 4 doble-referencia) envenenaban los 6 lotes atómicos → 0 entraban. Con el fallback fila-por-fila, en el REAL deberían entrar ~293 y fallar+loguearse solo 4.
- Los 4 que aún colisionan (`villa-en-ciudad-quesada-31960`, `atico-en-los-alcazares-31025`, `villa-en-san-juan-de-los-terreros-34968`, `atico-en-estepona-25745`) son filas cuyo slug-destino YA fue reclamado por otro match por id (el feed trae el id sincronizado *y* uno stale). Quedan logueadas para revisión humana; no se pierden datos.

**Archivos tocados:**
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`
- CREATED: `supabase/migrations/20260611000000_add_matched_by_slug_to_sync_logs.sql`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** `feat(sync): match por slug para resincronizar external_id reasignado + fallback fila-por-fila en INSERT` (solo `route.ts` por el comando indicado; migración + DAILY_LOG quedaron sin commitear — ver nota).

**Próximo paso sugerido:** correr el sync REAL (lo pidió diferido el usuario): debería sumar ~293 propiedades nuevas + resync de 3 + ocultar 36, con 4 filas logueadas en `insert_errors`. Verificar el total de propiedades visibles sube. Luego decidir si los 4 doble-referenciados son duplicados del feed (ignorar) o ameritan slug con sufijo único.

---

### 2026-06-11 — FASE-5-P8: INSERT de nuevas del sync en lotes + contador real + log del error de Supabase

**Contexto:** El sync real corría bien (ocultado/match OK), pero el INSERT de las nuevas fallaba ENTERO y mentía: reportaba `inserted_new=298, errors=1` cuando NINGUNA entraba (0 verificadas en la DB). Causa: INSERT en un único batch atómico (una fila inválida tira las 298), `inserted_new` se incrementaba en el loop de matching sin verificar éxito, y el error real de Supabase no se logueaba.

**Trabajo hecho (`src/app/api/admin/sync-habihub/route.ts`):**
- INSERT partido en **lotes de 50** con `try/catch` por lote. Cada lote usa `.insert(batch).select('id')`; si falla, se captura `error.message | error.details | error.hint`, se loguea con `console.error` y se guarda en `sync_logs.details.insert_errors`. Un lote fallido NO aborta los demás.
- **Contadores reales:** quitado el `stats.inserted_new++` del loop de matching. Ahora `inserted_new` suma solo las filas que Supabase confirma (`insertedRows.length`); `errors` suma las filas que fallan de verdad (incluye el caso confirmadas < enviadas). En dry-run, `inserted_new` se setea a `toInsert.length` como proyección.
- Nuevo array `insertErrors[]` persistido en `sync_logs.details.insert_errors`.
- Comentario de la Fase 4 corregido: aclara que los candidatos viejos NO se borran, se OCULTAN (`hidden_by_sync=true`). Confirmado: 0 llamadas `.delete()` en el archivo (solo un comentario).

**Resolución de conflictos `insert_new_drop_old`:** cuando una huella matchea >1 candidato (29 conflictos), se loguea el conflict y la fila del feed cae al INSERT (fuente de verdad). Los candidatos viejos NO se borran: quedan fuera de `processedIds` y la Fase 4 los oculta si están en scope. El nombre "drop_old" es histórico (de cuando había DELETE físico); hoy es "ocultar_viejo".

**Resultado del sync REAL (logId `496ed068`):** insertadas REALES = **0**, errors = **300**, ocultadas = 36. Todos los lotes fallan por el MISMO error (antes invisible):
`duplicate key value violates unique constraint "properties_slug_key"` — ej. `Key (slug)=(villa-en-ciudad-quesada-31960) already exists`.

**Causa raíz descubierta (→ P9, NO arreglada acá):** el slug se arma `slugify(title)-external_id`, pero las ~300 filas existentes tienen un slug cuyo sufijo numérico NO coincide con su `external_id` actual (ej. slug `...-31960` pero `external_id=31959`). HabiHub les reasignó el `external_id`, así que no matchean ni por id ni por huella y caen al INSERT como "nuevas", colisionando con el slug ya usado. **OJO:** forzar el INSERT (slug con sufijo random) crearía ~300 DUPLICADOS — lo correcto en P9 es matchearlas como UPDATE, decisión que toca match/scope (fuera de scope de P8). Nota: como cada lote de 50 sigue siendo atómico, un slug-dup tira las 50; algunas de las 300 podrían ser genuinamente nuevas pero arrastradas por el lote. Salvarlas requeriría fallback fila-por-fila (evaluar en P9).

**Archivos tocados:**
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** `fix(sync): INSERT de nuevas en lotes con manejo de error + contador real + log del error de Supabase`

**Próximo paso sugerido (P9):** resolver el slug-collision matcheando esas ~300 filas re-IDeadas como UPDATE en vez de INSERT (ej. matchear por slug o por `habihub_dev_id+unit` cuando external_id no matchea), en vez de tratarlas como nuevas. Decidir con Atilio si son la misma propiedad re-IDeada (UPDATE) o realmente nuevas (slug con sufijo único).

---

### 2026-06-10 — Email de bienvenida (Resend) + sync leads horario + copy final

**Contexto:** Continuación del refactor del pipeline de leads. Se concreta el envío de email de primer contacto vía Resend al recibir un lead nuevo, y se cierra el copy definitivo del email con links a las zonas costeras.

**Trabajo hecho:**
- **Sync Meta Leads → GitHub Actions horario:** migrado el disparo del sync de cron Vercel diario a GitHub Actions cada hora (`0 * * * *`), eliminando el cron Vercel duplicado (commits `c0ffe04`, `6aa7a15`).
- **Resend operativo:** dominio `assetsgolden.com` verificado en la cuenta Resend, `RESEND_API_KEY` cargada en Vercel. `sendWelcomeEmail.ts` implementado e invocado desde ambos routes de ingreso de leads (commit `0797ba8`).
- **Copy final del email de bienvenida** (`src/lib/email/sendWelcomeEmail.ts`): nuevo subject ("Your Costa del Sol new-build selection") y body con links a 3 zonas costeras (Costa del Sol, Costa de la Luz, Costa de Almería). Multipart `html` (con `&amp;` escapado en href) + `text` plano. `from`, `replyTo`, lógica de envío y manejo de errores sin cambios. `{NOMBRE}` = primer nombre del lead o "there" (commit `68918af`).
- **Higiene de repo:** `scripts/output/` agregado a `.gitignore` (contenía ~4 GB de fotos de carga que `git add -A` casi mete al repo). Commit `68918af` se rehízo para incluir solo el archivo del email.

**Archivos tocados:**
- MODIFIED: `src/lib/email/sendWelcomeEmail.ts` (copy final)
- MODIFIED: `.gitignore` (+`scripts/output/`)
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** `68918af` — feat: copy final email bienvenida con links a zonas costeras · (esta entrada) — chore: gitignore scripts/output + cierre daily log

**PENDIENTE de activar el flujo de email:**
1. Test end-to-end del envío real (lead nuevo → email recibido).
2. Avisar a Atilio que el primer contacto automático está activo.
3. Re-habilitar el workflow de GitHub Actions del sync de leads.

**Próximo paso sugerido:** Ejecutar el test del email de bienvenida y, si pasa, re-habilitar el workflow de GitHub Actions y avisar a Atilio.

---

### 2026-06-09 — FASE-5-P7: Tabla /admin/propiedades sin scroll horizontal

**Contexto:** La tabla tenía demasiadas columnas y generaba scroll horizontal en pantallas ~1280px. Sidebar w-64=256px + padding p-6×2=48px → espacio disponible ~976px.

**Trabajo hecho:**
- `PropiedadesTable.tsx`: tabla convertida a `table-fixed`; anchos fijos por columna (total ~943px): checkbox 32, img 50, título 145, ref 76, habihub 92, país/ciudad 108, precio 96, tipo 76, destacada 58, visible 68, vendida 76, acciones 66.
- Padding reducido de `px-4 py-3` → `px-2 py-2` en todas las celdas.
- Columna Título: `truncate text-xs` + `title={prop.title}` (tooltip al hover). Badges de estado compactados a abreviaturas (VEND./OCU./VIS./★).
- Columna País/Ciudad: `truncate` + `title` con texto completo.
- Columna Cód. HabiHub: `truncate` + `title` en el span.
- Columna Tipo: badge con `truncate block`.
- Columna Acciones: reemplazado "✏️ Editar" por ícono `<Pencil size={14}>` (importado de lucide-react). ExternalLink reducido a size={14}.
- Imagen miniatura: `w-10 h-10` → `w-9 h-9`.
- Header columna "Destacada" simplificado a "★".
- `SoldToggleButton.tsx`: etiqueta "Marcar vendida" → "Vender" (presentación, no lógica).

**Archivos tocados:**
- MODIFIED: `src/components/admin/PropiedadesTable.tsx`
- MODIFIED: `src/components/admin/SoldToggleButton.tsx`

**Commits:** `37db841` — fix(admin): tabla de propiedades sin scroll horizontal (anchos + truncado)

**Próximo paso sugerido:** Verificar en pantalla real 1280px que no reaparezca el scroll. Si "Marcar vendida" era confuso al pasarle el hover, el `title` del botón sigue diciendo "Marcar como vendida".

---

### 2026-06-09 — FASE-5-P5: Salvaguarda sync HabiHub (hidden_by_sync + scope numérico)

**Contexto:** El sync hacía DELETE físico de filas. Riesgo de borrar propiedades que no vienen del feed (manual, prestige-bali, my-dream-samana, scraper-lovable). Columna `hidden_by_sync` ya existía en prod.

**Trabajo hecho:**
- `sync-habihub/route.ts`: el loading query ahora filtra `external_source='habihub'` (quitado `country='España'`). Fingerprint matching restringido a `external_source='habihub'`. UPDATE por external_id incluye `hidden_by_sync=false` (reactivación automática). Fase 4 reemplaza `.delete()` por `.update({ hidden_by_sync: true })`. Nuevo scope: `external_source='habihub' AND external_id numérico (/^\d+$/) AND featured!=true`. Salvaguarda 80% mantenida. version_code='v6-hide'. Dry-run sigue funcionando sin escribir.
- `types/index.ts`: agregado `hidden_by_sync: boolean | null` al tipo `Property`.
- `lib/supabase/queries.ts`: 10 funciones públicas (getProperties, getPropertiesForSpain, getPropertyTypesForSpain, getPropertiesForDestination, getCitiesForDestination, getPropertyTypesForDestination, getFeaturedProperties, getAllPropertySlugs, getPropertiesByCountry, getPropertyCountsByCountry) — todas con `.not('hidden_by_sync', 'eq', true)`.
- `lib/blogProperties.ts`: getRelatedProperties y getBannerProperty — mismo filtro.
- `api/portal/search-properties/route.ts`: 4 queries (ref_code exacto, número solo, UUID, búsqueda normal).
- `api/portal/filters-metadata/route.ts`: query de tipos.
- `supabase/migrations/20260609000000_add_hidden_by_sync.sql`: migración idempotente (ADD COLUMN IF NOT EXISTS).

**Archivos tocados (7):**
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`
- MODIFIED: `src/types/index.ts`
- MODIFIED: `src/lib/supabase/queries.ts`
- MODIFIED: `src/lib/blogProperties.ts`
- MODIFIED: `src/app/api/portal/search-properties/route.ts`
- MODIFIED: `src/app/api/portal/filters-metadata/route.ts`
- CREATED: `supabase/migrations/20260609000000_add_hidden_by_sync.sql`

**Commits:** `e8bc986` — fix(sync): ocultar en vez de borrar (hidden_by_sync) + scope por external_id del feed + no secuestrar fuentes manuales

**Próximo paso sugerido:** Refactor pipeline de leads (eliminar n8n, consolidar en processLead, agregar Resend) — depende de acceso Resend de Atilio.

---

### 2026-06-09 — [LEADS-CRON-P02] Sync de leads cada hora + eliminar cron Vercel duplicado

**Contexto:** El cron diario `0 0 * * *` corría el sync 1 vez al día (~4 AM local), lo que dejaba los leads del día esperando hasta la madrugada siguiente. Se sube frecuencia a cada hora y se elimina el cron duplicado de Vercel que disparaba el mismo endpoint en paralelo.

**Trabajo hecho:**
- `.github/workflows/meta-leads-sync.yml`: cron `0 0 * * *` → `0 * * * *` (cada hora en punto, UTC). `workflow_dispatch`, job, auth header y secret intactos.
- `vercel.json`: eliminada la entrada `crons[0]` (path `/api/leads/sync-meta`, schedule `0 0 * * *`). El array queda vacío `"crons": []`. Framework, buildCommand, regions y demás campos intactos.
- PASO 3 — Otros disparadores hallados: ninguno adicional. `scripts/diagnoseMetaToken.ts` es script diagnóstico one-shot (no scheduler). `src/app/api/leads/sync-meta/manual/route.ts` es endpoint POST manual (no scheduler). El único scheduler activo ahora es el GitHub Actions workflow.

**Archivos tocados:**
- MODIFIED: `.github/workflows/meta-leads-sync.yml`
- MODIFIED: `vercel.json`

**Commits:** `6aa7a15` — chore: sync de leads cada hora + remover cron Vercel duplicado

**Próximo paso sugerido:** Cuando Atilio dé acceso a Resend, implementar envío de email al recibir lead nuevo (siguiente prompt pendiente). Verificar en GitHub Actions que el primer run de la hora ejecuta sin errores.

---

### 2026-06-09 — FASE-5-P4: Editor de destinos bilingüe + aviso editorial hardcodeado

**Contexto:** El editor de destinos (commit 6b44f15) solo editaba description, hero_image_url y card_image_url. Las páginas de destino usan también description_en, tagline y tagline_en. Además, 11 destinos tienen un bloque editorial extenso en el código que no debe editarse desde el panel.

**Trabajo hecho:**
- `GET /api/admin/get-destination/[slug]`: ampliado el SELECT para devolver también `description_en`, `tagline` y `tagline_en`.
- `POST /api/admin/update-destination`: acepta y guarda los 3 campos nuevos (`description_en`, `tagline`, `tagline_en`). Audit log actualizado con los 6 campos.
- `/admin/destinos/[slug]/edit`: formulario ampliado con sección "Subtítulo del hero" (2 inputs cortos: ES + EN) y sección "Descripción" con dos textareas (Español + Inglés). Banner informativo azul (icono Info) para los 11 slugs con editorial hardcodeada: mexico, indonesia, emiratos-arabes-unidos, argentina, estados-unidos, costa-rica, reino-unido, ecuador, grecia, paraguay, espana. Para los demás destinos no aparece ningún aviso.

**Archivos tocados:**
- MODIFIED: `src/app/admin/destinos/[slug]/edit/page.tsx`
- MODIFIED: `src/app/api/admin/update-destination/route.ts`
- MODIFIED: `src/app/api/admin/get-destination/[slug]/route.ts`

**Commits:** `e889632` — feat(admin): editor de destinos bilingue (desc/tagline ES+EN) + aviso editorial hardcodeado

**Próximo paso sugerido:** Refactor pipeline de leads (eliminar n8n, consolidar en processLead, agregar Resend) — depende de acceso Resend de Atilio.

---

### 2026-06-09 — FASE-5-P3: UI de edición de destinos en el admin

**Contexto:** Atilio no podía editar descripción ni imágenes de los destinos (ej: República Dominicana/Samaná). La vista /admin/destinos fue eliminada en su momento.

**Trabajo hecho:**
- `/admin/destinos`: listado de todos los destinos de `country_destinations` con miniatura de `card_image_url`, nombre, slug, estado activo/inactivo y botón Editar. Protegido con `requireAdmin()` (SSR).
- `/admin/destinos/[slug]/edit`: formulario client-side con textarea de descripción (multilínea, preserva párrafos), uploader de imagen hero (panorámica) y uploader de imagen card (miniatura). Preview de imagen actual + botón "Quitar imagen". Sube al bucket `destination-images` vía el endpoint `/api/admin/upload-image` existente.
- `GET /api/admin/get-destination/[slug]`: devuelve los campos editables del destino para pre-popular el form. Protegido con `requireAdmin()`.
- `POST /api/admin/update-destination`: actualiza SOLO `description`, `hero_image_url`, `card_image_url` en `country_destinations` por slug. No toca `country_name`, `slug` ni `active`. Con rate limit, audit log.
- Sidebar del admin: agregado link "Destinos" con ícono MapPin, entre Agentes y Sincronización.

**Archivos creados/tocados:**
- CREATED: `src/app/admin/destinos/page.tsx`
- CREATED: `src/app/admin/destinos/[slug]/edit/page.tsx`
- CREATED: `src/app/api/admin/get-destination/[slug]/route.ts`
- CREATED: `src/app/api/admin/update-destination/route.ts`
- MODIFIED: `src/components/admin/AdminSidebar.tsx`

**Commits:** `6b44f15` — feat(admin): UI de edicion de destinos (descripcion + hero/card image)

**Próximo paso sugerido:** Continuar con FASE-5 siguiente tarea.

---

### 2026-06-08 — FASE-5-P2: Descripción de destino reubicada al pie

**Contexto:** Las páginas de destino mostraban el texto largo primero, empujando las propiedades hacia abajo. Patrón deseado: fichas arriba, texto SEO al fondo (como portales inmobiliarios).

**Trabajo hecho:**
- **Genérica** (`/destinos/[slug]`): Split de `description` por `\n\n`. El primer párrafo permanece como intro corta inmediatamente tras el hero/market stats. El grid de propiedades + filtros sube a continuación. Highlights, Market info, Editorial content y los párrafos restantes quedan al pie. Todo renderizado SSR, sin `display:none`.
- **España** (`/destinos/espana`): El bloque editorial completo (es + en, ~150 líneas de JSX) se movió completo al pie. El grid de propiedades + filtros por zona queda inmediatamente tras el hero. Los filtros por zona no fueron tocados.

**Archivos tocados:**
- MODIFIED: `src/app/[locale]/(public)/destinos/[slug]/page.tsx`
- MODIFIED: `src/app/[locale]/(public)/destinos/espana/page.tsx`

**Commits:** `7d047a2` — feat: reubicar descripcion de destino al pie (propiedades primero)

**Próximo paso sugerido:** Continuar con FASE-5 siguiente tarea.

---

### 2026-06-08 — FASE-5-P1: Código HabiHub en admin de propiedades

**Contexto:** Atilio necesitaba ver el `external_id` (código numérico HabiHub, ej: "18909") en el panel admin para poder localizar propiedades en el portal de HabiHub.

**Trabajo hecho:**
- Edit form (`/admin/propiedades/[id]/edit`): el bloque de identificadores de solo lectura ahora muestra "Código HabiHub" solo cuando `external_source='habihub'`. Si `external_id` es numérico → muestra el código en azul. Si es UUID/null → "No disponible". Para otras fuentes (prestige-bali, my-dream-samana, etc.) → el campo no aparece.
- Tabla listado (`/admin/propiedades`): el `external_id` numérico aparece como texto secundario azul debajo del ref_code (AG-XXXXX), solo para propiedades habihub. No agrega columna extra — usa la celda existente.
- Query listado: se añadió `external_source` al SELECT de Supabase para habilitar el filtro de presentación.

**Archivos tocados:**
- MODIFIED: `src/app/admin/propiedades/[id]/edit/page.tsx`
- MODIFIED: `src/app/admin/propiedades/page.tsx`
- MODIFIED: `src/components/admin/PropiedadesTable.tsx`

**Commits:** `c461dea` — feat: mostrar codigo HabiHub (external_id) en admin de propiedades

**Próximo paso sugerido:** Continuar con FASE-5 siguiente tarea, o verificar en producción que el código aparece correctamente en propiedades habihub existentes.

---

### 2026-06-08 — Cierre carga Bali + Samaná

**Contexto:** Cierre de la fase de carga masiva de propiedades Bali (partner Prestige) y alta de Samaná (país nuevo).

**Cargas completadas y verificadas en producción:**
- Bali (Indonesia), partner Prestige: 27 propiedades nuevas en total (`external_source='prestige-bali'`), ref_codes AG-04519 a AG-04543 (primera tanda) + AG-04575/04576/04577 (últimas 3).
  - Últimas 4 cargadas desde ZIPs del Drive: PV261 (AG-04575, Uluwatu, 30 fotos), PV163 (AG-04576, Ungasan, 38 fotos), PD199 (AG-04577, Berawa, 14 fotos), PV656 (AG-04543, Canggu — UPDATE de galería de 5 a 36 fotos).
  - Indonesia ahora: 35 propiedades visibles (8 originales + 27 Bali).
- Samaná (República Dominicana, país nuevo): My Dream Samaná, AG-04542, `external_source='my-dream-samana'`. País agregado a `translateGeography.ts` (COUNTRY_MAP + COUNTRY_ISO='DO', commit b83f6b4). Destino creado en `country_destinations` (slug `republica-dominicana`).

**Aprendizajes nuevos:**
- Las carpetas de Drive con acceso restringido por archivo no se pueden bajar automáticamente; Ivan las baja a mano como ZIP (Google las exporta así). Los ZIPs vienen etiquetados con el external_id en el nombre, lo que permite mapear cada uno a su propiedad sin ambigüedad.
- El script de carga NO convierte HEIC ni comprime por defecto. Para cargas con fotos del Drive hay que: convertir HEIC/HEIF a JPG (pillow-heif + exif_transpose, q90) y comprimir las pesadas a max 2000px / q85 ANTES de subir, o no renderizan en navegador (caso PV924) o pesan de más (caso Samaná, foto de 27MB).
- PD199 quedó con 14 fotos (el portal listaba ~29); el ZIP solo traía esas. No bloqueante.

**Pendiente:**
- Completar fotos de PD199 si se quiere (pedir a Prestige).
- Próxima cola de carga: Cervera/Miami (EEUU, portal cerverabrokerportal.com).

**Archivos tocados:** `scripts/load_bali_pendientes.py` (CREATED), `scripts/diag_downloads_fotos.py` (CREATED), `scripts/output/bali-carga-log.json` (MODIFIED), `scripts/output/bali-fotos-pendientes/` (CREATED)

---

### 2026-06-04 — [FASE-2-CRON-FIX] Diagnóstico y fix cron sync Meta Leads

**Contexto:** El cron diario `0 0 * * *` no se disparó a las 00:00 UTC del 4-jun. Verificado por ausencia de registro en `meta_sync_runs` entre 2026-06-03T19:41 y 2026-06-04T08:12, y ausencia en Vercel runtime logs (query "sync-meta", últimas 14h).

**Diagnóstico — todo correcto, nada que cambiar en código:**
- `vercel.json` ✅ — sección `crons` existe, path `/api/leads/sync-meta` (sin `/manual`), schedule `"0 0 * * *"`
- Endpoint `route.ts` ✅ — método GET, auth lee `META_LEADS_CRON_SECRET`, si no está definida permite todo (fallback seguro)
- Plan Hobby ✅ — proyecto tiene exactamente 1 cron (límite: 2), frecuencia diaria (límite mínimo Hobby respetado)
- Auth mismatch ✅ descartado — no hay runtime log en absoluto para las 00:00 UTC → el request nunca llegó al endpoint. Si hubiera llegado con 401, aparecería la entrada de log.

**Causa raíz:** El cron no se disparó. Hipótesis más probable: des-registro del cron en el scheduler de Vercel tras actividad de deploy intensa el 3-jun (deploys en ráfaga en ~77 minutos: dpl_HDggTvTa4 → dpl_7Yk8VQyB). Vercel re-registra los crons en cada deploy pero puede perder el schedule en condiciones de alta frecuencia.

**Fix aplicado:** Commit trivial (esta entrada de DAILY_LOG) para forzar redeploy limpio y re-registrar el cron en el scheduler de Vercel.

**Archivos tocados:**
- MODIFIED: `DAILY_LOG.md`

**Commits:** (ver hash abajo)

**Verificación mañana:** Revisar `meta_sync_runs` en Supabase a las 00:01 UTC del 2026-06-05 — debe aparecer fila con `status='ok'` y `created_at` ≈ `2026-06-05 00:00:xx UTC`. También: Vercel Dashboard → proyecto `assets-golden-next` → Settings → Cron Jobs → confirmar que aparece `/api/leads/sync-meta` con "Next run" programado para mañana.

---

### 2026-06-03 — SEO bilingüe (P2→P4) + fix alta de propiedades

#### SEO bilingüe — COMPLETO y verificado en prod
- **P2 hreflang + sitemap** (e4ba2b0): helper buildAlternates() en src/lib/utils/seoAlternates.ts; hreflang en 8 páginas core; sitemap bilingüe con xhtml:link (1.043 URLs × 2 = 2.086 alternates).
- **P3 blog por locale** (34fd730; intento fallido previo e9ce4c8): el bug NO estaba en queries.ts (ya filtraba por language), sino en el origen del locale — getLocale() de next-intl v4 devolvía undefined porque el proyecto no tiene src/middleware.ts (solo proxy.ts), así que el filtro no se aplicaba. Fix: getLocale() → (await params).locale en los 7 listados (blog + noticias + consejos). Verificado: /en/blog = 10 posts EN, /blog (ES, sin prefijo) = 14 posts ES, /es/blog/<post-EN> = 404. /blog sin prefijo resuelve locale=es vía rewrite; no hace falta middleware.ts.
- **P4 geografía en vistas EN** (4a1f015): conectadas translateCountry/translateProvince (existían pero sin usar) a todos los call sites EN. Regla: traducir solo display, nunca valores de query/URL/option-value/keys; location (ciudad) no se traduce. Reemplazado el hardcode España→Spain en destinos/[slug]. +4 provincias con tilde al PROVINCE_MAP (Málaga/Almería/Cádiz/Córdoba) + COUNTRY_ISO. addressCountry del JSON-LD pasa a ISO (antes mandaba "España"). Verificado: /en/destinos/mexico → "Mexico"; /en/propiedades?pais=México → filtra 9 + "in Mexico" (value crudo OK); propiedad MX → addressCountry "MX"; control ES /destinos/mexico → "México" intacto.

#### Incidente Meta Leads (resuelto en otro chat; documentado)
- c96fcb6 (ajeno a esta línea) renombró 3 env vars del sync con prefijo META_LEADS_. Repo/rama/proyecto Vercel compartidos → los pushes de SEO redeployaron todo y activaron el refactor. El sync quedó caído en silencio desde el primer push de SEO (e4ba2b0): las 4 env vars META_LEADS_* estaban en Vercel pero con valor vacío. Resuelto: vercel env rm+add, redeploy --force, validado con sync manual {ok:true, fetched:8, added:1}; cron 02:00 OK. Sin pérdida de leads (el pull recupera el histórico del form).

#### Fix alta de propiedades (1d1a60a)
- Atilio reportó "The string did not match the expected pattern" al crear una propiedad (Samaná, Rep. Dominicana). Causa real: upload-image/route.ts sacaba la extensión con file.name.split('.').pop(); con un archivo SIN extensión y nombre con tilde ("SAMANÁ"), la key de Storage quedaba ...SAMANÁ (no-ASCII) y Supabase la rechazaba. Descartada la hipótesis del campo type="url" (estaba vacío; el error salía en el banner de la app, no en burbuja del navegador). Fix: extensión robusta /^[a-zA-Z0-9]{1,5}$/ → fallback 'jpg'. Blindaje: idealista_url type=url→text. Cosmético: botón "⭐ Principal" → "★ Hacer principal". Verificación funcional pendiente de Atilio.

#### Pendientes / mañana
- Confirmar con Atilio que ya crea la propiedad (1d1a60a en prod).
- Cosmético: areaServed del JSON-LD de Organization sigue en español en páginas EN (es un array fijo, no viene de properties).
- Heredados: UI de edición de destinos en /admin; marcar featured AG-03897/04193/00344/04085; investigar ref_code formato número plano; salvaguarda del sync HabiHub (no borrar external_id IS NULL); remediaciones de seguridad (rotación service role key, Upstash, BotID, proyectos Supabase huérfanos, CSP).

---

### Sesión 2026-06-03 — [FASE-4.L-P4-P3-FIX] Fix filtro locale en listados blog (params.locale)

**Contexto:** En producción (deploy e9ce4c8), `/en/blog` mostraba 20 posts mixtos (10 EN + 10 ES). El fix anterior (e9ce4c8) usó `getLocale()` de next-intl, pero el filtro seguía sin aplicarse.

**Trabajo hecho:**
- Diagnóstico completo: `queries.ts` ya tenía el filtro `if (locale) query.eq('language', locale)` desde commit 0adbbec — el bug no era en queries sino en cómo llega el locale.
- Causa raíz identificada: `getLocale()` de next-intl v4 lee el header `X-NEXT-INTL-LOCALE` que solo setea el middleware de next-intl. En este proyecto existe `proxy.ts` pero NO `middleware.ts` — Next.js no lo reconoce → middleware-manifest.json muestra `"middleware": {}`. Sin header, `getLocale()` retorna undefined, `if (locale)` es false, la query devuelve todos los posts sin filtrar.
- DB confirmada vía Supabase MCP: 14 posts ES + 10 posts EN publicados.
- Fix aplicado: reemplazar `getLocale()` por `params.locale` (del segmento URL `[locale]`) en los 7 listados del blog — mismo patrón que `blog/[slug]/page.tsx` que ya funcionaba.
- `npx tsc --noEmit` limpio.

**Archivos tocados:**
- MODIFIED: `src/app/[locale]/(public)/blog/page.tsx`
- MODIFIED: `src/app/[locale]/(public)/blog/consejos/page.tsx`
- MODIFIED: `src/app/[locale]/(public)/blog/inversiones/page.tsx`
- MODIFIED: `src/app/[locale]/(public)/blog/noticias/page.tsx`
- MODIFIED: `src/app/[locale]/(public)/blog/mercado/page.tsx`
- MODIFIED: `src/app/[locale]/(public)/consejos/page.tsx`
- MODIFIED: `src/app/[locale]/(public)/noticias/page.tsx`
- MODIFIED: `.gitignore` (outputs/meta-token-diagnosis-*.json)

**Commits:** `34fd730` — fix(blog): usar params.locale en listados (getLocale sin middleware retorna undefined)

**Próximo paso sugerido:** Verificar en producción que `/en/blog` muestra solo posts EN y `/es/blog` (o `/blog`) muestra solo posts ES. Si se quiere corregir el routing del locale para rutas sin prefijo (/blog, /consejos, /noticias en español), crear `src/middleware.ts` que exporte la función `proxy` como `default export middleware`.

---

### Sesión 2026-06-02 — [FASE-2-P2-FIX] Rename env vars Meta Leads Sync con prefijo META_LEADS_

**Contexto:** Las variables `META_SYSTEM_USER_TOKEN` y `CRON_SECRET` ya existían en Vercel asignadas a otros sistemas. Para evitar conflictos, renombrar las del sistema Meta Leads Sync con prefijo claro.

**Trabajo hecho:**
- `META_SYSTEM_USER_TOKEN` → `META_LEADS_SYNC_TOKEN` en todo el código
- `META_LEAD_FORM_ID` → `META_LEADS_FORM_ID` en todo el código
- `CRON_SECRET` → `META_LEADS_CRON_SECRET` solo en archivos del sistema sync-meta (sync-habihub intacto)
- `META_LEADS_SHEET_ID` sin cambios (ya tenía el prefijo correcto)

**Archivos modificados:**
- MODIFIED: `src/lib/meta/leadsApi.ts` — mensaje de error 401
- MODIFIED: `src/app/api/leads/sync-meta/route.ts` — 3 referencias
- MODIFIED: `src/app/api/leads/sync-meta/manual/route.ts` — 3 referencias + comentario
- MODIFIED: `.env.local` — renombradas las 3 variables + comentarios
- MODIFIED: `docs/meta-leads-sync-automation.md` — todas las referencias
- MODIFIED: `docs/meta-leads-sync.md` — todas las referencias
- MODIFIED: `DAILY_LOG.md` — referencias en pendientes y sesiones anteriores

**Verificaciones:**
- `grep META_SYSTEM_USER_TOKEN src/**` → 0 resultados ✓
- `grep META_LEAD_FORM_ID src/**` → 0 resultados ✓
- `grep CRON_SECRET src/lib/meta/ src/app/api/leads/sync-meta/` → 0 resultados ✓
- `grep CRON_SECRET src/app/api/admin/sync-habihub/route.ts` → 1 resultado (intacto) ✓

**Próximo paso sugerido:**
1. Cargar en Vercel con los nombres nuevos: `META_LEADS_SYNC_TOKEN` (Sensitive), `META_LEADS_FORM_ID`, `META_LEADS_SHEET_ID`, `META_LEADS_CRON_SECRET` (Sensitive)
2. Commit + push → deploy

---

### Sesión 2026-06-02 — [FASE-2-P2] Sistema de sincronización automática Meta Lead Ads → Google Sheets (revisión completa)

**Contexto:** Retomar la FASE-2-P2 implementada en sesión 2026-05-31d. Los archivos ya existían pero necesitaban revisión profunda: el parser no tenía `meta_lead_id`, la deduplicación era por timestamp (frágil), no había integración con `categorizeLead`/`getSpecialStateNotes`, faltaba la columna Prioridad en el Sheet, y el endpoint manual no existía.

**Trabajo hecho:**

**T1 — `src/lib/meta/leadsApi.ts` (ACTUALIZADO)**
- `fetchLeadsFromMeta(formId, accessToken, sinceTimestamp?)` — accessToken ahora va en header `Authorization: Bearer` (no en URL — seguridad)
- Campos ampliados: + `adset_id`, `adset_name`, `campaign_id`, `campaign_name`, `platform`
- Paginación via `paging.cursors.after` (más robusta que `paging.next`)
- Errores 401/403 con mensajes claros para debugging

**T2 — `src/lib/meta/leadParser.ts` (ACTUALIZADO)**
- `ParsedMetaLead` ahora incluye `meta_lead_id` (crítico para deduplicación)
- Keys de field_data actualizadas a los nombres reales del formulario Meta:
  `what_type_of_property_are_you_looking_for?`, `what's_your_budget_range?`, etc.
- Mapeos de valores: `apartment` → `Apartamento`, `within_3_months` → `En 3 meses`, etc.
- `extractVariant` actualizado: detecta `Carousel-A` → `Carrusel A`

**T3 — `src/lib/meta/syncTracker.ts` (REESCRITO)**
- Eliminada lógica de timestamp. Nuevo modelo de deduplicación por ID/email:
- `getSyncedLeadIds(formId)` — lee de tabla `meta_leads_synced`
- `getSyncedEmails(formId)` — lee de tabla `meta_leads_synced`
- `recordSyncedLeads(leads)` — upsert en `meta_leads_synced`

**T4 — `src/lib/meta/syncLog.ts` (NUEVO)**
- `createSyncRun(formId)` — inserta en `meta_sync_runs` con status='running'
- `updateSyncRun(id, update)` — actualiza contadores y finished_at

**T5 — `src/lib/googleSheets.ts` (ACTUALIZADO)**
- `appendLeadToMetaSheet` actualizado: 11 columnas A:K (+ Prioridad), `insertDataOption: 'INSERT_ROWS'`
- `readMetaSheetEmails(spreadsheetId)` — nueva función, lee columna C para dedup de leads manuales

**T6 — `src/app/api/leads/sync-meta/route.ts` (REESCRITO)**
- Flujo completo: createSyncRun → dedup (Supabase + Sheet) → fetchLeads → parse → categorizeLead → append → recordSyncedLeads → updateSyncRun
- Log detallado: `{ fetched, duplicated, added }`
- Fallback: si falta `meta_lead_id`, usa `form_id` hardcodeado desde env o constante

**T7 — `src/app/api/leads/sync-meta/manual/route.ts` (NUEVO)**
- POST endpoint — mismo flujo que el cron
- Acepta `Authorization: Bearer [CRON_SECRET]` o `X-Manual-Sync: [CRON_SECRET]`

**T8 — `.env.local` (ACTUALIZADO)**
- `META_LEADS_FORM_ID=1495878108643736`
- `META_LEADS_SHEET_ID=1Q_PRvDe45XxRoB43JZGWVJyJli8Cqf0G2Ry8vJcvZcA`
- `META_LEADS_CRON_SECRET=PRI2MuQ9hOo1uIL8xyMFbtSJyWPHZ8mMMYvVICg-OWc=`

**T9 — Migraciones Supabase (aplicadas via MCP)**
- `meta_leads_synced` (meta_lead_id PK, form_id, email, created_time, synced_at)
- `meta_sync_runs` (id uuid PK, form_id, started_at, finished_at, leads_fetched, leads_duplicated, leads_added, status, error_message, details)

**T10 — `docs/meta-leads-sync-automation.md` (NUEVO)**
- Arquitectura, variables de entorno, cómo regenerar token, cambiar form/sheet, sync manual, opciones de cron frecuente (Vercel Pro / QStash / GitHub Actions), queries de monitoreo

**TypeScript:** `npx tsc --noEmit` → 0 errores ✓

**Nota cron:** `vercel.json` mantiene `0 0 * * *` (Hobby plan). Cambiar a `*/15 * * * *` solo si upgrade a Vercel Pro o usar fallback QStash/GitHub Actions (documentado).

**Archivos creados:**
- CREATED: `src/lib/meta/syncLog.ts`
- CREATED: `src/app/api/leads/sync-meta/manual/route.ts`
- CREATED: `docs/meta-leads-sync-automation.md`

**Archivos modificados:**
- MODIFIED: `src/lib/meta/leadsApi.ts`
- MODIFIED: `src/lib/meta/leadParser.ts`
- MODIFIED: `src/lib/meta/syncTracker.ts`
- MODIFIED: `src/lib/googleSheets.ts`
- MODIFIED: `src/app/api/leads/sync-meta/route.ts`
- MODIFIED: `.env.local`
- DB MIGRATIONS: `create_meta_leads_synced`, `create_meta_sync_runs`

**Commits:** pendiente de OK del usuario

**Próximo paso sugerido:**
1. Cargar en Vercel las 4 variables: `META_LEADS_SYNC_TOKEN` (Sensitive), `META_LEADS_FORM_ID`, `META_LEADS_SHEET_ID`, `META_LEADS_CRON_SECRET` (Sensitive)
2. Commit + push → deploy automático
3. Test manual: `curl -X POST https://[dominio]/api/leads/sync-meta/manual -H "Authorization: Bearer PRI2MuQ9hOo1uIL8xyMFbtSJyWPHZ8mMMYvVICg-OWc="`
4. Verificar que los 7 leads históricos se saltean (expected: `added: 0, duplicated: 7`)
5. Si un lead nuevo llega desde Meta, debería aparecer en el Sheet en el próximo ciclo

---

### Sesión 2026-06-01 — [FASE-4.L-P3-FIX3] LocaleSwitcher dropdown + Header estable ES/EN

**Contexto:** LocaleSwitcher en producción era pill con 2 banderas (fix anterior no se aplicó o se sobreescribió). Al cambiar a EN, traducciones como "Destinations" rompen el header a 2 líneas.

**Diagnóstico:**
- `LocaleSwitcher.tsx` tenía el pill original (commit 80b6664 aplicó Link-based navigation pero mantuvo el diseño pill)
- `dropdown-menu.tsx` no existía en `/components/ui` (solo `button.tsx` y `carousel.tsx`)
- Header: nav links sin `whitespace-nowrap`, sin `shrink-0` en logo/acciones → texto wrapeaba al encoger

**Fixes aplicados:**

1. **Instalado** `shadcn dropdown-menu` → `src/components/ui/dropdown-menu.tsx` (usa `@base-ui/react/menu`)

2. **LocaleSwitcher reescrito** con DropdownMenu real:
   - Trigger: solo 1 bandera activa + ChevronDown icon
   - Dropdown: 2 opciones (ES/EN), activa marcada con ✓ y `disabled`
   - Navegación: `router.replace(pathname, { locale: loc })` de `@/i18n/navigation`

3. **Header fixes**:
   - Logo Link: `shrink-0` → no se contrae
   - Nav links: `whitespace-nowrap` + reducido `px-2 xl:px-3` → texto no wrappea
   - Nav container: `gap-0.5 xl:gap-1 flex-nowrap`
   - Actions div: `shrink-0`, gaps `gap-2 xl:gap-3`

**Build:** `npx tsc --noEmit` → 0 errores. `npx next build` → OK (2186 páginas)

**Archivos tocados:**
- MODIFIED: `src/components/LocaleSwitcher.tsx`
- MODIFIED: `src/components/Header.tsx`
- CREATED: `src/components/ui/dropdown-menu.tsx`

**Commits:**
- `259b078` — fix(i18n): LocaleSwitcher dropdown + Header estable en ES/EN

**Próximo paso:** Verificar visualmente en `npm run dev`: (a) header 1 línea en ES y EN, (b) logo estable, (c) dropdown abre con 1 click. Luego `git push` para deploy.

---

### Sesión 2026-06-01 — [FASE-4.L-P3-FIX] Fix logo deformado + LocaleSwitcher

**Contexto:** Ivan reporta 2 bugs visuales post L-P2/L-P3.

**Bug 1 — Logo deformado en ES:**
Causa: `logo.png` es 500×500px (ratio 1:1 cuadrado). La clase `w-auto`
con un `<img>` cuadrado hace que el browser calcule `width = height × ratio = 80 × 1 = 80px`
→ logo se renderiza como 80×80 en vez de 200×80.
Fix: inline `style={{ objectFit: 'contain', width: '200px' }}` sobrescribe `w-auto`,
fuerza box 200×80 y `contain` muestra el logo sin deformación.

**Bug 2 — LocaleSwitcher requería múltiples clicks:**
Causa: `router.replace() + startTransition` → `disabled={isPending}` bloqueaba el botón
durante la transición. Si la navegación soft no actualizaba `useLocale()` inmediatamente,
el switch parecía no funcionar.
Fix: Reescrito con `Link href={pathname} locale={loc}` de `@/i18n/navigation`.
Navegación directa sin state intermedio → cambia al primer click.
Diseño: pill redondeado, activo en gold/scale-110.

**Build:** `npx tsc --noEmit` + `npx next build` → sin errores.

**Webhook verificado:** El push disparó un deploy automático de Vercel
(source: "git" — confirma que el webhook funciona tras el fix del cron).

**Archivos tocados:**
- MODIFIED: `src/components/LocaleSwitcher.tsx`
- MODIFIED: `src/components/Header.tsx`

**Commits:**
- `80b6664` — fix(i18n): LocaleSwitcher con Link de next-intl + diseño pill
- `984cb62` — fix(header): logo no se deforma — objectFit contain + width explícito

**Deploy:** `dpl_A7cZXXoMhzC4N1DLbqoL3eogUPon` → commit `984cb62` → `assetsgolden.com` ✓
(source: "git" — automático via webhook ✅)

**Próximo paso:** [FASE-4.L-P4] hreflang + sitemap bilingüe. Verificar `assetsgolden.com/en` visualmente.

---

### Sesión 2026-06-01 — [FASE-4.L-DEPLOY-DEBUG] Diagnóstico y fix deploy bloqueado

**Contexto:** Múltiples commits sin llegar a producción. Deploy hook disparaba PENDING pero no materializaba. CLI fallaba silenciosamente.

**Causa raíz encontrada:**
`vercel.json` tenía `"schedule": "*/15 * * * *"` (cron cada 15 min). Vercel Hobby solo permite crons diarios (`0 0 * * *`). Este error bloqueaba **silenciosamente** todos los builds nuevos vía CLI, webhook y Deploy Hook.

**Por qué los "redeploys" funcionaban:**
El botón "Redeploy" del dashboard Vercel reutiliza el artifact de build existente (sin correr nuevo build), por lo tanto nunca validaba el cron. Los commits nuevos disparaban builds que fallaban antes de siquiera correr.

**Fix aplicado:**
- `vercel.json`: `*/15 * * * *` → `0 0 * * *` (medianoche UTC, 1× diario)
- Impacto: cron `/api/leads/sync-meta` baja de cada 15min a 1× diaria
- Para sync más frecuente: upgrade a Vercel Pro ($20/mo)

**Deploy resultado:**
- `dpl_673UTGq4jerUhDVKtbLPu1YV1WUV` — READY
- Commit: `b4de300` (HEAD actual con i18n L-P2+L-P3)
- Aliased: `assetsgolden.com` ✓ — código i18n EN vivo en producción

**Webhook status:**
Probablemente estaba conectado todo el tiempo pero los builds fallaban silenciosamente. Ahora que el cron es válido, los push futuros deberían auto-deployar. Si sigue sin funcionar: Vercel dashboard → Project → Settings → Git → Disconnect & Reconnect GitHub.

**Archivos tocados:**
- MODIFIED: `vercel.json` (schedule cron)

**Commits:**
- `b4de300` — fix(vercel): cambiar cron de */15 a 0 0 * * * (Hobby plan)

**Push + Deploy:** `c8b2e1d..b4de300` → origin/main ✓ | `assetsgolden.com` ✓

**Próximo paso:** Verificar que `assetsgolden.com/en` funciona correctamente (i18n EN en producción). Si el webhook sigue roto tras el siguiente push, reconectar en Vercel dashboard.

---

### Sesión 2026-06-01 — [FASE-4.L-P3] i18n: traducción 8 páginas críticas + helpers bilingües

**Contexto:** Con infraestructura next-intl de L-P2 lista, traducción completa de las 8 rutas críticas para Capa 1 i18n.

**T1 — Helpers creados:**
- `src/lib/utils/format.ts` — formatPrice/formatNumber/formatDate con locale es-ES/en-GB
- `src/lib/utils/translateGeography.ts` — mapas country/province ES→EN (Opción B diagnóstico)
- `src/lib/propertyTypes.ts` refactorizado: propertyTypeMap con {es,en}, translatePropertyType(type, locale)

**T2 — messages.json ampliados (~350 claves):**
- 10 namespaces nuevos: Common, Sidebar, Home, Properties, PropertyDetail, Destinations, DestinationDetail, Spain, Contact, MyDemand, Filters, Team
- Editorial de España en inglés (~600 palabras) en Spain namespace

**T3 — Componentes traducidos (7):**
- PropertyCard: async + getLocale() + formatPrice locale-aware
- PropiedadesFilters + SpainFilters: useTranslations('Filters') + useLocale() + useRouter @/i18n/navigation
- HomeSidebar: useTranslations('Sidebar') + Link de @/i18n/navigation
- HomeTeamSection: bio_en/role_en según locale
- DemandDialog: useTranslations('MyDemand')

**T4 — 8 páginas críticas traducidas:**
- /, /propiedades, /propiedades/[slug], /destinos, /destinos/[slug], /destinos/espana, /contacto, /mi-demanda
- ContactForm + MiDemandaForm: useTranslations() con arrays de opciones traducidos
- destinos/espana: editorial bilingüe inline (ES) + messages JSON (EN)
- destinos/[slug]: description_en/tagline_en/highlights_en/market_info_en según locale

**T5 — queries.ts blog:**
- getBlogPosts(limit, locale), getBlogPostsByCategory(cat, locale), getAllBlogSlugs(locale) filtran por language

**T6 — Admin fix:**
- Admin propiedades edit/nueva-propiedad: `label.es` para compatibilidad con propertyTypeMap bilingüe

**Build:** `npx tsc --noEmit` → sin errores | `npx next build` → 2186 páginas ✓

**Archivos:**
- CREATED: format.ts, translateGeography.ts
- MODIFIED: propertyTypes.ts, queries.ts, messages/es.json, messages/en.json, 7 componentes, 10 páginas, 2 admin pages

**Commits:**
- `0797954` — feat(i18n): helpers centralizados
- `44e00fd` — feat(i18n): messages.json namespaces completos
- `4e1734e` — feat(i18n): traducir componentes
- `0adbbec` — feat(i18n): traducir 8 páginas críticas + queries.ts blog locale

**Push:** `1369aaf..0adbbec` → origin/main ✓
**Webhook Vercel:** roto — Ivan redeploy manual.

**Próximo paso:** [FASE-4.L-P4] hreflang + sitemap bilingüe + deploy. Verificar smoke test en producción tras redeploy.

---

### Sesión 2026-06-01 — [FASE-4.L-P2] i18n: setup next-intl v4 + Header + Footer + LocaleSwitcher

**Contexto:** Implementar Capa 1 de internacionalización: ES sin prefijo (default), EN con `/en/`. Diagnóstico L-P1 completado en sesión anterior.

**T1 — Instalación:**
- `next-intl@4.13.0` instalado

**T2-T3 — Descubrimiento bloqueante:**
- Next.js 16 usa `proxy.ts` en lugar de `middleware.ts`
- Se eliminó `src/middleware.ts` creado inicialmente
- Se fusionó la lógica i18n dentro del `src/proxy.ts` existente (que ya tenía auth guard de Supabase para admin)

**T4 — Archivos de infraestructura creados:**
- `src/i18n/routing.ts` — defineRouting: locales=['es','en'], defaultLocale='es', mode='as-needed'
- `src/i18n/navigation.ts` — createNavigation: Link, usePathname, useRouter con locale automático
- `src/i18n/request.ts` — getRequestConfig con carga dinámica de messages/{locale}.json
- `messages/es.json` + `messages/en.json` — namespaces Header y Footer completos
- `src/app/[locale]/layout.tsx` — NextIntlClientProvider + generateStaticParams

**T5 — Movida estructura app/:**
- `src/app/(public)/` → `src/app/[locale]/(public)/` (34 archivos, git los reconoce como R rename)
- Fix import roto: `src/components/forms/VenderForm.tsx` → nueva ruta con `[locale]`

**T6 — Componentes i18n:**
- `Header.tsx` refactorizado: `useTranslations('Header')` + `useLocale()`, navLinks dentro del componente, `Link` de `@/i18n/navigation`
- `Footer.tsx` refactorizado: `async` server component con `getTranslations('Footer')`, footerLinks con t()
- `src/components/LocaleSwitcher.tsx` NUEVO: banderas 🇪🇸🇬🇧, activo resaltado en gold

**T7 — Build:**
- `npx tsc --noEmit` → sin errores
- `npx next build` → exitoso, 2186 páginas (doble por 2 locales)

**Archivos tocados:**
- CREATED: `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/i18n/request.ts`, `messages/es.json`, `messages/en.json`, `src/app/[locale]/layout.tsx`, `src/components/LocaleSwitcher.tsx`
- MODIFIED: `next.config.ts`, `src/proxy.ts`, `src/app/layout.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/forms/VenderForm.tsx`, `package.json`
- RENAMED (34 archivos): `src/app/(public)/**` → `src/app/[locale]/(public)/**`

**Commits:**
- `5ff0b5a` — feat(i18n): setup next-intl v4 + estructura app/[locale] + proxy
- `ce78034` — feat(i18n): traducir Header + Footer + LocaleSwitcher con banderas

**Push:** `693576a..ce78034` → origin/main ✓

**Webhook Vercel:** roto desde sesiones anteriores — Ivan debe hacer redeploy manual.

**Próximo paso sugerido:** [FASE-4.L-P3] Traducir páginas core: /propiedades, /propiedades/[slug], /destinos/[slug], /destinos/espana, /contacto, /mi-demanda, home. Centralizar formateo de precios/fechas. Filtrar blog por locale.

---

### Sesión 2026-06-01 — [FASE-4.K-P1] ATILIO-1: drag-to-reorder fotos en nueva-propiedad

**Contexto:** Atilio reportó que al crear una propiedad nueva no podía reordenar fotos por drag. El sprint A7 implementó drag-to-reorder en edit/page.tsx pero no se replicó al form de creación.

**T1 — Análisis patrón A7:**
- `SortableImage` estaba definido **inline** dentro de `edit/page.tsx` (no existía como componente separado)
- Usa `existingImages: string[]` (URLs de Supabase) como estado
- `handleDragEnd` llama `arrayMove` con el índice de la URL activa/over
- ID de dnd-kit = la URL (única por construcción de Supabase)

**T2 — Análisis nueva-propiedad:**
- Estado: `galleryFiles: File[]` + `galleryPreviews: string[]` en paralelo
- `makeMain(i)` manual (sin drag), `removePhoto(i)` revocaba ambos arrays
- Upload en `handleSubmit` usando `galleryFiles` secuencialmente
- Imagen principal = `uploadedUrls[0]`

**T3 — Implementación (2 commits):**
- **Commit 1**: Extraer `SortableImage` a `src/components/admin/SortableImage.tsx`. Actualizar `edit/page.tsx` para importarlo — comportamiento idéntico.
- **Commit 2**: En `nueva-propiedad/page.tsx`, unificar estado en `galleryItems: {file, preview}[]` para mantener files y object URLs sincronizados al reordenar. Agregar DndContext + SortableContext + `handleDragEnd` usando el object URL como ID (único por `URL.createObjectURL`). Usar `SortableImage` compartido.

**T4 — Smoke test:**
- `npx tsc --noEmit` → sin errores
- `npx next build` → compilación exitosa (1115 páginas estáticas)

**Archivos tocados:**
- CREATED: `src/components/admin/SortableImage.tsx`
- MODIFIED: `src/app/admin/propiedades/[id]/edit/page.tsx`
- MODIFIED: `src/app/admin/nueva-propiedad/page.tsx`

**Commits:**
- `2badee5` — refactor(admin): extraer SortableImage a componente compartido
- `693576a` — feat(admin): drag-to-reorder fotos en nueva-propiedad (ATILIO-1)

**Push:** `9afd8cb..693576a` → origin/main ✓

**Pendiente:** Ivan debe hacer redeploy manual en Vercel dashboard (webhook GitHub→Vercel roto).

**Próximo paso sugerido:** Ivan confirma que en `/admin/nueva-propiedad` se pueden arrastrar fotos para reordenar antes de guardar. Verificar también que `/admin/propiedades/[id]/edit` sigue funcionando igual (sin regresión).

---

### Sesión 2026-05-31i — [FASE-4.J-P1] Destacar 4 propiedades Marbella en /destacadas

**Contexto:** Ivan necesita marcar como featured=true las 4 propiedades del carrusel Marbella activas en ads de Meta para que aparezcan al inicio de /destacadas.

**T1 — Estado pre-update:**
- AG-03897: Ático en Marbella, 495.000€, active, hidden=false, sold=false, featured=false ✓
- AG-04193: Apartamento en Marbella, 509.000€, active, hidden=false, sold=false, featured=false ✓
- AG-00344: Ático en Marbella, 558.000€, active, hidden=false, sold=false, featured=false ✓
- AG-04085: Apartamento en Marbella, 645.000€, active, hidden=false, sold=false, featured=false ✓
- featured existentes antes del cambio: 34 (todas con featured_order=0)

**T2 — UPDATE aplicado:**
- Fórmula: `ROW_NUMBER() + MIN(featured_order) - 1 - 4` → asigna -4, -3, -2, -1
- Las 4 nuevas quedan ANTES de las 34 existentes (order ASC)

**T3 — Verificación post-update:**
| ref_code | featured_order | posición |
|---|---|---|
| AG-03897 | -4 | 1° |
| AG-04193 | -3 | 2° |
| AG-00344 | -2 | 3° |
| AG-04085 | -1 | 4° |
- Total featured: 34 → **38** ✓
- featured_order de las 34 existentes: intacto (todas en 0)

**T4 — Cache:** Commit vacío `9616c64` pusheado → redeploy Vercel forzado → purga cache /destacadas y home carousel.

**Archivos tocados:** ninguno (solo SQL + commit vacío)

**Commits:** `9616c64` — chore: trigger redeploy — featured 4 Marbella

**Próximo paso sugerido:** Ivan verifica `/destacadas` tras ~3 min de deploy. Las 4 propiedades Marbella deben aparecer primeras. Confirmar que el carrusel home también las muestra.

---

### Sesión 2026-05-31g — [FASE-4.I-P2] Capturar dev_id HabiHub + UI copiar

**Contexto:** El XML feed trae `<ref>` con `[dev_id]-[unit_num]` que el sync ignoraba. Atilio confirma que pegando el dev_id en HabiHub encuentra el development. Objetivo: guardar esos campos en DB, repoblar propiedades existentes y añadir botón "Copiar" en el admin.

**T1 — Migración DB:** `habihub_dev_id TEXT`, `habihub_unit TEXT`, índice en `habihub_dev_id`. Backup previo: `properties_i_p2_backup` (2.277 filas).

**T2 — sync-habihub/route.ts:** `parseFeedProp()` extrae `<ref>`, split por guión, popula `habihub_dev_id`/`habihub_unit` en INSERT y UPDATE por fingerprint.

**T3 — scripts/repopulateHabihubDevIds.ts (NUEVO):** Dry-run: 2.152 matches, 125 sin match. Run real: 2.152 actualizadas, 0 errores, 897 developments únicos en DB.

**T4 — UI /admin/propiedades:** Celda "Cód. HabiHub" reemplazada: muestra `habihub_dev_id` (gris, mono) + botón `<Copy>` (lucide) que copia al clipboard y dispara `toast.success`. `<Toaster>` de sonner añadido al admin layout.

**T5 — Smoke test:** `npx tsc --noEmit` ✓ — `npx next build` ✓ — `git status` sin cambios sin stagear ✓

**Cómo revertir:**
```sql
ALTER TABLE properties DROP COLUMN habihub_dev_id, DROP COLUMN habihub_unit;
-- O restaurar desde properties_i_p2_backup si es necesario
```

**Archivos creados:** `scripts/repopulateHabihubDevIds.ts`

**Archivos modificados:** `sync-habihub/route.ts`, `admin/layout.tsx`, `propiedades/page.tsx`, `PropiedadesTable.tsx`

**DB:** migración `add_habihub_dev_id_unit_columns` + 2.152 UPDATEs + backup `properties_i_p2_backup`

**Commits:** `5368aca` — feat(habihub): capturar dev_id + UI copiar en /admin/propiedades

**Próximo paso sugerido:** Atilio prueba el workflow: copiar dev_id desde `/admin/propiedades` → pegar en HabiHub. Si quiere buscar todas las unidades de un development desde el admin, implementar I-P3 (búsqueda por `habihub_dev_id`).

---

### Sesión 2026-05-31h — [FASE-2-P3] Sistema de priorización automática + carga leads Meta

**Contexto:** Añadir columna "Prioridad" (J) al Sheet de seguimiento. Implementar función pura `categorizeLead` reutilizable para la sincronización automática futura. Los 7 leads ya cargados en sesión anterior (10 cols) quedan en filas A2:J8 con formato viejo — las nuevas 7 filas con 11 columnas se agregaron en A9:K15. Atilio debe limpiar las filas anteriores (A2:J8) manualmente.

**Trabajo hecho:**

**T1 — `src/lib/leads/prioritizeLead.ts` (NUEVO)**
- `FREE_EMAIL_DOMAINS`: Set de ~20 dominios gratuitos (gmail, yahoo, hotmail, outlook, web.de, gmx, icloud...)
- `COUNTRY_PHONE_PREFIXES`: mapa ISO 3166-1 → prefijo(s) (20 países: GB, DE, SE, DK, NO, PK, ES, FR, IT, NL, BE, AT, CH, US, CA, AU, AE, MX, AR, CO, BR)
- `getBudgetLevel(presupuesto)`: convierte string de presupuesto a nivel numérico 1-5
- `categorizeLead(lead)`: función pura → 'Alta' | 'Media' | 'Baja'
  - REGLA 1 (Alta): timeline ≤3 meses, O budget ≥1M EUR, O email corporativo+timeline 3-6m
  - REGLA 2 (Baja): purpose=Mix, O explorando+budget<500K, O inconsistencia país/teléfono, O free+Villa+budget≤500K
  - REGLA 3 (Media): default
- `getSpecialStateNotes(lead)`: "Validar por WhatsApp antes de llamar" si hay inconsistencia país/teléfono, null en otros casos

**T2 — `src/lib/leads/prioritizeLead.test.ts` (NUEVO)**
- 12 tests sin framework externo (tsx directo)
- Un test por cada lead histórico (7 tests) + 2 tests getSpecialStateNotes + 3 tests edge cases
- `npx tsx src/lib/leads/prioritizeLead.test.ts` → 12/12 ✅

**T3 — `scripts/uploadMetaLeadsToSheet.ts` (ACTUALIZADO)**
- Columnas A-K (11 cols): +Prioridad (J), Estado pasa a K
- Import de `categorizeLead` y `getSpecialStateNotes`
- Leads ordenados por fecha descendente
- Tabla de verificación post-carga: prioridad asignada vs esperada
- Ejecución: 7/7 filas agregadas, 7/7 prioridades correctas, 2.76s

**Verificación de prioridades:**

| Lead | Prioridad asignada | Prioridad esperada | Match |
|------|---------------------|---------------------|-------|
| Mary Larson Uhlin | Media | Media | ✅ |
| Michael Johansen | Alta | Alta | ✅ |
| Heather Meakin | Alta | Alta | ✅ |
| Fabienne Richman | Media | Media | ✅ |
| Beatrice Lenz | Baja | Baja | ✅ |
| Saqlain Abbas | Baja | Baja | ✅ |
| Andreas Langsch | Alta | Alta | ✅ |

**Filas en Sheet:** A9:K15 (7 nuevas con 11 cols). Filas A2:J8 (sesión anterior, 10 cols) → Atilio las limpia manualmente.

**Archivos creados/modificados:**
- CREATED: `src/lib/leads/prioritizeLead.ts`
- CREATED: `src/lib/leads/prioritizeLead.test.ts`
- MODIFIED: `scripts/uploadMetaLeadsToSheet.ts`
- MODIFIED: `DAILY_LOG.md`

**Commits:** `7637fb1` — feat(leads): sistema de priorización automática + carga de leads históricos Meta

**Próximo paso sugerido:**
1. Atilio limpia filas A2:J8 del Sheet (formato viejo de 10 columnas de la sesión anterior)
2. Atilio actualiza columna K (Estado) de Saqlain Abbas: debería tener "Validar por WhatsApp antes de llamar"
3. FASE-2-P2: integrar `categorizeLead` en `src/lib/meta/leadParser.ts` cuando se desbloquee el System User Token

---

### Sesión 2026-05-31g — [FASE-2-P3] Carga manual de 7 leads históricos de Meta al Sheet

**Contexto:** 7 leads de la campaña Marbella-NewBuild-Leads-EN-v1 exportados manualmente desde Meta Lead Center. Se cargan al Sheet de seguimiento de Atilio mientras se desbloquea la conexión automática con Zapier / Meta API.

**Trabajo hecho:**

- **T1 — Script `scripts/uploadMetaLeadsToSheet.ts` (NUEVO):**
  - Pre-flight: detecta nombre de pestaña automáticamente (prueba "Hoja 1" y "Sheet1")
  - Autenticación via `GOOGLE_SHEETS_CREDENTIALS_JSON` (service account)
  - Batch append de 7 leads en `'Hoja 1'!A:J` (10 columnas)
  - Logs individuales con prioridad y rango devuelto por la API
  - Resumen final: filas agregadas, tiempo, errores

- **T2 — Ejecución exitosa:**
  - 7/7 filas agregadas sin errores
  - Tiempo total: 2.85s
  - Filas A2:J2 → A8:J8 (pestaña "Hoja 1" detectada correctamente)
  - Sheet: https://docs.google.com/spreadsheets/d/1Q_PRvDe45XxRoB43JZGWVJyJli8Cqf0G2Ry8vJcvZcA/edit

**Leads cargados (en orden de prioridad):**
1. Heather Meakin — heathermeakin@thedentalbrokers.co.uk — Villa — 500K-1M EUR — En 3 meses
2. Andreas Langsch — a.langsch@avr-gruppe.de — Penthouse — 1M-2M EUR — Solo explorando
3. Michael Johansen — Michael@flexto.dk — Apartamento — 300K-500K EUR — 3-6 meses
4. Mary Larson Uhlin — marylarsonuhlin@gmail.com — Cualquier tipo — 300K-500K EUR — 3-6 meses
5. Fabienne Richman — fabiener@gmail.com — Apartamento — 500K-1M EUR — 3-6 meses
6. Beatrice Lenz — Beatricelenz@web.de — Villa — 300K-500K EUR — 3-6 meses
7. Saqlain Abbas — saqlainabbaspk834@gmail.com — Townhouse — 300K-500K EUR — Solo explorando ⚠️ Validar: email PK, teléfono ES

**Archivos creados:**
- CREATED: `scripts/uploadMetaLeadsToSheet.ts`
- MODIFIED: `DAILY_LOG.md`

**Commits:** `098a95b` — feat(leads): script one-shot para carga manual de leads históricos de Meta

**Próximo paso sugerido:**
1. Atilio verifica las 7 filas en el Sheet y actualiza la columna J (Estado) según contacto
2. FASE-2-P2: cuando se desbloquee el System User Token de Meta, activar la sincronización automática (variables ya cargadas en `.env.local`): META_LEADS_SYNC_TOKEN, META_LEADS_FORM_ID, META_LEADS_SHEET_ID, META_LEADS_CRON_SECRET

---

### Sesión 2026-05-31f — [FASE-4.H-P5] Triggers SQL preventivos en properties

**Contexto:** Blindar la tabla `properties` a nivel DB contra inserts/updates con country/province/location mal formateados, independientemente del origen (form, scraper, dashboard Supabase, SQL directo).

**Trabajo hecho:**

**PASO 1+2 — Migración `normalize_property_fields_trigger`:**
- Función PL/pgSQL `normalize_property_fields()`:
  - `country`: TRIM + vacío → NULL (casing preservado — "España", "Reino Unido")
  - `province`: TRIM + INITCAP(LOWER()) — "BARCELONA" → "Barcelona"
  - `location`: TRIM + INITCAP(LOWER()) — "SITGES" → "Sitges", vacío → NULL
- Trigger `normalize_property_fields_trigger`: BEFORE INSERT OR UPDATE en `properties`, FOR EACH ROW
- Migración aplicada vía Supabase MCP (versión en `supabase_migrations`)

**PASO 3 — Smoke test (con ROLLBACK):**
- INSERT con `'  España  '` / `'BARCELONA'` / `'SITGES'`
- SELECT confirmó: `country='España'` / `province='Barcelona'` / `location='Sitges'` ✓
- ROLLBACK limpio — sin datos de prueba en producción

**PASO 4 — Edge cases verificados:**
- `'Reino Unido'` → `'Reino Unido'` ✓
- `'Emiratos Árabes Unidos'` → `'Emiratos Árabes Unidos'` ✓ (tildes respetadas)
- `'LAS LAGUNAS DE MIJAS'` → `'Las Lagunas De Mijas'` ⚠️ ("De" capitalizada — aceptable, consistente)
- `'BUENOS AIRES'` → `'Buenos Aires'` ✓
- Espacios puros / vacío → NULL ✓

**Cobertura total de la cadena H-P1→H-P5:**
- H-P1: diagnóstico de propiedades rotas ✓
- H-P2: normalización de las 4 propiedades existentes ✓
- H-P3: form admin + revalidatePath + helper normalizePropertyFields ✓
- H-P4: scrape-original normalizado + validación country ✓
- H-P5: trigger DB — cobertura total independiente del origen ✓

**Archivos tocados:** ninguno en el repo (migración aplicada directamente vía MCP)

**Commits:** ninguno — solo entrada de log

**Próximo paso sugerido:** FASE-4.H cerrada. Próxima prioridad: refactor pipeline leads (Resend — pendiente acceso Atilio) o páginas legales GDPR.

---

### Sesión 2026-05-31e — [FASE-4.H-P4] Auditoría y normalización scrape-original

**Contexto:** Blindar `/api/admin/scrape-original` contra la generación de propiedades con campos rotos (country=null, province en mayúsculas), análogo a lo hecho en H-P3 para el form admin.

**T1 — Hallazgos auditoría:**
- `scrapeOriginalWeb.ts` scrape Puppeteer de 9 URLs hardcodeadas en `assetsgolden.com/property/[uuid]` (web vieja Lovable, SPA, espera 6s)
- `external_source` siempre fue `'scraper-lovable'` en todas las versiones del histórico git ✓
- `revalidatePropertyPaths()` ya presente en `route.ts` desde H-P3 ✓
- Issue real: `countryHint='Bali'` se insertaba tal cual (Bali es región, no país). `location=''` en lugar de null.
- `province` no se setea (queda NULL — correcto)
- `normalizePropertyFields` no era llamado

**T2 — Origen propiedades rotas:**
- Confirmado: scrape-original NO es el origen de AG-04484/85/86/4385
- `external_source='habihub'` y `province='BARCELONA'` contradicen el flujo del scraper (que apunta a Indonesia/Paraguay)
- Origen ya documentado en sesión 31c: inserciones manuales desde dashboard Supabase

**T3 — Fixes aplicados en `src/scripts/scrapeOriginalWeb.ts`:**
- Import `normalizePropertyFields` desde `@/lib/utils/normalizeProperty`
- Map `'Bali'` → `'Indonesia'` antes de normalizar (Bali = región, no país)
- `normalizePropertyFields({ country, location })` antes del INSERT
- Rechazo explícito (skip + error log) si country queda vacío tras normalización
- `location: normalized.location ?? null` (elimina string vacío)

**T4:** No se tocaron datos existentes ✓

**T5 — Smoke test:**
- `npx tsc --noEmit` limpio ✓
- `npx next build` limpio ✓
- `git status` sin archivos sin stagear ✓

**Archivos modificados:**
- MODIFIED: `src/scripts/scrapeOriginalWeb.ts`
- MODIFIED: `DAILY_LOG.md`

**Commits:** `8560c45` — fix(scrape-original): normalizar campos + validar country obligatorio

**Deploy URL:** https://assets-golden-next.vercel.app (deploy automático tras push a main)

**Próximo paso sugerido:** Cadena FASE-4.H completa (H-P1→H-P4). Próxima prioridad: refactor pipeline leads (Resend — pendiente acceso Atilio) o páginas legales GDPR.

---

### Sesión 2026-05-31d — [FASE-2-P2] Sincronización automática Meta Lead Ads → Google Sheets

**Contexto:** Campaña Marbella-NewBuild-Leads-EN-v1 activa. Leads quedan en Meta y hay que descargarlos manualmente. Implementar pipeline automático completo: pull desde Meta Graph API → parse → append al Google Sheet dedicado, con cron cada 15 min y deduplicación.

**Trabajo hecho:**

**T1 — `src/lib/meta/leadsApi.ts` (NUEVO)**
- `fetchLeadsFromMeta(formId, sinceTimestamp)`: GET a `/{form_id}/leads` con paginación via `paging.next`
- Graph API v19.0, fields: `id,created_time,ad_id,ad_name,field_data`
- Timeout 15s por request, manejo de error con texto de respuesta incluido

**T2 — `src/lib/meta/leadParser.ts` (NUEVO)**
- `parseMetaLead(raw)`: convierte `field_data` (array `{name, values}`) al formato del Sheet
- Mapea: `full_name/first_name/name` → nombre, `email`, `phone_number/phone` → teléfono
- Mapea preguntas custom: "Type of property", "Budget", "Timeline", "Purpose" (case-insensitive)
- `extractVariant(adName)`: deduce variante A/B/C desde el nombre del anuncio via regex

**T3 — `src/lib/meta/syncTracker.ts` (NUEVO)**
- `getLastSyncedTimestamp(formId)`: query en `meta_sync_log` → último sync exitoso. Fallback: 30 días atrás (primer run importa histórico)
- `recordSync(formId, leadsCount, status, details?)`: inserta fila en `meta_sync_log`

**T4 — `src/app/api/leads/sync-meta/route.ts` (NUEVO)**
- GET endpoint protegido con `Authorization: Bearer {CRON_SECRET}`
- Flujo completo: getLastSyncedTimestamp → fetchLeadsFromMeta → parseMetaLead → appendLeadToMetaSheet → recordSync
- Manejo de errores por-lead (no aborta el batch si falla 1)
- Devuelve `{ ok, leadsFound, leadsProcessed, errors }`

**T5 — `src/lib/googleSheets.ts` (MODIFICADO)**
- Nueva función `appendLeadToMetaSheet(lead, spreadsheetId)`: 10 columnas A:J
  Fecha | Nombre | Email | Teléfono | Tipo propiedad | Presupuesto | Timeline | Purpose | Variante | Estado
- A diferencia de `appendLeadToSheets`, lanza error (no lo traga) para que el sync route cuente fallos correctamente

**T6 — `vercel.json` (MODIFICADO)**
- Añadido `crons: [{ path: "/api/leads/sync-meta", schedule: "*/15 * * * *" }]`

**T7 — Migración Supabase (`create_meta_sync_log`)**
- Tabla `meta_sync_log`: id, form_id, last_synced_at, leads_count, status, details, created_at
- Índices en form_id y status

**T8 — `.env.local` (MODIFICADO)**
- Añadidos placeholders vacíos: META_LEADS_SYNC_TOKEN, META_LEADS_FORM_ID, META_LEADS_SHEET_ID, META_LEADS_CRON_SECRET

**T9 — `docs/meta-leads-sync.md` (NUEVO)**
- Guía completa: estructura Sheet, cómo regenerar token, cambiar form_id/sheet_id, sync manual, deduplicación, diagnóstico

**TypeScript:** `npx tsc --noEmit` limpio ✓

**Variables de entorno pendientes de cargar en Vercel (SIN ángulos):**
- `META_LEADS_SYNC_TOKEN` → Sensitive
- `META_LEADS_FORM_ID`
- `META_LEADS_SHEET_ID`
- `CRON_SECRET`

**Archivos creados:**
- CREATED: `src/lib/meta/leadsApi.ts`
- CREATED: `src/lib/meta/leadParser.ts`
- CREATED: `src/lib/meta/syncTracker.ts`
- CREATED: `src/app/api/leads/sync-meta/route.ts`
- CREATED: `docs/meta-leads-sync.md`

**Archivos modificados:**
- MODIFIED: `src/lib/googleSheets.ts`
- MODIFIED: `vercel.json`
- MODIFIED: `.env.local`
- MODIFIED: `DAILY_LOG.md`
- DB MIGRATION: `create_meta_sync_log`

**Commits:** `a847efd` — feat(leads): sincronización automática Meta Lead Ads → Google Sheets

**Próximo paso sugerido:**
1. Cargar las 4 variables nuevas en Vercel (token, form_id, sheet_id, cron_secret) — sin ángulos
2. Redeploy en Vercel (automático tras el push)
3. Sync manual de los 6 leads históricos: `curl -X GET https://assets-golden-next.vercel.app/api/leads/sync-meta -H "Authorization: Bearer {CRON_SECRET}"`
4. Verificar que aparecen las 6 filas en el Sheet dedicado
5. Verificar cron en Vercel Logs → Functions cada 15 min

---

### Sesión 2026-05-31c — [FASE-4.H-P4] Auditoría scrape-original — sesión de diagnóstico, sin cambios

**Contexto:** Verificar si /api/admin/scrape-original era el origen de las 4 propiedades rotas (country=null, province=BARCELONA, external_source='habihub').

**Hallazgos:**

- `scrapeOriginalWeb.ts` scrapes 9 URLs hardcodeadas de la web antigua Lovable (Indonesia/Paraguay). `external_source` = `'scraper-lovable'` (correcto). Province no se setea. Country nunca es null (default 'Indonesia'). `revalidatePropertyPaths()` ya presente desde H-P3.
- `rescrapeDetails.ts` y `rescrapeRetry.ts` solo hacen UPDATEs de precio/descripción. No insertan propiedades nuevas, no tocan country/province.
- **Veredicto: scrape-original NO es el origen de AG-04484/85/86/4385.**

**Origen real identificado:** inserciones directas en el dashboard de Supabase con external_source='habihub' puesto manualmente, province='BARCELONA' (copiado de fuente externa), country=NULL (campo no completado). Las 4 propiedades ya fueron normalizadas en H-P2.

**Código tocado:** ninguno. Sesión de solo lectura.

**Próximo paso sugerido:** cerrar la FASE-4.H. La cadena de fixes H-P1→H-P4 está completa. Próxima prioridad: refactor pipeline leads (Resend — pendiente acceso Atilio) o páginas legales GDPR.

---

### Sesión 2026-05-31b — [FASE-4.H-P3] FIX G + FIX H — revalidate + form country obligatorio

**Contexto:** Prevenir que vuelvan a entrar propiedades con country=null y que las nuevas se vean inmediato.

**Trabajo hecho:**

**T1 — FIX G: revalidatePropertyPaths helper**
- Nuevo `src/lib/cache/revalidateProperties.ts` — `revalidatePropertyPaths()` invalida /, /propiedades, /destinos, /destinos/espana
- Aplicado en: `create-property`, `update-property`, `sync-habihub` (solo !dryRun), `scrape-original`
- `actions.ts`: todas las server actions de properties (toggle, delete, bulk, create) usan el helper
- `updateFeaturedOrder` también invalida / (afecta home carousel)

**T2 — FIX H: country obligatorio + normalización**
- Nuevo `src/lib/utils/normalizeProperty.ts` — `normalizePropertyFields()`: country→trim, province→Title Case, location→normalizeLocation()
- `create-property` y `update-property`: aplican normalizePropertyFields + rechazan 400 si country vacío
- `nueva-propiedad/page.tsx`: campo País → `<select>` required con los 11 países activos
- `propiedades/[id]/edit/page.tsx`: mismo dropdown con fallback para países fuera de lista
- Validación client-side en handleSubmit de ambos formularios
- `npx tsc --noEmit` y `npx next build` limpios ✓

**Archivos creados:**
- CREATED: `src/lib/cache/revalidateProperties.ts`
- CREATED: `src/lib/utils/normalizeProperty.ts`

**Archivos modificados:**
- MODIFIED: `src/app/api/admin/create-property/route.ts`
- MODIFIED: `src/app/api/admin/update-property/route.ts`
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`
- MODIFIED: `src/app/api/admin/scrape-original/route.ts`
- MODIFIED: `src/app/admin/actions.ts`
- MODIFIED: `src/app/admin/nueva-propiedad/page.tsx`
- MODIFIED: `src/app/admin/propiedades/[id]/edit/page.tsx`
- MODIFIED: `DAILY_LOG.md`

**Commits:**
- `2510756` — fix(cache): revalidatePropertyPaths helper
- `d72406d` — fix(admin): country obligatorio + dropdown

**Próximo paso sugerido:**
- Sesión D: Auditar `src/scripts/scrapeOriginalWeb.ts` y `/api/admin/scrape-original` — confirmar si es el flujo que generó las 5 propiedades rotas con external_source='habihub' y country=null. Corregir normalización si es el caso.
- Decisión pendiente Atilio: classification=NULL en 1.309 propiedades.

---

### Sesión 2026-05-31 — [FASE-4.H-P1+P2] Diagnóstico y fix de catálogo inconsistente

**Contexto:** Propiedades nuevas creadas en admin no aparecían en /destinos ni /propiedades, solo en /destacadas. También casing inconsistente en province/location.

**Trabajo hecho:**

- **H-P1 (diagnóstico puro):** Mapeadas 6 rutas públicas, 3 queries centralizadas, 1 formulario admin, sync HabiHub, script syncDestinations. 6 queries SQL de auditoría ejecutadas. Diagnóstico completo en reporte estructurado de sesión.

- **Causa raíz identificada:** Propiedades con `country=NULL` o `country=''` excluidas por filtros ILIKE en todas las rutas de destino/país. Solo aparecían en `/destacadas` porque `getFeaturedProperties()` no filtra por country.

- **Causa raíz origen:** Flujo de importación manual (probablemente scrape-original) que inserta propiedades con `external_source='habihub'` pero sin normalizar country/province, dejando country null/vacío y province en mayúsculas.

- **H-P2 (fix datos):** Todos los fixes aplicados via SQL. NO se tocó código.

**Propiedades corregidas (5 total):**

| ref_code | Fix aplicado |
|---|---|
| AG-04486 | country NULL→España, province BARCELONA→Barcelona |
| AG-04485 | country ''→España, province BARCELONA→Barcelona, classification ''→normal |
| AG-04484 | country ''→España, province BARCELONA→Barcelona, classification ''→normal |
| AG-04385 | country NULL→España (province ya era 'Barcelona' correcto) |
| AG-01424 | province CÓRDOBA→Córdoba (Argentina) |

**Propiedades con location normalizada (14 total):**
- SITGES→Sitges: AG-00803, AG-00804 (2 props)
- TULUM→Tulum: AG-00019, AG-00787, AG-00788, AG-00789, AG-00791, AG-00792, AG-00793 (7 props)
- DUBAI→Dubai: AG-00817, AG-00018, AG-00806, AG-00794, AG-00810 (5 props)

**Backup creado:** tabla `properties_fix_h_p2_backup` (20 filas en Supabase)

**Para revertir si necesario:**
```sql
UPDATE properties p
SET country = b.country, province = b.province,
    location = b.location, classification = b.classification
FROM properties_fix_h_p2_backup b
WHERE p.id = b.id;
```

**Cache:** Endpoint `/api/revalidate` no existe. Se hizo commit vacío para forzar redeploy y purga de caché ISR.

**Archivos tocados:**
- MODIFIED: `DAILY_LOG.md`

**Commits:**
- (commit vacío de revalidate — ver hash abajo)

**Próximo paso sugerido:**
- Sesión C: Fix formulario admin `/admin/nueva-propiedad` — validar `country` como campo obligatorio, normalizar casing de province antes de guardar.
- Sesión D: Investigar `/api/admin/scrape-original` — confirmar si es el flujo que genera `external_source='habihub'` sin normalizar country/province. Corregir si es el caso.
- Pendiente decisión Atilio: clasificación de las 1.309 propiedades con `classification=NULL`.

---
Formato: fecha, contexto, decisiones tomadas, archivos tocados,
commits, próximo paso sugerido.

---

### Sesión 2026-05-29d — [FASE-4.B-P3] Eliminar TODA referencia a Nest Seekers

**Contexto:** Atilio pidió quitar Nest Seekers International. Eliminación estaba parcial — /partners seguía mostrando "Partner oficial" + meta description con claim.

**Trabajo hecho:**

- **T1 — Grep exhaustivo:** 4 archivos con menciones `nest.?seekers`. User-visible: 2 archivos. Técnico/DB-column: 2 archivos (no tocar).

- **T2 — `src/app/(public)/partners/page.tsx`:**
  - Eliminado bloque completo `{/* Nest Seekers banner */}` (sección py-10 con h2 "Nest Seekers International", descripción "Alianza estratégica..." y botón "Saber más")
  - Página queda: hero → grid de partners por país → CTA colaborar (sin sección intermedia)

- **T3 — Metadata `/partners`:**
  - `description` reemplazada: `'Red global de colaboradores y agencias inmobiliarias independientes en 11 países. Profesionales de primer nivel para operaciones de lujo internacional.'` (159 chars)
  - `og:description`/`twitter:description` heredan el nuevo valor automáticamente (Next.js)

- **Extra — `src/app/(public)/noticias/page.tsx`:**
  - Noticia estática #2 ("Assets Golden refuerza su alianza estratégica con Nest Seekers International") reemplazada por nueva noticia sobre expansión de red de partners independientes

- **T4 — Grep final:** 0 menciones user-visible. Solo resta `nestseekers_url` en `types/index.ts` y `scripts/import-properties.ts` (nombre de columna DB — no modificar sin migración DB).

- **T5:** `getPartners()` intacto → Carmen Artero y demás partners siguen apareciendo ✓

- **T6:** Sin imágenes NS en `/public` ✓

- **Build:** `npx next build` limpio, 1114 páginas generadas, /partners como `○ Static (revalidate 1h)` ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/partners/page.tsx`
- MODIFIED: `src/app/(public)/noticias/page.tsx`

**Commits:**
- `2df6d2a` — feat(partners): eliminar referencia a Nest Seekers del hero
- `7c0cbba` — chore(seo): actualizar metadata /partners sin claim Nest Seekers

**Próximo paso sugerido:** Smoke test en producción tras deploy Vercel: `grep -i "nest seekers"` en HTML de /partners y /noticias → 0 resultados. Verificar visual /partners (sin tarjeta azul oscuro de "Partner oficial").

---

### Sesión 2026-05-29c — [FASE-4.G-P3] Fix stat "Contactados hoy" + tracking status_changed_at

**Contexto:** Stat "Contactados hoy" mostraba 0 con 2-3 leads en status='contacted'. Causa raíz: query filtraba por `created_at >= startOfToday` (UTC), nunca matcheaba leads creados en días previos.

**Trabajo hecho:**

- **T1 — Migración DB** (`add_status_changed_at_to_leads`):
  - `ALTER TABLE leads ADD COLUMN status_changed_at TIMESTAMPTZ DEFAULT now()`
  - Backfill todos los existentes con `created_at`
  - Trigger `leads_status_changed_at_trigger` BEFORE UPDATE: actualiza `status_changed_at = now()` solo cuando `NEW.status IS DISTINCT FROM OLD.status`
  - Índice parcial `idx_leads_status_changed_at` en `status != 'new'`
  - One-time fix SQL: los 3 leads en `contacted` tenían `created_at` de mayo 13-21 pero fueron cambiados hoy (sesión P2) → `UPDATE ... SET status_changed_at = NOW() WHERE status = 'contacted'`

- **T2 — Fix `/api/admin/leads/stats/route.ts`:**
  - Añadido `getMadridTodayBounds()` — calcula límites UTC del día Madrid dinámicamente (CEST=UTC+2, CET=UTC+1) sin librerías externas
  - `contactedToday` ahora filtra por `status_changed_at >= todayStart && < todayEnd`
  - SELECT añade `status_changed_at` al query

- **T3 (bonus) — Enriquecer audit log en PATCH `/api/admin/leads/[id]/route.ts`:**
  - Fetch del lead antes del UPDATE para capturar `old_status`/`old_score`
  - `metadata` incluye `old_status`, `new_status`, `old_score`, `new_score` cuando cambian

- **T4 — Smoke test SQL:** `contacted_today = 3` confirmado via SQL equivalente en Supabase ✓

**Archivos tocados:**
- MODIFIED: `src/app/api/admin/leads/stats/route.ts`
- MODIFIED: `src/app/api/admin/leads/[id]/route.ts`
- DB MIGRATION: `add_status_changed_at_to_leads`

**Commits:**
- `e75c0e5` — chore(db): add status_changed_at column + trigger to leads
- `3e5d7ff` — fix(stats): "Contactados hoy" usa status_changed_at en TZ Europe/Madrid

**Próximo paso sugerido:** Smoke test en producción: (1) verificar que el card "Contactados hoy" muestra 3, (2) cambiar un lead a `in_progress` → esperar que baje a 2, (3) cambiar otro de `new` a `contacted` → sube a 3 de nuevo.

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
