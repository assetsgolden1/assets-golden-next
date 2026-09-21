# ESTADO ACTUAL — Assets Golden

> ⚠️ CÓMO USAR ESTE ARCHIVO (para agentes IA y humanos):
> - Esta es la foto del estado VIGENTE. Leerla al arrancar para tener contexto.
> - Se SOBRESCRIBE cuando algo cambia (no se acumula como un diario).
> - El historial va en DAILY_LOG.md; el backlog en PENDIENTES.md.
> Última actualización: 20/09/2026

## Qué es
Web inmobiliaria internacional bilingüe (ES/EN), Next.js 15 App Router SSR sobre Vercel + Supabase Pro. Cliente: Atilio Montironi (+ socio Joan). Proveedor: IBott (Ivan). Marca: "Inmobiliaria Internacional de Propiedades Exclusivas".

## Stack
Next.js 15 / React 19 / TypeScript · Tailwind v4 (config en @theme de globals.css, NO hay tailwind.config) · Supabase PostgreSQL (project mromkwpqrxpxbbxhdofs, Pro) · Vercel (project prj_7hJoYjOpivAhIlMdaioatTAlNl1X, team team_DTA5TQKA2NRoCwrnyLgeudcw) · PDF Puppeteer + chromium-min v143.0.4 · Leads a Google Sheets · Tipografía: Playfair Display (títulos) + DM Sans (cuerpo) vía next/font.

## Producción
- Web: https://assetsgolden.com (dominio conectado, en producción).
- Builds Vercel: más lentos desde el ISR (prerenderiza ~2.600 fichas). Verificar prod con SHA correcto, no con "Redeploy".
- **Caché/ISR (29/06, revisado 26/07)**: 21 rutas públicas son estáticas/ISR (**revalidate 12h listados / 24h fichas y blog** — subido el 13/07 por el límite de ISR Writes del plan) — home, fichas `propiedades/[slug]` (~2.600, SSG), blog (listado/posts/categorías), servicios, sobre-nosotros, equipo, partners, destinos listado, legales, etc. Se sirven desde el CDN (x-vercel-cache PRERENDER/HIT). Las que usan `searchParams` (propiedades listado, destinos/[slug], inversiones, promociones) siguen dinámicas (correcto). Patrón: lecturas públicas con `createStaticClient` (sin cookies) + `setRequestLocale`; root layout con lang estático + HtmlLangSync. **Invalidación:** `revalidatePropertyPaths()` revalida por locale (`/es/...`, `/en/...`) — sin el prefijo NO invalida nada (fix 26/07).
- **Imágenes**: las PROPIAS vía Supabase Image Transformation (WebP/resize, ~−90% egress). Las del **feed HabiHub (medianewbuild): 70.819 fotos en 2.583 props** se sirven desde el 27/08 vía **proxy wsrv.nl** (WebP+resize) — medido en prod: listado 25.234 KB → 696 KB (−98%), Lighthouse mobile del listado 74→82 y LCP 13,4 s→4,7 s. Todo pasa por el helper `lib/utils/optimizedImage.ts`; **revertir = vaciar `PROXIED_HOSTS`**. Re-host propio a Supabase pendiente (obliga a tocar el sync). **Desde el 05/09 TODAS las imágenes propias viven en el proyecto principal** (las 902 del proyecto Lovable `wloneprkibfjioxwypaw` se re-hostearon bajo `migrated-lovable/`; Storage 4,24 GB). Ya no hay hosts Supabase secundarios en config ni en BD. OG image por defecto en `public/og/default.jpg`.

## Catálogo (al 27/07/2026)
- **2.544 propiedades visibles · 13 países** (incluye Brasil, alta manual de Atilio el 26/07).
- Tope esperado (Ivan, 29/06): NO crecerá mucho más — a lo sumo ~500 más (~3.200 máx). Por eso el prerender SSG de las fichas en el build es aceptable; NO hace falta limitar `generateStaticParams`.
- **EEUU: 69 propiedades** — 62 son promociones de obra nueva de Miami/Florida importadas de Cervera el 27/07 (`external_source='cervera'`, `external_id` con prefijo `cv-`).
- **Dos fuentes automatizadas, aisladas entre sí:**
  - *HabiHub* (España): oculta no borra (hidden_by_sync), scope `external_source='habihub'` + external_id numérico + featured!=true. Dry-run obligatorio antes de sync real.
  - *Cervera* (Miami, obra nueva): `npm run cervera -- extract | report | load | renders`. Idempotente por `external_id`. El prefijo `cv-` es OBLIGATORIO: la columna es UNIQUE global y sin él los ids chocan con los del feed HabiHub. Ver `docs/plan-carga-cervera.md`.

## Contenido
- Blog: 30 posts publicados (17 ES + 13 EN). Patrón: filas separadas por idioma (columnas _en son legacy, vacías). Categorías guías/guides, inversion/investment, zonas/locations.
- Destinos: 12 activos (auto-creación al cargar país nuevo). Carrusel dinámico en home.

