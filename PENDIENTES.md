# PENDIENTES — Assets Golden (backlog vivo)

> ⚠️ CÓMO USAR ESTE ARCHIVO (para agentes IA y humanos):
> - Este es el backlog VIVO. Al arrancar una sesión, leerlo para saber qué falta.
> - Al cerrar una sesión: tachar/quitar lo resuelto y agregar lo nuevo que surja.
> - El detalle de CÓMO se hizo cada cosa va en DAILY_LOG.md, no acá.
> - El estado actual del proyecto (números, stack) va en ESTADO.md, no acá.
> Última actualización: 27/08/2026

Leyenda esfuerzo: S=minutos · M=una sesión · L=varias/continuo.
Responsable: Ivan (panel/manual) · CC (Claude Code) · Atilio (cliente) · Claude (Claude.ai).

## 0. Lo más urgente
0. (RESUELTO 07/08: el deploy estaba BLOCKED por el límite de la cuenta; Iván lo desbloqueó y el build `da13a95` quedó READY. Atribución UTM **verificada en producción**. Ojo con ese límite a futuro.)
0b. [Ivan decide] **`/mi-demanda` está ROTO en producción:** `/api/demands` inserta en una tabla `demands` que **no existe** en Supabase → cada envío devuelve 500 y el lead se pierde (ni siquiera llega al Sheet). Hay que decidir dónde persisten esas solicitudes: crear la tabla `demands`, o mandarlas a `leads` con `source='demand_form'` mapeando propertyType/budget/timeline/features. No lo toqué porque es decisión de producto.
1. (✅ RESUELTO 27/08: Iván revisó GSC y exportó Coverage+Performance. **5.462 páginas indexadas** (era ~solo la home en junio); impresiones ×7 desde junio; el title nuevo ya rankea para "assets golden" en pos 1. Datos analizados en DAILY_LOG 27/08 y ESTADO. Nuevo pendiente: identificar las 878 URLs 404 — exportar el detalle del motivo "No se ha encontrado (404)" en GSC.)

## 1. SEO / Posicionamiento
- **AUDITORÍA COMPLETA 26/08 — score 67/100. Plan priorizado en `docs/seo-audit-2026-08-26/ACTION-PLAN.md`** (informe + 8 secciones de detalle en la misma carpeta). Los críticos/altos:
  - (✅ CERRADO 27/08 — **Blog EN + sitemap**: links/canonical/JSON-LD/breadcrumbs de blog ahora locale-aware; sitemap reescrito: 5.604 URLs (2.800 `<loc>` /en nuevas), posts EN bajo /en/blog, lastmod real de BD (1.946 fechas distintas), 4 categorías de blog, x-default, sin changefreq/priority. Verificado con build + server local. Ver DAILY_LOG 27/08.)
  - (✅ CERRADO 27/08 cont. — **lang + schema EN**: script inline bloqueante fija `lang` antes del paint (server-side imposible sin volver dinámico el sitio: `unstable_rootParams` removido en Next 16); JSON-LD de fichas con `@id`/`url`/breadcrumbs `/en` + `inLanguage`; `WebSite.url` locale-aware. Debería drenar las 532 "Google eligió otra canónica" de GSC — monitorear. Ver DAILY_LOG 27/08 cont.)
  - [CC·S] Canonical de paginación de /propiedades apunta a página 1 → ~2.576 fichas sin enlazado interno rastreable.
  - [CC·M] Imágenes del feed medianewbuild SIN transform Supabase: listado carga 13,4 MB, LCP mobile 13–14 s (lab). + El banner de cookies es el elemento LCP de home/listado.
  - [CC·M] Fichas Cervera/Miami: ES con amenidades en inglés crudo y "mast_capital" sin formatear; thin content (<300 palabras) en varias manuales; plantilla HabiHub repetida (riesgo scaled content).
  - [Ivan+CC·S] **GA4 sin eventos clave** (cero conversiones configuradas: ni leads, ni WhatsApp, ni PDF).
  - [CC·S] Cifras inconsistentes: "2.622 propiedades" (FAQ) vs 2.364 (schema) vs 11/12/13 países según página.
- [Atilio+Ivan·L] Autoridad/backlinks: menciones, prensa, portales, partners. Lo que falta vs competidores. (Sin cambios desde junio; sigue siendo el techo estructural.)
- (ISR cerrado 29/06: 21 rutas públicas estáticas/ISR. Las 8 que siguen ƒ — propiedades listado, destinos/[slug], destinos/espana, inversiones, promociones, propiedades/[slug]/[ciudad] — usan `searchParams` (filtros) → inherentemente dinámicas, no cacheables. Es correcto, no es pendiente.)

