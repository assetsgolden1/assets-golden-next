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
- [Ivan+Claude·M] PDF del portal end-to-end con agente real en prod (nunca validado). Riesgo: Chromium clavado v143.0.4.
- [Atilio+CC·S] Criterios de /inversiones (definición de Atilio) + verificar filtro.
- [Ivan·decide] Imágenes huérfanas en `property-images`: ANALIZADO 29/06 → **177 archivos = 437 MB** sin referencia en la DB (mayoría junio, del bug de uploads fallidos). El resto de buckets, insignificante. Listo para borrar con OK de Ivan (no borrado aún).

## 4. Infraestructura / Seguridad / Datos
- (Aceptados, sin acción: buckets con listing, get_property_filters, pg_trgm, leads_public_insert.)

## 5. GDPR / Legal
- (Cerrado 29/06: Atilio validó los textos legales de cookies/privacidad; banner + gateo GA4/Pixel ya estaban. GDPR técnico + legal OK para escalar ads.)

## 6. Operación / Cliente
- [Ivan+Claude·M] **PRIORIDAD CERCANA (Ivan, 29/06): hacer pronto, no ya.** Carga Cervera/Miami EEUU (cerverabrokerportal.com): directa vs manual.

## 7. Higiene / deuda técnica baja
- ~21 props Cataluña/Madrid/Tarragona con `external_source='habihub'` mal puesto. IDENTIFICADO 29/06: son listados REALES (Sitges, Barcelona, villas, locales) con fotos en NUESTRO Supabase, `external_id` null/UUID (no numérico) → fuera del scope del sync (protegidas). Origen: import masivo del 26/12/2025 + scraper. Es solo el label mal puesto (cosmético). Ivan quiere saber qué son antes de re-etiquetar — ya respondido; pendiente su decisión de re-etiquetar a 'manual'/null (no urgente, no rompe nada).
- ~750 slugs habihub desincronizados (latente).

## Hecho reciente (referencia rápida; el detalle está en DAILY_LOG.md)
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
