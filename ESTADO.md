# ESTADO ACTUAL — Assets Golden

> ⚠️ CÓMO USAR ESTE ARCHIVO (para agentes IA y humanos):
> - Esta es la foto del estado VIGENTE. Leerla al arrancar para tener contexto.
> - Se SOBRESCRIBE cuando algo cambia (no se acumula como un diario).
> - El historial va en DAILY_LOG.md; el backlog en PENDIENTES.md.
> Última actualización: 29/06/2026

## Qué es
Web inmobiliaria internacional bilingüe (ES/EN), Next.js 15 App Router SSR sobre Vercel + Supabase Pro. Cliente: Atilio Montironi (+ socio Joan). Proveedor: IBott (Ivan). Marca: "Inmobiliaria Internacional de Propiedades Exclusivas".

## Stack
Next.js 15 / React 19 / TypeScript · Tailwind v4 (config en @theme de globals.css, NO hay tailwind.config) · Supabase PostgreSQL (project mromkwpqrxpxbbxhdofs, Pro) · Vercel (project prj_7hJoYjOpivAhIlMdaioatTAlNl1X, team team_DTA5TQKA2NRoCwrnyLgeudcw) · PDF Puppeteer + chromium-min v143.0.4 · Leads a Google Sheets · Tipografía: Playfair Display (títulos) + DM Sans (cuerpo) vía next/font.

## Producción
- Web: https://assetsgolden.com (dominio conectado, en producción).
- Builds Vercel ~107s. Verificar prod con SHA correcto, no con "Redeploy".

## Catálogo (al 26/06/2026)
- 2.637 propiedades · 2.470 visibles · 52 destacadas · 12 países.
- Distribución: España 2.572, Indonesia 35, México 9, EEUU 7, EAU 5, Argentina 3, y 1 c/u en Rep. Dominicana, Ecuador, Costa Rica, Reino Unido, Grecia, Paraguay.
- Sync HabiHub operativo: oculta no borra (hidden_by_sync), scope external_source='habihub' + external_id numérico + featured!=true. Dry-run obligatorio antes de sync real.

## Contenido
- Blog: 30 posts publicados (17 ES + 13 EN). Patrón: filas separadas por idioma (columnas _en son legacy, vacías). Categorías guías/guides, inversion/investment, zonas/locations.
- Destinos: 12 activos (auto-creación al cargar país nuevo). Carrusel dinámico en home.

## Accesos / roles
- Admin: Atilio + socio Joan (mismo nivel). Agentes: 3 activos, acceso solo a /portal.
- Portal de agentes con PDF white-label.

## SEO — estado real (29/06)
- Bases técnicas: muy buenas (auditoría CC 83/100; técnico 92, schema 95).
- Posicionamiento real: incipiente. Google indexa parcialmente (esencialmente la home) y aún cachea el title viejo ("lujo") hasta recrawl. GSC verificación/recrawl PENDIENTE. Horizonte 6–12 meses.
- Coherencia de marca: llms.txt ya rebrandeado (exclusivas, sin Nest Seekers) y H1 del home ES con keyword. El sitemap incluye `/destinos/[país]`. Falta el barrido de estáticos/metadata por residuos "lujo".

## Reglas críticas (no romper)
- Leads: solo APPEND, nunca borrar/sobrescribir.
- translateGeography.ts: país nuevo debe sumarse a COUNTRY_MAP/ISO o se muestra en español en EN.
- Ruta repo: C:\Users\Asus\Desktop\proyecto\AssetsGikden Full\assets-golden-next
- Nunca confiar en self-reports de Claude Code: verificar en prod (Supabase/Vercel MCP).
