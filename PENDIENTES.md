# PENDIENTES — Assets Golden (backlog vivo)

> ⚠️ CÓMO USAR ESTE ARCHIVO (para agentes IA y humanos):
> - Este es el backlog VIVO. Al arrancar una sesión, leerlo para saber qué falta.
> - Al cerrar una sesión: tachar/quitar lo resuelto y agregar lo nuevo que surja.
> - El detalle de CÓMO se hizo cada cosa va en DAILY_LOG.md, no acá.
> - El estado actual del proyecto (números, stack) va en ESTADO.md, no acá.
> Última actualización: 29/06/2026

Leyenda esfuerzo: S=minutos · M=una sesión · L=varias/continuo.
Responsable: Ivan (panel/manual) · CC (Claude Code) · Atilio (cliente) · Claude (Claude.ai).

## 0. Lo más urgente
1. [Ivan·S] Monitorear en GSC (cuenta assetsgolden1@gmail.com) que el sitemap pase de "No se ha podido obtener" a "Correcto" y que el title nuevo reemplace al viejo en resultados (días).

## 1. SEO / Posicionamiento
- [Atilio+Ivan·L] Autoridad/backlinks: menciones, prensa, portales, partners. Lo que falta vs competidores.
- (ISR cerrado 29/06: 21 rutas públicas estáticas/ISR. Las 8 que siguen ƒ — propiedades listado, destinos/[slug], destinos/espana, inversiones, promociones, propiedades/[slug]/[ciudad] — usan `searchParams` (filtros) → inherentemente dinámicas, no cacheables. Es correcto, no es pendiente.)

## 2. Blog / Contenido
- [Claude·L] Fase C blog EN: 7 posts restantes a 1.500–2.000 palabras (van 3 de 10).
- [Claude·S] Corregir post ES comprar-piso-espana-siendo-extranjero-2026 (Golden Visa/NLV).
- [Claude+Ivan·L] Plan editorial por clústeres: 4–6 art/mes, guías por zona/fiscalidad/proceso, con enlazado a fichas y destinos.

## 3. Web / Técnico
- [Ivan+Claude·M] **PDF del portal end-to-end — NUNCA validado en prod (riesgo real).**
  - Acción: loguearse como agente real en `/portal` en PRODUCCIÓN, abrir una propiedad, generar el PDF white-label vía `/api/portal/generate-pdf/[id]`, y verificar que renderiza OK (fotos, precio, layout, sin páginas rotas).
  - Cuidados: (a) Chromium clavado en `@sparticuz/chromium-min@143.0.4` — si Vercel cambia el runtime de Node o el paquete se actualiza, puede romper el binario. (b) Probar SÍ O SÍ en prod, NO en local (el binario/entorno difiere). (c) `serverExternalPackages` en next.config mantiene puppeteer server-side — no romper esa config. (d) NO es CC-only: necesita una sesión de agente real logueado.
- [Atilio+CC·S] Criterios de /inversiones (definición de Atilio) + verificar filtro.

## 4. Infraestructura / Seguridad / Datos
- (Aceptados, sin acción: buckets con listing, get_property_filters, pg_trgm, leads_public_insert.)

## 5. GDPR / Legal
- (Cerrado 29/06: Atilio validó los textos legales de cookies/privacidad; banner + gateo GA4/Pixel ya estaban. GDPR técnico + legal OK para escalar ads.)

## 6. Operación / Cliente
- [Ivan+Claude·M] **PRIORIDAD CERCANA (Ivan, 29/06): hacer pronto, no ya.** Carga Cervera/Miami EEUU (cerverabrokerportal.com): directa vs manual.

## 7. Higiene / deuda técnica baja

### 7a. Deuda de lint pre-existente (CC-doable; NO rompe el build — Next 16 no corre ESLint en build)
- [CC·S] **`<a href>` → `<Link>` de next/link** en nav de admin. Lugares: `admin/propiedades/[id]/edit/page.tsx` (~L644, link a `/admin/propiedades/`), `admin/destinos/[slug]/edit/page.tsx` (L324, link a `/admin/destinos/`). Acción: importar `Link` de `next/link` y reemplazar `<a href>`/`</a>`. Cuidado: BAJO — es nav interna de admin (no i18n, así que `next/link` normal, NO el de `@/i18n/navigation`). Verificar con `npx eslint` que se limpian esos errores.
- [CC·S] **`<img>` → `next/Image`** en `components/admin/TeamManager.tsx` (2 lugares: L~43 preview del uploader, L~212 lista de miembros). Acción: reemplazar por `<Image>` con `width`/`height` o `fill`+contenedor relativo, y `unoptimized` + `optimizedImage(url)` (mismo patrón del resto). Cuidado: BAJO-MEDIO — son fotos de equipo en el panel admin; verificar que no se rompa el layout (el uploader es cuadrado, la lista es avatar). No urgente (admin, no user-facing).
- [CC·M] **`set-state-in-effect` (regla React 19)** en `admin/propiedades/[id]/edit/page.tsx` (L~108, `setAvailableCities([])` dentro de un useEffect) y `components/portal/PortalPropertiesGrid.tsx` (L342, `setCities([])` en un effect). Acción: mover el setState fuera del cuerpo del effect (derivar el estado, o usar el patrón que recomienda React: calcular en render / event handler). Cuidado: MEDIO — es un mini-refactor, NO un one-liner; hay que TESTEAR que la carga de ciudades/filtros siga funcionando igual (crear/editar propiedad, filtros del portal). No romper el flujo de "cambia país → recarga ciudades".
- [CC·S/M] **`any` casts** en `[locale]/(public)/destinos/espana/page.tsx` (L~260-303, bloques `t(key as any)` del editorial inglés) y `lib/supabase/queries.ts` (L118, L150). Acción: tipar correctamente. Cuidado: el de España es un workaround de tipado de next-intl (claves dinámicas) — puede requerir un helper de tipos o `keyof`; si se complica, dejarlo. Los de queries.ts: leer qué son primero (probablemente casts de resultados de Supabase) y tipar con la interfaz correcta.

### 7b. Datos / higiene latente
- [CC investiga · Ivan decide] **~750 slugs habihub desincronizados**. Acción CC: analizar (SQL) cuántos son, qué patrón tienen (slug DB vs slug que generaría el feed), y si están indexados en Google → informe. Cuidado: cambiar un slug **rompe la URL indexada** → NO tocar sin plan de redirects 301. El fix es decisión de Ivan tras el informe.
- (3 props con external_id UUID pero foto de medianewbuild quedaron como 'habihub' — ambiguas, podrían ser del feed; NO re-etiquetadas para no arriesgar duplicados. CC puede revisarlas caso por caso si se quiere; bajo valor.)

## Hecho reciente (referencia rápida; el detalle está en DAILY_LOG.md)
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
