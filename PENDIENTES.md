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
1. [Atilio·M] Validar/redactar los textos legales de cookies y privacidad. El banner técnico y el gateo GA4/Pixel YA están (29/06); falta solo la revisión legal de los textos para cerrar GDPR antes de escalar ads.
2. [Ivan·S] Monitorear en GSC (cuenta assetsgolden1@gmail.com) que el sitemap pase de "No se ha podido obtener" a "Correcto" y que el title nuevo reemplace al viejo en resultados (días).

## 1. SEO / Posicionamiento
- [Claude+CC·M] Verificar si el listado /blog es client-side; si lo es, pasarlo a SSR (enlazado interno).
- [CC·M] Home/ISR: el verdadero bloqueo del caché es next-intl SIN `setRequestLocale` (v4.13) + el `getLocale()` del root layout → fuerzan render dinámico app-wide. Prereq ya hecho (lecturas públicas con cliente estático, 5ea94ce). Falta: setRequestLocale en root/[locale] layout + páginas, manejar el getLocale() del root, y VERIFICAR con `next build` qué rutas quedan estáticas. Riesgo i18n medio — hacer con build.
- [Atilio+Ivan·L] Autoridad/backlinks: menciones, prensa, portales, partners. Lo que falta vs competidores.

## 2. Blog / Contenido
- [Claude·L] Fase C blog EN: 7 posts restantes a 1.500–2.000 palabras (van 3 de 10).
- [Claude·S] Corregir post ES comprar-piso-espana-siendo-extranjero-2026 (Golden Visa/NLV).
- [Claude+Ivan·L] Plan editorial por clústeres: 4–6 art/mes, guías por zona/fiscalidad/proceso, con enlazado a fichas y destinos.

## 3. Web / Técnico
- [Ivan+Claude·M] PDF del portal end-to-end con agente real en prod (nunca validado). Riesgo: Chromium clavado v143.0.4.
- [CC·M] Optimizar imágenes (egress): thumbnails/AVIF-WebP responsivos vs PNG pesados.
- [CC·S] Helper compressImage a destinos/[slug]/edit y TeamManager (baja prioridad).
- [Atilio+CC·S] Criterios de /inversiones (definición de Atilio) + verificar filtro.
- [Claude·S] Verificar sección NOSOTROS no truncada (line-clamp).
- [CC·S] Bug created_time en meta_leads_synced (guarda synced_at, no timestamp de Meta).
- [CC·S] upload-image: mensaje específico al usuario cuando pega el rate-limit (429) subiendo muchas fotos seguidas (hoy esa foto se omite con aviso genérico).
- [Ivan+CC·M] Revisar imágenes huérfanas en storage de intentos de carga fallidos previos (fotos subidas antes de que abortara la creación).

## 4. Infraestructura / Seguridad / Datos
- [Ivan+CC·M] Limpiar bucket de imágenes huérfanas (post-upgrade).
- (Aceptados, sin acción: buckets con listing, get_property_filters, pg_trgm, leads_public_insert.)

## 5. GDPR / Legal
- [Atilio·M] Textos legales: privacidad, aviso legal, T&C. (El banner de cookies + gateo GA4/Pixel ya están hechos — falta solo validar/redactar los textos.)

## 6. Operación / Cliente
- [Ivan+Claude·M] Carga Cervera/Miami EEUU (cerverabrokerportal.com): directa vs manual.

## 7. Higiene / deuda técnica baja
- ~20 props Cataluña/Madrid mal marcadas habihub (el sync ya las protege; rastrear origen antes de reetiquetar).
- ~750 slugs habihub desincronizados (latente).
- [CC·S] HeroImageCarousel: los 2 CTAs usan `<a href>` (no `<Link>` de @/i18n/navigation) → no son locale-aware (en /en apuntan a la ruta ES) y disparan lint `no-html-link-for-pages`. Pre-existente; baja prioridad.

## Hecho reciente (referencia rápida; el detalle está en DAILY_LOG.md)
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
