# PENDIENTES — Assets Golden (backlog vivo)

> ⚠️ CÓMO USAR ESTE ARCHIVO (para agentes IA y humanos):
> - Este es el backlog VIVO. Al arrancar una sesión, leerlo para saber qué falta.
> - Al cerrar una sesión: tachar/quitar lo resuelto y agregar lo nuevo que surja.
> - El detalle de CÓMO se hizo cada cosa va en DAILY_LOG.md, no acá.
> - El estado actual del proyecto (números, stack) va en ESTADO.md, no acá.
> Última actualización: 26/06/2026

Leyenda esfuerzo: S=minutos · M=una sesión · L=varias/continuo.
Responsable: Ivan (panel/manual) · CC (Claude Code) · Atilio (cliente) · Claude (Claude.ai).

## 0. Lo más urgente
1. [Ivan·S] Activar/confirmar Search Console + reenviar sitemap + pedir recrawl. Hoy Google muestra el title viejo ("lujo") porque no recrawleó; además desbloquea medición.
2. [CC·S] Limpiar llms.txt (lujo→exclusivas + quitar "Partner de Nest Seekers"). Es lo que leen ChatGPT/Claude/Perplexity.
3. [CC·S] H1 del home en español (hoy "International Real Estate Consulting").
4. [CC+Atilio·M] Banner de cookies + gatear GA4/Meta Pixel (GDPR) antes de escalar ads.
5. [CC·S] /destinos/* al sitemap.

## 1. SEO / Posicionamiento
- [Ivan·S] GSC: verificar propiedad activa, reenviar sitemap, recrawl. (El meta-tag presente ≠ verificada).
- [CC·S] Limpiar llms.txt. Verificado en vivo 26/06: dice "Inmobiliaria de Lujo Internacional", "propiedades de lujo" y "Partner oficial de Nest Seekers International". Fósil de marca vieja.
- [CC·S] H1 home ES con keyword; dejar tagline EN como subtítulo; en /en mantener H1 inglés.
- [CC·S] /destinos/espana y /destinos/[país] al sitemap.ts.
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
- [Ivan·S] Toggle leaked-password protection en Supabase Auth. Confirmado 26/06: sigue DISABLED. 1 clic.
- [Ivan·S] Dropear properties_backup_20260429 cuando el catálogo esté validado.
- [Ivan+CC·M] Limpiar bucket de imágenes huérfanas (post-upgrade).
- (Aceptados, sin acción: buckets con listing, get_property_filters, pg_trgm, leads_public_insert.)

## 5. GDPR / Legal
- [CC+Atilio·M] Banner de cookies + gateo de GA4/Meta Pixel.
- [Atilio·M] Textos legales: privacidad, aviso legal, T&C.
- [Atilio+Ivan] Contrato formal IBott–Atilio sin firmar.

## 6. Operación / Cliente
- [Ivan·S] Cuenta admin de Joan (joanp@assetsgolden.com): confirmar creada/activa.
- [Atilio·S] Confirmación funcional de Atilio: ya puede crear propiedades (fix commit 0a12406).
- [Ivan+Claude·M] Carga Cervera/Miami EEUU (cerverabrokerportal.com): directa vs manual.

## 7. Higiene / deuda técnica baja
- ~20 props Cataluña/Madrid mal marcadas habihub (el sync ya las protege; rastrear origen antes de reetiquetar).
- ~750 slugs habihub desincronizados (latente).

## Hecho reciente (referencia rápida; el detalle está en DAILY_LOG.md)
- 24/06: carrusel destinos (67561b4), dedupe fotos galería (a7d6622), rebranding lujo→exclusivas en marca/editoriales/DB (df727dc, 5d622bb), 3 posts nuevos de blog bilingües publicados, fix compresión de imágenes en upload (0a12406).
