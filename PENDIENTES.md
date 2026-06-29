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
- [CC·M] Home sin caché (no-store → ISR revalidate).
- [CC·M] Títulos de ficha enriquecidos: {tipología} en {ciudad}, {provincia} · {hab} hab · desde {precio}.
- [CC·M] Ampliar schema: numberOfRooms/numberOfBathroomsTotal en fichas; FAQPage en servicios/destinos.
- [Claude·S] Verificar areaServed JSON-LD en EN (estaba en español y sin Rep. Dominicana; auditoría dice 12 países: confirmar).
- [Atilio+Ivan·L] Autoridad/backlinks: menciones, prensa, portales, partners. Lo que falta vs competidores.
- [Claude+CC·M] Barrido de coherencia de marca: buscar otros estáticos/metadata con "lujo" o "Nest Seekers" residuales (el llms.txt fue la señal).

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

## 4. Infraestructura / Seguridad / Datos
- [Ivan·S] Dropear properties_backup_20260429 cuando el catálogo esté validado.
- [Ivan+CC·M] Limpiar bucket de imágenes huérfanas (post-upgrade).
- (Aceptados, sin acción: buckets con listing, get_property_filters, pg_trgm, leads_public_insert.)

## 5. GDPR / Legal
- [Atilio·M] Textos legales: privacidad, aviso legal, T&C. (El banner de cookies + gateo GA4/Pixel ya están hechos — falta solo validar/redactar los textos.)
- [Atilio+Ivan] Contrato formal IBott–Atilio sin firmar.

## 6. Operación / Cliente
- [Ivan·S] Cuenta admin de Joan (joanp@assetsgolden.com): confirmar creada/activa.
- [Atilio·S] Confirmación funcional de Atilio: ya puede crear propiedades (fix commit 0a12406).
- [Ivan+Claude·M] Carga Cervera/Miami EEUU (cerverabrokerportal.com): directa vs manual.

## 7. Higiene / deuda técnica baja
- ~20 props Cataluña/Madrid mal marcadas habihub (el sync ya las protege; rastrear origen antes de reetiquetar).
- ~750 slugs habihub desincronizados (latente).
- [CC·S] HeroImageCarousel: los 2 CTAs usan `<a href>` (no `<Link>` de @/i18n/navigation) → no son locale-aware (en /en apuntan a la ruta ES) y disparan lint `no-html-link-for-pages`. Pre-existente; baja prioridad.

## Hecho reciente (referencia rápida; el detalle está en DAILY_LOG.md)
- 29/06: GDPR cookies (ee3a38f) — GA4 ahora se carga SOLO tras consentimiento "analytics" (antes cargaba siempre); eliminado el banner de cookies legacy duplicado (CookieBanner.tsx). El Pixel ya estaba gateado.
- 29/06: GSC (sin commit, vía navegador, cuenta assetsgolden1@gmail.com de Atilio) — descubierto que la propiedad estaba bajo la cuenta de Atilio y el sitemap NUNCA se había enviado. Enviado `sitemap.xml` (verificado HTTP 200 / XML válido) + solicitada re-indexación de la home.
- 29/06: Supabase leaked-password protection ACTIVADO (vía navegador; estaba dentro del provider Email, no en sección suelta). Advisor ya no lo marca.
- 29/06: combo SEO (46e0174) — H1 del home ES localizado vía next-intl (ES: "Inmobiliaria internacional de propiedades exclusivas", /en mantiene "International Real Estate Consulting" como H1 y queda de tagline en ES); llms.txt limpio (lujo→exclusivas, sin "Partner de Nest Seekers"); `/destinos/[país]` (incl. espana) sumados a sitemap.ts.
- 24/06: carrusel destinos (67561b4), dedupe fotos galería (a7d6622), rebranding lujo→exclusivas en marca/editoriales/DB (df727dc, 5d622bb), 3 posts nuevos de blog bilingües publicados, fix compresión de imágenes en upload (0a12406).