## 2. Blog / Contenido
- [Claude·L] Fase C blog EN: 7 posts restantes a 1.500–2.000 palabras (van 3 de 10).
- [Claude·S] Corregir post ES comprar-piso-espana-siendo-extranjero-2026 (Golden Visa/NLV).
- [Claude+Ivan·L] Plan editorial por clústeres: 4–6 art/mes, guías por zona/fiscalidad/proceso, con enlazado a fichas y destinos.

## 3. Web / Técnico
- [Ivan·S] **VALIDAR PDF del portal end-to-end en prod (selector de fotos + marca AG).** Desde el 07/08 el PDF sale con logo Assets Golden y el contacto del asesor; verificar ambas cosas en la misma pasada. El 06/07 se deployó el selector de fotos (hasta 10) + fix del logo. Falta la validación humana en prod.
  - Acción: entrar a `/portal` en PRODUCCIÓN con `demo.agente@assetsgolden.com` (agente de prueba creado el 06/07), abrir una propiedad, **elegir fotos (hasta 10)** y descargar el PDF. Verificar: portada correcta, orden de fotos = orden de selección, galería paginada OK, **logo visible** (header navy), precio/specs/agente/footer OK, sin páginas rotas.
  - Cuidados: (a) Chromium clavado en `@sparticuz/chromium-min@143.0.4` — si Vercel cambia el runtime de Node o el paquete se actualiza, puede romper el binario. (b) Probar SÍ O SÍ en prod, NO en local (el binario/entorno difiere). (c) `serverExternalPackages` en next.config mantiene puppeteer server-side — no romper esa config.
  - Al terminar: desactivar/borrar el demo agent si no se necesita más (sin tocar los otros 6 usuarios).
  - **Aprovechar la misma sesión** para ver el acceso a Expertos de Gestión (tarjeta en la home del portal + link "Gestoría" en el header) — añadido el 07/08, sin verificación visual todavía.
- (RESUELTO 07/08: Iván confirmó que el Nº de experto **3440 es compartido** por todos los asesores. La implementación actual —constante, no columna por agente— es la correcta.)
- [Atilio+CC·S] Criterios de /inversiones (definición de Atilio) + verificar filtro.
- (CERRADO 03/07: imágenes rotas por fuente >25 MB del proyecto secundario `wloneprkibfjioxwypaw`. Escaneadas las 58 props → 37 con rotas (204 imgs) → todas re-hosteadas comprimidas al proyecto principal + BD actualizada. Re-escaneo: 0 rotas. Ver DAILY_LOG 03/07.)
- [CC·S opcional] **Prevención:** fijar `file_size_limit` al bucket `property-images` del proyecto principal (hoy sin límite) para que subidas manuales grandes no vuelvan a romper el transform. Verificar que el flujo admin comprime siempre.

## 4. Infraestructura / Seguridad / Datos
- (Aceptados, sin acción: buckets con listing, get_property_filters, pg_trgm, leads_public_insert.)

## 5. GDPR / Legal
- (Cerrado 29/06: Atilio validó los textos legales de cookies/privacidad; banner + gateo GA4/Pixel ya estaban. GDPR técnico + legal OK para escalar ads.)

## 6. Operación / Cliente
- (CERRADO 27/07: **Carga Cervera/Miami — 62 promociones importadas** vía `npm run cervera` (WP REST API, no scraping). Ver DAILY_LOG 27/07 y `docs/plan-carga-cervera.md`.)
  - [Ivan·S] **Decidir 4 posibles duplicados:** The St. Regis Residences (probable falso positivo: AG-00808 es de Nueva York) · The Rider Residences (duplicado real de AG-00805) · Domus Brickell Center y Domus Brickell Park (ambiguo vs AG-00020). Están detectadas y NO cargadas.
  - [Ivan·S] **Decidir 3 sin ciudad** (Seven Park, Casa Murano Las Olas, 600 Miami World Center): sus fichas no publican dirección. Cargarlas igual (`--allow-no-city`) o completarlas a mano.
  - [Ivan decide] Los brochures/planos PDF de las carpetas de Dropbox NO se importan: AG no tiene campo de adjuntos. Habría que agregarlo si interesa.
  - (10 propiedades quedan con 1-3 fotos: 5 tienen carpetas de 4,6-28 GB y 5 con links que devuelven HTML en vez de ZIP. Irrecuperables automáticamente; el endpoint de listado de Dropbox da 403.)

