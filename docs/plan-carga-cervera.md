# Plan — Carga de propiedades de Cervera Broker Portal

> Análisis técnico + plan de ejecución. Fecha: 2026-07-26.
> Fuente: https://cerverabrokerportal.com/ · Pedido de Atilio.
> **Todas las tareas de ejecución son CC-doable.** La única acción externa es la confirmación de F0.

---

## 1. Qué es la fuente (análisis real, no supuestos)

Sitio **WordPress** (JetEngine/Elementor) que se autodefine como *"your unbranded marketing toolbox to sell new development projects"* — es decir, un portal pensado para que **brokers colaboradores** usen su material.

**Hallazgo clave: NO hay que scrapear HTML.** El sitio expone **WP REST API pública** (`/wp-json/wp/v2/projects`) con **97 campos estructurados por proyecto**. Es una fuente muchísimo mejor que el scraping: datos limpios, con precios, y hasta con descripciones en español.

- `robots.txt`: permite crawl (`Crawl-delay: 10` → respetar).
- Total: **122 proyectos** (`X-WP-Total: 122`).
- El CPT `units` existe pero está **vacío (0)** → no hay unidades individuales, solo proyectos.

### Qué son estas "propiedades"
**No son pisos individuales: son promociones de obra nueva (off-plan)** en Miami/Florida — torres de condos de marca (Bentley, Mandarin Oriental, St Regis, Rosewood…). Cada una tiene **rango** de precio y superficie, no un valor único.

→ Encaja con el modelo de AG: `is_development = true` y el título SEO ya usa **"desde {precio}"**.

### Campos aprovechables de la API
`price_range_from/to` · `size_range_from/to` (SF) · `excerpt_es` (descripción ES) · `unit_size_ranges` (desglose de dormitorios/baños) · `developer` · `architect` · `interior-designer` · `amenities` · `views` · `floors` · `units` · `completion_year/quarter` · `phase/phase_es` · `project-hero-image` / `project-image` / `featured_media` (IDs resolubles vía `/wp/v2/media/{id}`).

---

## 2. Completitud real de los datos (medida sobre los 122)

| Dato | Cobertura |
|---|---|
| Imagen (cualquier fuente) | **87 / 122** |
| Precio válido (> 10.000) | **78 / 122** |
| Superficie | 100 / 122 |
| Descripción (algo de texto) | 63 / 122 |
| Descripción en español | 17 / 122 |
| Dormitorios parseables | 62 / 122 |
| Developer / Architect | ~97 / 122 |

**Resultado de viabilidad:**
- **69** publicables con mínimo digno (imagen + precio).
- **48** completas (imagen + precio + superficie + descripción).
- **26** sin imagen **ni** precio → no se cargan (se listan para Atilio).

---

## 3. Trampas detectadas (esto es lo que evita un desastre)

1. **⚠️ PSF disfrazado de precio — 11 proyectos.** Tienen el precio **por pie cuadrado** en `price_range_from`: One Metropica = `550`, Nautilus 220 = `950`, One Park Tower = `900`, River District = `1200`, 2000 Ocean = `1400`, Rosewood Hillsboro = `2100`, One West Palm = `2750`, The Raleigh = `3000`, La Mare = `1157`, Visions at Brickell = `1080`, Diesel Wynwood = `913`.
   → Publicarlos tal cual mostraría **un condo de lujo a "desde 550 USD"**. Regla dura: `price < 10.000` ⇒ **no publicar precio**, marcar para revisión (o derivar `PSF × superficie` y dejarlo oculto hasta validar).

2. **La dirección/ciudad NO está en la API.** Solo se renderiza en la página (`Site Address: 18401 Collins Avenue, Sunny Isles Beach, FL 33160`). AG necesita `location` para destinos, filtros y SEO.
   → **Enfoque híbrido**: API para lo estructurado + scrape puntual de la ficha solo para la dirección.

3. **Duplicado real.** AG ya tiene **AG-00805 "THE RIDER MIAMI"**, que es un proyecto de Cervera, cargado a mano. Hay que deduplicar por nombre normalizado antes de insertar.

4. **Galerías pobres.** La API da **~1–3 imágenes por proyecto** (hay 522 media en todo el sitio, y muchas son logos/fotos de agentes). Los renders buenos están en **carpetas de Dropbox** (`renderings-link`), fuera del alcance de la automatización.
   → Las fichas nacerán con pocas fotos. Es una limitación de la fuente, no del método.

