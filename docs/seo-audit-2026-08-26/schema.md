# Auditoría de Structured Data (JSON-LD) — assetsgolden.com

**Fecha:** 2026-08-26 · **Método:** curl (UA Mozilla), extracción de todos los `<script type="application/ld+json">` y validación contra Schema.org / requisitos de Google Rich Results.

## Score global: 78 / 100

Implementación madura y consistente (JSON-LD puro, `@graph` con `@id` referenciados, locale-aware). Sin errores críticos ni tipos deprecados. Pierde puntos por: URLs ES en el schema de páginas EN, propiedades inválidas para el tipo `RealEstateListing`, ausencia de `Person` en /equipo y campos recomendados faltantes en `LocalBusiness`.

---

## Páginas auditadas y bloques detectados

| Página | Bloques JSON-LD | Tipos |
|---|---|---|
| `/` (Home ES) | 1 | @graph: [LocalBusiness+RealEstateAgent, WebSite] |
| `/en` (Home EN) | 1 | @graph: [LocalBusiness+RealEstateAgent, WebSite] |
| `/propiedades/adosado-en-estepona-10339` | 3 | @graph org+site, RealEstateListing, BreadcrumbList |
| `/en/propiedades/adosado-en-estepona-10339` | 3 | Ídem (contenido traducido) |
| `/propiedades/baccarat-residences-miami-3149` | 3 | Ídem (Florida) |
| `/servicios` | 2 | @graph org+site, FAQPage (6 Q) |
| `/destinos/espana` | 3 | @graph org+site, FAQPage (5 Q), BreadcrumbList |
| `/blog/nie-para-comprar-propiedad-espana-paso-a-paso` | 4 | @graph org+site, BreadcrumbList, BlogPosting, FAQPage (4 Q) |
| `/equipo` | 1 | Solo @graph org+site — **sin Person** |

Todos los bloques parsean como JSON válido. `@context` = `https://schema.org` en todos. URLs absolutas. Fechas ISO 8601. Sin placeholders.

---

## Errores y hallazgos por severidad

### ALTO

**A1. Páginas EN: `url`, `@id` y BreadcrumbList apuntan a las URLs ES (sin `/en`), contradiciendo el canonical.**
En `/en/propiedades/adosado-en-estepona-10339` el canonical es `https://assetsgolden.com/en/propiedades/...` pero el JSON-LD dice:
```json
{ "@type": "RealEstateListing",
  "@id": "https://assetsgolden.com/propiedades/adosado-en-estepona-10339",
  "name": "Townhouse in Estepona",
  "url": "https://assetsgolden.com/propiedades/adosado-en-estepona-10339" }
```
Y el breadcrumb EN: `["Home","https://assetsgolden.com/"], ["Properties","https://assetsgolden.com/propiedades"], ...` — nombres en inglés pero items ES. El `url`/`@id`/`item` de la versión EN debe llevar el prefijo `/en` para coincidir con el canonical de la página. Contenido en dos idiomas compartiendo el mismo `@id` además colisiona entidades en el grafo.

### MEDIO

**M1. `RealEstateListing` usa propiedades que no pertenecen al tipo.**
`RealEstateListing` es subtipo de `WebPage`; sus únicas propiedades específicas son `datePosted` y `leaseLength`. Estos campos generan warnings en el validador de Schema.org porque pertenecen a `Accommodation`/`Place`:
```json
{ "@type": "RealEstateListing",
  "address": {...}, "numberOfRooms": 3,
  "numberOfBathroomsTotal": 3,
  "floorSize": { "@type": "QuantitativeValue", "value": 176, "unitCode": "MTK" } }
```
Fix recomendado: mover esos campos a un nodo `about`/`mainEntity` de tipo `Accommodation` (o `SingleFamilyResidence`/`Apartment` según tipología). Ver JSON-LD propuesto abajo. `offers` sí es válido (heredado de CreativeWork).

**M2. `/equipo` sin schema `Person`.**
La página muestra fundadores y equipo (Atilio Miguel Montironi, Co-Fundador & Director, etc.) pero solo emite el @graph global. Oportunidad clara de `Person` con `jobTitle`, `worksFor` (`@id` → `#organization`), `knowsLanguage`, `sameAs` (LinkedIn). Refuerza E-E-A-T y knowledge panel.

**M3. `LocalBusiness`/`RealEstateAgent` sin campos recomendados de Google.**
Presentes: name, address completa, telephone, email, logo, sameAs, taxID, legalName, areaServed (traducido por locale — bien). Faltan (warnings Rich Results): `geo` (GeoCoordinates), `openingHoursSpecification`, `priceRange`. También falta `contactPoint` con `availableLanguage`.

**M4. `RealEstateListing` sin `datePosted` ni `inLanguage`.**
`datePosted` es justamente la propiedad nativa del tipo y no está. `inLanguage` está en WebSite pero no en los listings ni en su versión EN.

### BAJO / INFO

**B1. FAQPage en sitio comercial (Info, no crítico).** Google restringió los rich results de FAQ a sitios gubernamentales/sanitarios (ago 2023): las FAQPage de `/servicios`, `/destinos/espana` y el blog no generarán rich snippets en Google. **No eliminarlas**: el markup es válido, las preguntas del schema coinciden 1:1 con el texto visible (verificado en las 15 Q de las 3 páginas), y sigue aportando para citación en AI/LLMs (GEO).