## 7. Higiene / deuda técnica baja

### 7a. Deuda de lint pre-existente — ✅ CERRADA (01/07)
(Los 4 items resueltos: `<a>`→`<Link>`, `<img>`→`<Image>`, `set-state-in-effect`, `any` casts. Baseline 26 err/3 warn → eslint 0/0, tsc exit 0. Detalle en DAILY_LOG 01/07.)
- [Ivan·S] **Pendiente de testeo manual:** el refactor de `set-state-in-effect` cambió el fetch de ciudades a async con guard de cancelación → probar "cambiar país → recarga ciudades" en crear/editar propiedad (admin) y en los filtros del portal.

### 7b. Datos / higiene latente
- (CERRADO Y DEPLOYADO 05/07 — opción 2 del informe: **990 slugs habihub legacy renombrados** a `slugify(título)-external_id` + columna `legacy_slug` + redirect 308 locale-aware en la ficha. Deploy tomó 3 iteraciones por un 500 en render on-demand — causa real: faltaba `setRequestLocale` en la ficha, no el redirect. **Verificado en prod: legacy ES/EN → 308 → canónico → 200.** Ver DAILY_LOG 05/07.)
  - [opcional] Manejar el redirect también en `/propiedades/[slug]/[ciudad]` si esas URLs importan. Monitorear en GSC la migración de URLs viejas→nuevas.
- (3 props con external_id UUID pero foto de medianewbuild quedaron como 'habihub' — ambiguas, podrían ser del feed; NO re-etiquetadas para no arriesgar duplicados. CC puede revisarlas caso por caso si se quiere; bajo valor.)