## Migración de cuentas (en curso, desde 05/09/2026)
Objetivo: entregar la web a Atilio y Joan sobre cuentas propias (una cuenta de email nueva creada por Ivan es titular de todo; Ivan conserva acceso con ella). Estrategia: **transfer** de proyecto Supabase y Vercel, no clonado. Fase 0 (código/datos) hecha 05/09. **Fase 2 hecha 20/09: el proyecto Supabase ya vive en la org de AG `ssgcgkjdcweuabyvswbq` (Pro)**; misma URL y claves. **Fase 3 hecha 20/09: repo en `assetsgolden1/assets-golden-next` y proyecto Vercel en el team nuevo (Pro), Git reconectado.** **Google hecho 20/09** (GCP `eternal-coral-509218-b6`, service account y 2 Sheets propios de AG). **Upstash migrado 20/09; Resend ya estaba en cuenta de AG.** Todos los servicios están en cuentas de Assets Golden salvo Meta (BM de Iván, fuera de alcance). Faltan E2E, rotación de claves y documento de entrega. Plan, decisiones y checklist en `docs/plan-migracion-cuentas-2026-09.md`. n8n eliminado del código el 05/09 (nunca se usó). Los 3 workflows de Actions apuntan a `https://assetsgolden.com`.

## Accesos / roles
- Admin: Atilio + socio Joan (mismo nivel). Agentes: 4 reales activos + 1 de prueba (`demo.agente@assetsgolden.com`, creado 06/07 para validar el PDF; borrar cuando no se use). Acceso solo a /portal.
- Portal de agentes con PDF white-label. Desde 06/07: el agente elige hasta 10 fotos (orden = portada) al descargar; header del PDF navy (logo visible); imágenes vía transform Supabase. Pendiente validación humana E2E en prod.

## SEO — estado real (auditoría completa 26/08)
- **Score 26/08: 67/100** (7 especialistas sobre prod + GA4). Informe y plan en `docs/seo-audit-2026-08-26/`. La base técnica de junio sigue sólida (técnico 82; canonicals/redirects/security/SSR impecables), pero la auditoría profunda encontró: **blog EN roto** (13 posts huérfanos, 12 URLs 404 en el sitemap), versión EN (~2.800 págs) no enviada como `<loc>` + `lang="es"` en /en + schema EN con URLs ES, canonical de paginación que deja ~2.576 fichas sin enlazado rastreable, imágenes del feed medianewbuild sin transform (13,4 MB el listado, LCP mobile 13–14 s lab), fichas Cervera con inglés crudo en ES y thin content (contenido 54/100).
- **Tráfico real (GA4, 17/06→25/08)**: 305 usuarios; orgánico ya es el 2º canal (70 usuarios, 23%, 127 sesiones) y el de mejor engagement (121 s vs 57 s del paid). Long-tail activo (fichas Miami ya reciben visitas). Demanda nórdica detectada (visitantes traduciendo a sueco/polaco). **GA4 sin eventos clave configurados** — no se mide ninguna conversión. Propiedad GA4: G-5E27WGKEDF, gateada por consentimiento (subconteo estructural).
- **GSC (revisado 27/08 por Iván, exports analizados)**: la indexación EXPLOTÓ tras el sitemap de junio: **5.462 páginas indexadas** (504 a inicios de julio → 3.271 → 5.462; ambos idiomas). Sin indexar ~2.812 estables: 878 404 (a identificar), 808 redirecciones (los 308 legacy, normal), **532 "Google eligió otra canónica"** (consistente con lang="es"+schema ES en /en — lo ataca el fix de lang), 139 rastreadas sin indexar (thin), 14+1 normales. Performance (17/06→26/08): 145 clics / 8,3K impresiones, impresiones ×7 (206/sem jun → ~1.400/sem ago), posición media ~9-14. Marca domina clics; non-brand en "striking distance" (pos 10-40). EEUU: 1.563 impresiones con 0,38% CTR. Propiedad bajo assetsgolden1@gmail.com (Atilio). Sitemap nuevo (5.604 URLs) reenviado 27/08.
- Coherencia de marca: OK desde 29/06 (0 residuos "lujo"/Nest Seekers user-facing). H1 home ES = "Propiedades exclusivas, sin fronteras".

## Privacidad / GDPR
- Banner de cookies real = vanilla-cookieconsent v3 (Aceptar/Rechazar/Personalizar, ES, 3 categorías), montado en RootLayout vía `CookieConsentInit`.
- GA4 y Meta Pixel se cargan SOLO tras consentimiento (analytics / marketing respectivamente). Banner legacy duplicado eliminado (29/06).
- Textos legales: VALIDADOS por Atilio (29/06). GDPR técnico + legal cerrado para escalar ads.
- Supabase Auth: leaked-password protection ACTIVADO (29/06).

## Reglas críticas (no romper)
- Leads: solo APPEND, nunca borrar/sobrescribir.
- translateGeography.ts: país nuevo debe sumarse a COUNTRY_MAP/ISO o se muestra en español en EN.
- Ruta repo: C:\Users\Asus\Desktop\proyecto\AssetsGikden Full\assets-golden-next
- Nunca confiar en self-reports de Claude Code: verificar en prod (Supabase/Vercel MCP).
