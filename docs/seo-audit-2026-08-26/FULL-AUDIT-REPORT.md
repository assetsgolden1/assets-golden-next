# Auditoría SEO completa — assetsgolden.com — 26/08/2026

> Auditoría multi-agente sobre PRODUCCIÓN (7 especialistas en paralelo + análisis GA4).
> Detalle por sección en esta misma carpeta: technical.md, content.md, schema.md,
> sitemap.md, performance.md, geo.md, visual.md, analytics.md.
> Evidencia cruda (HTML, headers, JSON-LD, Lighthouse JSON, screenshots) quedó en el
> scratchpad de la sesión (no comiteada).

## Score global: 67/100

| Categoría | Peso | Score | Aporte |
|---|---|---|---|
| SEO técnico (crawl+indexación+sitemap) | 25% | 75 (téc. 82 / sitemap 68) | 18,8 |
| Calidad de contenido | 25% | **54** | 13,5 |
| On-page (titles, H1, canonicals, linking) | 20% | 72 | 14,4 |
| Schema / datos estructurados | 10% | 78 | 7,8 |
| Performance (CWV mobile) | 10% | 67 | 6,7 |
| Imágenes | 5% | 50 | 2,5 |
| AI Search / GEO | 5% | 64 | 3,2 |

Nota vs el "83/100" de junio: esta auditoría es más profunda (crawl EN, paginación,
Lighthouse real, GEO) y posterior a dos cargas de contenido (Cervera, blog EN) que
introdujeron los problemas nuevos. La base técnica de junio sigue intacta (82).

## Los 5 hallazgos críticos

1. **El blog EN está roto entero.** Los 13 posts EN existen y responden 200 en
   `/en/blog/<slug>`, pero: los links de `/en/blog` apuntan a `/blog/<slug>` (404),
   `/en/blog` canonicaliza a `/blog`, y el sitemap lista los posts EN-only como
   `/blog/<slug>` → **12 URLs 404 dentro del sitemap**. Resultado: todo el contenido
   EN del blog es invisible para Google. Es un fix de generación de links + sitemap.
2. **La versión EN del sitio (~2.800 páginas) no se envía a Google como URLs
   propias**: solo aparece como alternate hreflang, nunca como `<loc>`. Además el
   HTML servido lleva `lang="es"` también en `/en/...` (HtmlLangSync lo corrige por
   JS, pero el HTML crudo queda mal) y el JSON-LD de páginas EN apunta a URLs ES.
   El sitio EN existe pero le decimos a Google tres veces que "es español".
3. **Canonical de paginación**: `/propiedades?page=2..115` canonicaliza a
   `/propiedades` → ~2.576 fichas quedan sin enlazado interno rastreable (solo las
   sostiene el sitemap). Con la autoridad baja del dominio, eso frena la indexación
   masiva de fichas.
4. **Contenido thin/no localizado en fichas**: fichas Cervera/Miami con amenidades
   en inglés crudo y slugs sin formatear ("mast_capital", "arquitectonica") en la
   versión ES, y "Leer más" en la EN; fichas manuales con descripciones de 65–81
   palabras o directamente en español en `/en`; plantilla repetida en fichas HabiHub
   ("Ubicado en la encantadora localidad de X…") — riesgo de scaled content.
5. **Medición ciega**: GA4 no tiene NINGÚN evento clave configurado (ni lead, ni
   click a WhatsApp, ni PDF). Y `/mi-demanda` sigue roto en prod (500, lead perdido
   — conocido desde 07/08, sin decisión aún).

## Lo que está BIEN (no tocar)

- Canonicals autorreferentes ES/EN perfectos; hreflang es/en/x-default en páginas
  principales (+ header Link); redirects www/http/trailing 308 de un salto; 404
  real con noindex; security headers completos (HSTS preload, CSP, nosniff).
- Contenido 100% en el HTML servido (SSR/ISR) — título, precio y descripción sin JS.
- Titles/descriptions únicos y muy buenos (precio+ubicación+habitaciones), H1 único.
- Schema sólido: @graph LocalBusiness+RealEstateAgent (address, taxID), fichas con
  Offer correcto por mercado (EUR/USD), FAQPage 1:1 con el texto visible,
  BlogPosting completo. 21 bloques, 100% JSON válido.
- Imágenes PROPIAS por Supabase Transformation (WebP) — el pipeline de junio funciona.
- CLS = 0 en todas las páginas; desktop pasa CWV (home 88).
- Home mobile: H1 + doble CTA above-the-fold, cookies no tapa en carga inicial.
- robots.txt correcto; los 308 de slugs legacy NO contaminan el sitemap.
- llms.txt presente con licencia de cita (señal GEO valiosa).