**B2. `BlogPosting.author` es la Organization.** Válido, pero un `Person` con nombre real mejora E-E-A-T. La `image` del post es un logo de promoción (`.../17499032/logo.jpg`) — mejor una imagen editorial 1200px+ en 16:9/4:3/1:1 (Google recomienda las 3 proporciones).

**B3. Descripción de la ficha Miami con slugs crudos.** "Está promovida por **related_group** y con arquitectura de **arquitectonica**" — valores sin humanizar del feed importado. Afecta al `description` del schema y al texto visible.

**B4. BreadcrumbList ausente en `/servicios` y `/equipo`** (sí existe en fichas, destinos y blog). Añadirlo por consistencia.

**B5. Sitemap sin URLs `/en`** (2.813 URLs, todas ES). No es schema, pero afecta al descubrimiento de las versiones EN cuyo hreflang sí existe.

---

## Lo que está bien

- **JSON-LD exclusivamente** (nada de Microdata/RDFa), `https://schema.org`, JSON válido en el 100% de los bloques.
- **@graph global con `@id`s** (`#organization`, `#website`, `#logo`) correctamente referenciados desde seller/publisher/author en todo el sitio.
- **Locale-aware real:** `inLanguage` `es-ES` en ES y `en-GB` en `/en`; descripción y `areaServed` traducidos ("España"→"Spain", "Emiratos Árabes Unidos"→"United Arab Emirates").
- **Fichas de propiedad con Offer completo:** `price` + `priceCurrency` correctos por mercado (900000 EUR Estepona, 970000 USD Miami), `availability: InStock`, `numberOfRooms`, `numberOfBathroomsTotal`, `floorSize` en MTK, `address` con locality/region/country (Miami: Miami/Florida/US — datos completos en las importadas de julio), 16-32 imágenes absolutas.
- **BreadcrumbList válido** en fichas, destinos y blog (positions, name, item absolutos).
- **BlogPosting completo:** headline, description, datePublished/dateModified ISO 8601 con timezone, inLanguage, author/publisher, mainEntityOfPage.
- **WebSite con SearchAction** (sitelinks searchbox) bien formado.
- **FAQ schema = contenido visible** (verificado programáticamente en las 3 páginas).
- Sin tipos deprecados (no HowTo, no SpecialAnnouncement).

---

## JSON-LD recomendado

### 1. Ficha de propiedad — listing con `about: Accommodation` + `datePosted` (patrón a aplicar en las ~2.300 fichas)
```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "@id": "https://assetsgolden.com/propiedades/adosado-en-estepona-10339",
  "url": "https://assetsgolden.com/propiedades/adosado-en-estepona-10339",
  "name": "Adosado en Estepona",
  "inLanguage": "es-ES",
  "datePosted": "2026-01-15",
  "image": ["https://medianewbuild.com/file/hh-media-bucket/developments_v2/64053856/media/images/1.jpg"],
  "offers": {
    "@type": "Offer",
    "price": 900000,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "seller": { "@id": "https://assetsgolden.com/#organization" }
  },
  "about": {
    "@type": "SingleFamilyResidence",
    "name": "Adosado en Estepona",
    "numberOfRooms": 3,
    "numberOfBathroomsTotal": 3,
    "floorSize": { "@type": "QuantitativeValue", "value": 176, "unitCode": "MTK" },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Estepona",
      "addressRegion": "Málaga",
      "addressCountry": "ES"
    }
  }
}
```
En la versión `/en`, `@id`/`url` y todos los `item` del breadcrumb con prefijo `/en`.

### 2. `/equipo` — Person (uno por miembro)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://assetsgolden.com/equipo#atilio-montironi",
  "name": "Atilio Miguel Montironi",
  "jobTitle": "Co-Fundador & Director",
  "worksFor": { "@id": "https://assetsgolden.com/#organization" },
  "url": "https://assetsgolden.com/equipo",
  "knowsLanguage": ["es", "en"]
}
```
(Completar `image` y `sameAs` de LinkedIn con los datos reales de la página.)

### 3. Completar el nodo Organization en el @graph
```json
{
  "priceRange": "€€€€",
  "geo": { "@type": "GeoCoordinates", "latitude": 41.3676, "longitude": 2.0577 },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "09:00", "closes": "18:00"
  }],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+34611853001",
    "contactType": "sales",
    "availableLanguage": ["Spanish", "English"]
  }
}
```
(Verificar coordenadas y horario reales antes de publicar.)

### 4. Oportunidad extra: `AggregateOffer` en listados (`/propiedades`, `/destinos/espana`)
```json
{
  "@context": "https://schema.org",
  "@type": "AggregateOffer",
  "priceCurrency": "EUR",
  "lowPrice": 150000,
  "highPrice": 15000000,
  "offerCount": 2364
}
```
Anidado en un `CollectionPage`/`SearchResultsPage` con `ItemList` de las fichas visibles.

---

## Desglose del score

| Área | Puntos |
|---|---|
| Cobertura de tipos (org, site, listing, breadcrumb, blog, FAQ) | 22/25 |
| Validez técnica (JSON, context, URLs, fechas) | 20/20 |
| Corrección semántica (props en el tipo correcto, @id EN) | 12/20 |
| Campos recomendados Google (geo, hours, priceRange, datePosted, author Person) | 12/20 |
| Oportunidades implementadas (Person equipo, AggregateOffer) | 12/15 |
| **Total** | **78/100** |