5. **Marcas registradas.** Son residencias de marca (Bentley, Mandarin Oriental, St Regis…). El material es "unbranded marketing tools" provisto para brokers, pero conviene tenerlo confirmado (ver F0).

---

## 4. Mapeo al esquema de AG

| Campo AG | Origen Cervera | Notas |
|---|---|---|
| `title` | `title.rendered` | |
| `country` | `"Estados Unidos"` | destino ya existe |
| `province` | `"Florida"` | (verificar los de NY) |
| `location` | ciudad del address scrapeado | Sunny Isles, Brickell… |
| `property_type` | `apartment` | son condos |
| `price` | `price_range_from` | ⚠️ filtro anti-PSF |
| `currency` | `USD` | |
| `area_sqm` | `size_range_from ÷ 10,7639` | SF → m² |
| `bedrooms` / `bathrooms` | `unit_size_ranges` (mín.) | 62/122 |
| `is_development` | `true` | off-plan |
| `description` | `excerpt_es`, si no → **generada por CC** | |
| `description_en` | `excerpt` / `content` | |
| `image_url` + `gallery_urls` | media resuelta | comprimir al subir |
| `features` | `amenities`, `views`, developer, architect | |
| `external_source` | `'cervera'` | **nuevo** — lo aísla del cron de HabiHub |
| `external_id` | WP post id | clave de dedupe/re-sync |

---

## 5. Plan de ejecución

### F0 · Confirmación (única tarea NO-CC) — 5 min
Atilio confirma que AG tiene relación de colaboración con Cervera para difundir estos proyectos. El portal está hecho para eso, pero la confirmación queda registrada. **No bloquea F1–F3** (se puede preparar todo y cargar recién con el OK).

### F1 · Extractor (CC)
Script `scripts/importCervera.ts`: pagina la API (2 requests), scrapea la dirección de cada ficha respetando `Crawl-delay: 10`, resuelve media IDs → `cervera-raw.json`. Idempotente y re-ejecutable.

### F2 · Normalización (CC)
Mapeo de la tabla anterior + SF→m² + parseo de beds/baths + **regla anti-PSF** + dedupe contra la BD (por `external_id` y por título normalizado, para atrapar The Rider).

### F3 · Contenido bilingüe (CC)
Las 105 sin descripción en español: **genero copy ES/EN** a partir de los datos duros reales (developer, arquitecto, plantas, unidades, amenities, entrega, ubicación). Sin inventar cifras — solo redactar lo que la fuente ya afirma.

### F4 · QA + informe (CC) — **antes de tocar la BD**
Dry-run con informe: cuántas entran, cuántas quedan afuera y **por qué**, las 11 de PSF, los duplicados, y muestra de 5 fichas normalizadas para que las revises. Salida: `docs/informe-carga-cervera.md`.

### F5 · Carga (CC, con tu OK)
1. **Piloto de 5** → verificar en prod.
2. Si están OK → el resto (~64).
Las que no llegan al mínimo **no se cargan**; van al informe para que Atilio complete a mano.
Imágenes: descarga + recompresión (JPEG máx 2560px) + subida al bucket propio — **igual que el fix de imágenes que ya hicimos**, así no dependemos del hosting de Cervera ni repetimos el problema de los >25 MB.

### F6 · Verificación en prod (CC)
Fichas 200 en ES/EN, imágenes que transforman, aparición en `/destinos/estados-unidos` y en los filtros. La revalidación ya funciona (fix de locale del 26/07).

### F7 · Re-sync (CC, opcional)
El mismo script, idempotente por `external_id`, para refrescar precios/fases más adelante. **Nunca** tocará las de `external_source='manual'`.

---

## 6. Expectativa realista

- **Entran ~69** de 122 (~57%). No es "todas" — porque **53 no tienen datos mínimos en la fuente**, no por límite del método.
- Fichas con **pocas fotos** (1–3). Para mejorarlas hace falta bajar los renders de Dropbox (manual, se puede evaluar aparte).
- Las 26 sin imagen ni precio quedan documentadas para carga manual.

**Riesgo bajo:** todo pasa por dry-run + informe antes de escribir, la carga es reversible (`external_source='cervera'` permite borrar en bloque) y no toca nada del catálogo existente.
