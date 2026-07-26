# ESTADO ACTUAL — Assets Golden

> ⚠️ CÓMO USAR ESTE ARCHIVO (para agentes IA y humanos):
> - Esta es la foto del estado VIGENTE. Leerla al arrancar para tener contexto.
> - Se SOBRESCRIBE cuando algo cambia (no se acumula como un diario).
> - El historial va en DAILY_LOG.md; el backlog en PENDIENTES.md.
> Última actualización: 27/07/2026

## Qué es
Web inmobiliaria internacional bilingüe (ES/EN), Next.js 15 App Router SSR sobre Vercel + Supabase Pro. Cliente: Atilio Montironi (+ socio Joan). Proveedor: IBott (Ivan). Marca: "Inmobiliaria Internacional de Propiedades Exclusivas".

## Stack
Next.js 15 / React 19 / TypeScript · Tailwind v4 (config en @theme de globals.css, NO hay tailwind.config) · Supabase PostgreSQL (project mromkwpqrxpxbbxhdofs, Pro) · Vercel (project prj_7hJoYjOpivAhIlMdaioatTAlNl1X, team team_DTA5TQKA2NRoCwrnyLgeudcw) · PDF Puppeteer + chromium-min v143.0.4 · Leads a Google Sheets · Tipografía: Playfair Display (títulos) + DM Sans (cuerpo) vía next/font.

## Producción
- Web: https://assetsgolden.com (dominio conectado, en producción).
- Builds Vercel: más lentos desde el ISR (prerenderiza ~2.600 fichas). Verificar prod con SHA correcto, no con "Redeploy".
- **Caché/ISR (29/06, revisado 26/07)**: 21 rutas públicas son estáticas/ISR (**revalidate 12h listados / 24h fichas y blog** — subido el 13/07 por el límite de ISR Writes del plan) — home, fichas `propiedades/[slug]` (~2.600, SSG), blog (listado/posts/categorías), servicios, sobre-nosotros, equipo, partners, destinos listado, legales, etc. Se sirven desde el CDN (x-vercel-cache PRERENDER/HIT). Las que usan `searchParams` (propiedades listado, destinos/[slug], inversiones, promociones) siguen dinámicas (correcto). Patrón: lecturas públicas con `createStaticClient` (sin cookies) + `setRequestLocale`; root layout con lang estático + HtmlLangSync. **Invalidación:** `revalidatePropertyPaths()` revalida por locale (`/es/...`, `/en/...`) — sin el prefijo NO invalida nada (fix 26/07).
- **Imágenes**: servidas vía Supabase Image Transformation (WebP/resize, ~−90% egress) en todo el sitio; helper `lib/utils/optimizedImage.ts`.

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

## Accesos / roles
- Admin: Atilio + socio Joan (mismo nivel). Agentes: 4 reales activos + 1 de prueba (`demo.agente@assetsgolden.com`, creado 06/07 para validar el PDF; borrar cuando no se use). Acceso solo a /portal.
- Portal de agentes con PDF white-label. Desde 06/07: el agente elige hasta 10 fotos (orden = portada) al descargar; header del PDF navy (logo visible); imágenes vía transform Supabase. Pendiente validación humana E2E en prod.

## SEO — estado real (29/06)
- Bases técnicas: muy buenas (auditoría CC 83/100; técnico 92, schema 95).
- Posicionamiento real: incipiente. Google indexa parcialmente (esencialmente la home) y aún cachea el title viejo ("lujo") hasta que procese el recrawl. Horizonte 6–12 meses.
- **GSC**: la propiedad (URL-prefix `https://assetsgolden.com/`) está verificada bajo la cuenta **assetsgolden1@gmail.com (Atilio)**, NO bajo ivalberini. El 29/06 se envió el sitemap por primera vez y se solicitó re-indexación de la home. Sitemap sano (HTTP 200, XML válido).
- Coherencia de marca: VERIFICADO LIMPIO (29/06) — 0 residuos "lujo"/"Nest Seekers" user-facing en código, i18n, public/, blog y destinos. llms.txt rebrandeado, sitemap incluye `/destinos/[país]`. H1 home ES = "Propiedades exclusivas, sin fronteras".

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