## GA4 (17/06 → 25/08, ~70 días de datos reales)

- 305 usuarios; **orgánico ya es el 2º canal: 70 usuarios (23%), 127 sesiones**,
  con el mejor engagement del sitio (121 s vs 57 s del paid).
- Pico orgánico el 27–29/06 (envío del sitemap a GSC); agosto muestra tendencia
  levemente creciente (2–8 usuarios orgánicos/día). Base aún minúscula.
- Long-tail activo: decenas de fichas (incl. Miami/Cervera) con sus primeras
  visitas orgánicas.
- Señal de mercado: visitantes traduciendo el sitio a sueco y polaco + ciudades
  nórdicas → demanda del norte de Europa sin idioma propio (los competidores de
  Costa del Sol sí lo atienden).
- ~15 "usuarios" son datacenters (Boardman, Moses Lake, Prineville) — ruido bot.
- Ver analytics.md para el detalle completo.

## Detalle por sección (resumen)

### Técnico — 82/100
High: lang="es" en /en (HTML servido); canonical de paginación → página 1;
hreflang ausente en /blog, /servicios y legales (y el post usa es-ES vs es del
resto). Medium: home de 724 KB de HTML (147 chunks RSC); /es/* redirige 307 (no
308) y la home enlaza href="/es". Ver technical.md.

### Sitemap — 68/100
2.813 URLs válidas, sin duplicados; composición: 2.751 fichas ES + 30 blog + 13
destinos + 16 estáticas. Grave: 12 URLs de blog 404 (posts EN-only en ruta ES) y
cero `<loc>` /en/. lastmod = timestamp del request (2.783/2.813 idénticas al
segundo de la descarga) → Google lo ignora. Faltan las 4 categorías del blog y
x-default. changefreq/priority obsoletos (30% del peso). Ver sitemap.md.

### Contenido — 54/100
Crítico: blog EN huérfano (arriba); fichas EN con texto ES y viceversa. Thin:
masía 65 palabras, Cipriani 81; /destinos/grecia ~390 palabras con FAQ absurda
("ofrecemos 1 propiedades"). Plantilla HabiHub repetida. E-E-A-T: /equipo sólido
(bios+LinkedIn) pero blog sin autor persona; dirección física solo en schema;
"11 vs 12 países" en la misma página. Modelo a seguir: /destinos/espana y el post
de comprar-piso-extranjero. Ver content.md.

### Schema — 78/100
Alto: URLs ES en el schema de páginas EN (url/@id/breadcrumbs). Medio:
RealEstateListing con campos que van en `about: Accommodation`; falta datePosted;
/equipo sin Person; LocalBusiness sin geo/hours/priceRange. Bajo: author=org,
imagen de post=logo, sin breadcrumbs en /servicios y /equipo. Ver schema.md.

### Performance — 67/100 mobile (lab)
LCP mobile falla en las 3 páginas medidas (home 14,3 s / listado 13,4 s / ficha
7,2 s lab throttled; desktop 88 y pasa). Causas: (1) listado carga 13,4 MB de
imágenes del feed medianewbuild SIN pasar por Supabase (una de 4,8 MB mostrada a
694px) — ahorro estimado −9,1 s; (2) el elemento LCP de home/listado es el banner
de cookies pintado tarde por JS; (3) hero de ficha sin fetchpriority/priority.
TTFB en frío ~1 s en /propiedades (MISS ISR). CLS 0. Ver performance.md.

### Visual — 78/100
Screenshots reales (Playwright) en scratchpad. Ficha mobile sin CTA de contacto
above-the-fold (solo FAB WhatsApp); primera tarjeta del listado "Villa en
Marbella — 0 €"; hero del listado come ~46% del viewport mobile; FAB tapa
m²/precios; hueco de ~60px entre galería y título. Ver visual.md.

### GEO / AI Search — 64/100
Crawlers AI permitidos; llms.txt útil pero sin llms-full.txt. Citabilidad dispar:
el post de comprar-piso es ejemplar (datos con fuente, tabla, FAQ), las FAQ de
destinos responden en 5–7 palabras sin año ni fuente. Inconsistencia de datos:
"2622 propiedades" (FAQ) vs 2364 (schema) vs 11/12/13 países según página. sameAs
solo 3 perfiles. Hueco directo: no hay guía "invertir en Miami obra nueva" pese a
las 62 fichas Cervera. Ver geo.md.

## Contexto de posicionamiento

GSC sigue pendiente de revisión humana (cuenta assetsgolden1@gmail.com de Atilio,
último acceso 29/06). Autoridad/backlinks: sin avances — sigue siendo el techo
estructural del proyecto junto con el contenido congelado desde junio (Fase C EN
a medias, plan editorial sin arrancar).