## Hecho reciente (referencia rápida; el detalle está en DAILY_LOG.md)
- 07/08: **Acceso a Expertos de Gestión en el portal** — botón en la home del portal + link en el header, con el Nº 3440 y "copiar". El autorelleno no es posible: su login no lee la query string (verificado sobre su JS).
- 07/08: **PDF del portal con marca Assets Golden** — el white-label (en uso por 3 colaboradores externos) pasa a estar OFF por defecto vía flag `agents.white_label_enabled`, reversible desde el panel sin deploy. El contacto del asesor se mantiene siempre.
- 07/08: **Atribución UTM en leads** (WEB-ATRIB-1) — 7 columnas en leads+demands, captura first-touch en sessionStorage, los 3 forms la envían, columna Fuente del Sheet con la campaña. Pixel acotado a la web pública (excluye /admin y /portal). **Verificado en producción** (Supabase + Sheet).
- 27/07: **Cervera cargado** — 62 promociones de Miami vía WP REST API (no scraping). Script `npm run cervera` re-ejecutable. Quedan 4 duplicados y 3 sin ciudad a decidir por Iván.
- 13/07: **Fix ISR Writes de Vercel** — subidos los intervalos de `revalidate` (estaban todos en 1h): fichas/blog/partners/consejos/noticias → 24h (12 páginas), listados/home/destinos → 12h (7 páginas). `equipo` (24h) y `sobre-nosotros` (1h) sin tocar. Motivo: 644K ISR Writes vs límite de 200K del plan. Sin cambios de lógica ni de `dynamicParams`. Ver DAILY_LOG 13/07.
- 06/07: **Portal PDF — selector de fotos (hasta 10) + fix logo invisible + optimización de imágenes.** El agente ahora elige qué fotos y en qué orden (1ª = portada) vía modal; backend valida índices contra las fotos reales (anti-SSRF). Header del PDF pasó a navy para que el logo blanco de AG se vea (bug de prod). Imágenes del PDF vía transform Supabase (WebP/resize). Creado demo agent `demo.agente@assetsgolden.com` para validar. Falta la validación humana en prod (ver sección 3).
- 05/07: slugs 7b CERRADO Y DEPLOYADO (opción 2) — 990 renombrados + redirect 308. Deploy tomó 3 iteraciones (fix real: `setRequestLocale` en la ficha). Verificado en prod: legacy → 308 → canónico → 200.
- 03/07: imágenes rotas del proyecto secundario CERRADO — 37 props / 204 imgs (>25 MB → transform 400) re-hosteadas comprimidas al principal + BD actualizada. Re-escaneo: 0 rotas de 58 props.
- 01/07: AG-00811 — 10 fotos rotas (fuente >25 MB → transform 400) arregladas: re-hosteadas comprimidas al proyecto principal + BD actualizada (22/22 OK). Falta escanear las otras 57 del proyecto secundario (ver sección 3).
- 01/07: deuda de lint 7a CERRADA (Link/Image/set-state/any → eslint 0/0, tsc OK) + informe de los 990 slugs habihub legacy (`docs/slugs-habihub-desincronizados.md`, sin tocar slugs). Queda: Ivan testea flujo ciudades/filtros + decide fix de slugs.
- 29/06: limpieza de datos (vía MCP/script, sin commit) — (1) **51 props re-etiquetadas** `external_source` habihub→manual (las que tenían id null/UUID + foto nuestra de Supabase; las ~21 BCN/Madrid + ~30 más): ahora fuera del scope del cron de sync para siempre. Las 3 con foto del feed se dejaron (ambiguas). (2) **177 imágenes huérfanas borradas** de property-images (437 MB liberados: 3.222→2.785 MB) vía script con dry-run + sanity-check + Storage API. Verificado el bucket post-borrado.
- 29/06: quick-wins finales (8950e88) — (1) CTAs del hero a `<Link>` locale-aware (antes `<a>`, no locale-aware + lint); (2) `compressImage` en TeamManager y destinos/[slug]/edit (consistencia con crear/editar propiedad). + ANÁLISIS (sin tocar): 177 imágenes huérfanas (437 MB) en property-images, listo para borrar con OK; ~21 props "mal marcadas habihub" identificadas (listados reales BCN/Cataluña/Madrid, label external_source mal, fuera del scope del sync).
- 29/06: ISR completo (577f662) — migradas getPropertyBySlug/getBlogPosts/getBlogPostsByCategory/getBlogPostBySlug al cliente estático + setRequestLocale en destinos. Resultado (build): 11→21 rutas estáticas. GANANCIA GRANDE: `propiedades/[slug]` (~2.600 fichas) ahora SSG, + todo el blog (listado/posts/5 categorías), consejos, noticias, destinos listado. Las 8 ƒ restantes usan searchParams (inherentemente dinámicas). admin/portal intactos.
- 29/06: rediseño tarjetas de destino (435ab3b) — el texto pasó de centrado-ilegible (sobre la parte clara de la foto) a anclado abajo sobre gradiente fuerte: conteo en dorado (eyebrow) + país en Playfair + tagline muteada + "Ver destino →" en hover. Verificado en prod. Auto-creación de tarjetas de país corroborada (create-property crea country_destinations con la foto de la propiedad — OK).
- 29/06: H1 home ES (a3a714d) — cambiado de "Inmobiliaria internacional de propiedades exclusivas" (largo) a "Propiedades exclusivas, sin fronteras" (elección de Iván). /en sin cambios.
- 29/06: ISR home (81744dd) — la home + 10 páginas públicas (servicios, sobre-nosotros, equipo, partners, vender-tu-piso, colabora, 3 legales) pasaron de ƒ dinámicas a ● estáticas/ISR (revalidate 1h). VERIFICADO con `next build` (antes: 0 estáticas; ahora 11). Causa raíz era next-intl sin setRequestLocale + getLocale() del root. Fix: root lang estático "es" + HtmlLangSync (corrige lang en /en) + setRequestLocale en [locale] layout, (public) layout y home. Las 18 que siguen ƒ usan queries con cookies (propiedades/blog/destinos) — follow-up. /blog ya era SSR (verificado). GDPR legal cerrado (Atilio validó).
- 29/06: fix created_time (aad0990) — `meta_leads_synced.created_time` guardaba `new Date()` (hora del sync) en vez de `parsed.created_time` (hora real del lead en Meta). Corregido en los 2 routes de sync + backfill de 12 filas históricas desde `meta_leads` (que ya tenía el dato bien). 10 filas viejas sin match en meta_leads quedan como están (timestamp perdido). La secuencia de nurture NO estaba afectada (usa meta_leads.created_time, que estaba bien).
- 29/06: quick-wins (d795a80, 4bf4b1e) — (1) extendido `optimizedImage` a 17 archivos más (destinos, blog, equipo, home, related, portal, fundadores de NOSOTROS): 21 `<Image>` + 1 `<img>` ahora WebP/resize. (2) Subida de fotos: reintento automático en 429 (Retry-After, cap 6s) + mensaje específico de rate-limit en crear y editar. (3) NOSOTROS line-clamp VERIFICADO: el único clamp es la bio de fundadores, recorte intencional de tarjeta, no bug.
- 29/06: mini-carrusel en tarjetas (efe016e) — cada card de propiedad ahora tiene flechas sobre la imagen para pasar fotos sin entrar a la ficha (estilo Idealista). Carga solo la foto que se mira (egress acotado). Puntitos si ≤6 fotos, contador "i/N" si más. Card restructurado a overlay-link (HTML válido, sin botón dentro de `<a>`). Aplicado en listado, destinos, inversiones, promociones y España-grid.
- 29/06: imágenes (605878c) — TODAS las imágenes de propiedad pasaron de `unoptimized` (PNG/JPG full-size) a **Supabase Image Transformation** (WebP por contexto): card 446KB→42KB, thumb→15KB (~−90% egress, verificado en vivo). + galería de ficha rehecha: mosaico hero estilo Idealista (1 grande + 4 + "Ver las N fotos"), aspect ratio 16:9 desktop / 4:3 mobile (antes 21:9 recortaba interiores), lightbox optimizado. Helper nuevo `lib/utils/optimizedImage.ts` (solo Supabase; externos como medianewbuild quedan igual).
- 29/06: schema EN (b22341b) — WebSite JSON-LD: inLanguage/description/catálogo ahora locale-aware (antes EN declaraba es-ES). + verificado que areaServed ya tenía los 12 países traducidos a EN (pendiente que estaba resuelto). + prereq ISR (5ea94ce): featured/team/destinos con cliente estático sin cookies.
- 29/06: FAQ destinos (b546701) — FAQPage (schema + sección visible) en destino por país y en España, data-driven (conteo, descripción editorial, datos de mercado), bilingüe. El conteo solo se incluye en la vista sin filtros (schema estable). Cierra el pendiente de FAQPage (servicios + destinos completos).
- 29/06: FAQ servicios (dee4743) — sección de FAQ visible (6 preguntas) + schema FAQPage JSON-LD en /servicios. Respuestas basadas solo en datos reales de la página. Falta replicar en destinos.
- 29/06: dropeada la tabla de respaldo `properties_backup_20260429` (1.757 filas, snapshot 29/04) con OK de Ivan. Catálogo vivo intacto (2.696). También limpia el advisor RLS que la marcaba.
- 29/06: SEO fichas (1597773) — títulos enriquecidos en las ~2.600 fichas ("{tipo} en {ciudad}, {provincia} · {hab} hab · desde {precio}") + numberOfBathroomsTotal en el JSON-LD. OG/Twitter quedan con título limpio.
- 29/06: barrido de coherencia de marca → VERIFICADO LIMPIO (0 residuos "lujo"/"Nest Seekers" en código user-facing, i18n, public/, blog DB y destinos DB; solo quedan clases CSS y el campo DB nestseekers_url, no visibles). No requirió cambios.
- 29/06: resueltos por Ivan/Atilio — Joan ya es admin con usuario; contrato IBott–Atilio firmado; Atilio avisado para recargar la propiedad de Torrevieja.
- 29/06: bugfix carga propiedades (8753646) — una foto vacía (0 bytes, típico foto de iCloud no descargada) abortaba TODA la propiedad ("No file provided"). Ahora los forms de crear/editar omiten la foto mala y guardan el resto, con aviso. Diagnóstico confirmado por DB (la propiedad fallida nunca se escribía).
- 29/06: GDPR cookies (ee3a38f) — GA4 ahora se carga SOLO tras consentimiento "analytics" (antes cargaba siempre); eliminado el banner de cookies legacy duplicado (CookieBanner.tsx). El Pixel ya estaba gateado.
- 29/06: GSC (sin commit, vía navegador, cuenta assetsgolden1@gmail.com de Atilio) — descubierto que la propiedad estaba bajo la cuenta de Atilio y el sitemap NUNCA se había enviado. Enviado `sitemap.xml` (verificado HTTP 200 / XML válido) + solicitada re-indexación de la home.
- 29/06: Supabase leaked-password protection ACTIVADO (vía navegador; estaba dentro del provider Email, no en sección suelta). Advisor ya no lo marca.
- 29/06: combo SEO (46e0174) — H1 del home ES localizado vía next-intl (ES: "Inmobiliaria internacional de propiedades exclusivas", /en mantiene "International Real Estate Consulting" como H1 y queda de tagline en ES); llms.txt limpio (lujo→exclusivas, sin "Partner de Nest Seekers"); `/destinos/[país]` (incl. espana) sumados a sitemap.ts.
- 24/06: carrusel destinos (67561b4), dedupe fotos galería (a7d6622), rebranding lujo→exclusivas en marca/editoriales/DB (df727dc, 5d622bb), 3 posts nuevos de blog bilingües publicados, fix compresión de imágenes en upload (0a12406).
