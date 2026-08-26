# Auditoría de calidad de contenido SEO — assetsgolden.com

**Fecha:** 2026-08-26 · **Método:** 19 requests con curl (UA Mozilla), muestreo de 16 páginas + sitemap.xml (2.813 URLs: 2.751 fichas, 30 posts, 12 destinos). Criterios: QRG Google sept-2025.

## SCORE GLOBAL: 54/100

| Dimensión | Score |
|---|---|
| E-E-A-T ponderado | 55/100 |
| Cobertura / thin content | 45/100 |
| Localización ES/EN | 40/100 |
| Legibilidad | 70/100 |
| Citabilidad AI | 60/100 |
| Frescura | 50/100 |

### Desglose E-E-A-T
| Factor | Peso | Score | Evidencia |
|---|---|---|---|
| Experience | 20% | 55 | Bios de equipo reales; pero fichas de feed sin aporte propio (texto de Cervera/HabiHub verbatim) |
| Expertise | 25% | 65 | Posts con datos fiscales concretos y correctos (IRNR, ITP, retención 3%); partners con credenciales (Zaira Fortoul: arquitecta, 10+ años) |
| Authoritativeness | 25% | 45 | Blog firmado "Por Assets Golden" (author schema = Organization, sin persona); sin menciones/citas externas visibles |
| Trustworthiness | 30% | 55 | Dirección completa en schema + tel + email; pero NAP visible incompleto e inconsistencias numéricas (ver H-6, M-3) |

---

## HALLAZGOS CRÍTICOS

### C-1. El blog EN está roto: los 12 enlaces del listado /en/blog apuntan a 404
- En `https://assetsgolden.com/en/blog` los posts enlazan a `/blog/slug` (sin prefijo `/en`), p.ej. `href="/blog/spain-property-tax-non-residents"` → **404 verificado** (la URL correcta `/en/blog/spain-property-tax-non-residents` devuelve 200).
- Además `/en/blog` tiene `<link rel="canonical" href="https://assetsgolden.com/blog"/>` → el listado EN se autoexcluye del índice apuntando a la versión ES.
- El **sitemap.xml** lista los posts EN también sin prefijo (`https://assetsgolden.com/blog/spain-property-tax-non-residents` → 404) y **no contiene ni una sola URL `/en/`** (0 de 2.813).
- Consecuencia: los 13 posts EN (la mitad del esfuerzo de la Fase B/C) están huérfanos — solo descubribles por hreflang de la versión ES. Explica de sobra cualquier bajo rendimiento del contenido EN.

### C-2. Fichas EN con descripción en español sin traducir (propiedades manuales de España)
- `https://assetsgolden.com/en/propiedades/antigua-masia-en-el-centro-de-santa-coloma-barcelona`: bajo el H2 "Description" el texto es 100% español ("Exclusiva Masia en pleno centro de Santa Coloma de Gramanet… Consúltanos para mayores detalles"). Title también mezcla: "Antigua Masia en el centro de Santa Coloma, Barcelona – 7 beds".
- Las fichas HabiHub sí están traducidas (Finestrat EN verificada), lo que confirma que el problema es del contenido manual, no del template.

### C-3. Thin content masivo en fichas (2 de 3 muestras bajo el mínimo de 300 palabras)
| Ficha | Origen | Palabras descripción | Veredicto |
|---|---|---|---|
| `/propiedades/antigua-masia-en-el-centro-de-santa-coloma-barcelona` | Manual España | **65** | Thin severo |
| `/propiedades/cipriani-residences-miami-3161` | Cervera/Miami | **81** | Thin severo |
| `/propiedades/adosado-en-finestrat-6483` | HabiHub | **414** | OK |
- Con ~266 fichas de patrón numérico (Cervera + feed) y las manuales cortas, una parte relevante de las 2.751 fichas compite con 65-100 palabras contra portales con fichas de 400+.

---

## HALLAZGOS ALTOS

### H-1. Fichas de Miami: versión ES con mitad del texto en inglés crudo del feed
- `/propiedades/cipriani-residences-miami-3161` (versión ES): tras 4 frases plantilla en español, las amenidades van en inglés sin traducir: "Amenities: 50,000 square foot. Exclusive private entrance with lush landscaping and elegant porte-cochère…". Sospecha del usuario **confirmada**.
- Datos del feed sin formatear en ambos idiomas: "promovida por **mast_capital** y con arquitectura de **arquitectonica**" (snake_case y minúsculas visibles al usuario y en la meta description).
- Y al revés: la versión EN muestra "**Leer más**" y "Solicitar información" en español.

### H-2. Descripciones de feed con plantilla idéntica (patrón de contenido AI repetitivo, QRG sept-2025)
- Finestrat: "Ubicado en la encantadora localidad de Finestrat, este conjunto residencial ofrece…"
- El Verger (`/propiedades/adosado-en-el-verger-7570`): "Ubicado en la encantadora localidad de El Verger, este conjunto de 33 adosados ofrece…"
- Misma apertura + mismas secciones en mayúsculas (EXTERIORES / …) en fichas distintas. Es exactamente el marcador de "estructura repetitiva entre páginas" que la QRG señala como contenido AI de bajo valor. Con cientos de fichas así, hay riesgo de clasificación scaled-content.

### H-3. Páginas de destino secundarias thin y con FAQ autogenerada sin valor
- `/destinos/grecia`: ~390 palabras netas (mínimo location page: 500-600). La FAQ es autogenerada y llega a ser contraproducente: "¿Cuántas propiedades tiene Assets Golden en Grecia? — Actualmente ofrecemos **1 propiedades** en Grecia" (error gramatical + confesión de catálogo vacío marcada como FAQPage schema). La segunda respuesta recicla la meta description ("Descubre las mejores oportunidades de inversión inmobiliaria en Grecia.") — respuesta que no responde.
- Contraste: `/destinos/espana` está bien (~1.450 palabras netas, panorama de mercado, marco legal para compradores internacionales, FAQ real).

### H-4. /en/blog con title y meta description en español
- Title: "Blog Inmobiliario – Assets Golden"; meta: "Artículos y análisis sobre el mercado inmobiliario exclusivo…" — idénticos a la versión ES. En SERP inglesas se muestra en español.
- El post EN muestra la fecha en español: "26 de abril de 2026" en `/en/blog/spain-property-tax-non-residents`.

### H-5. Blog sin autoría personal
- Posts firmados "Por Assets Golden"; schema `"author":{"@id":"…#organization"}`. Sin autor-persona, sin bio, sin enlace a /equipo desde los posts. Para YMYL fiscal-inmobiliario (impuestos, Golden Visa) la QRG pide expertise identificable. Los fundadores con LinkedIn ya existen en /equipo: es conectar piezas.

### H-6. NAP visible incompleto e inconsistente con el schema
- Schema Organization: "José Agustín Goytisolo, 31, L5, 08970 Sant Joan Despí" (completo, bien).
- Footer visible en todo el sitio: solo "Barcelona, Spain + tel + email". La dirección física real (Sant Joan Despí) no aparece en ninguna página visitada, ni en /sobre-nosotros ni /equipo. Inconsistencia schema-vs-visible que debilita trust y local SEO.

---

## HALLAZGOS MEDIOS

- **M-1. Posts por debajo del mínimo de blog:** post ES (NIE) ~750 palabras netas, post EN (impuestos) ~700. Buenos, pero lejos de las 1.500 del mínimo para blog post; la cobertura es correcta pero superficial en secciones (2-3 frases por H2). No es factor directo de ranking, pero frente a guías de 2.000+ palabras de la competencia, cubren menos entidades.
- **M-2. Blog congelado desde junio** (confirma contexto): 17 ES + 13 EN, sin publicaciones en ~3 meses; `dateModified` más reciente visto: abril 2026. Con C-1 activo, terminar la Fase C (7 posts EN) es inútil hasta arreglar los enlaces.
- **M-3. Inconsistencias que erosionan trust en /sobre-nosotros:** "11 Países de operación" en el bloque de stats vs "12 países" tres veces en la misma página (y la lista enumera 11). Typo en /equipo: "Zaira **Fortoul**" en el nombre vs "Zaira **Fortuol**" en la bio. "NÚRIA CORTÉS" en mayúsculas vs resto en caja normal.
- **M-4. Bios de partners con olor a AI genérico:** la de Núria Cortés es puro boilerplate sin hechos verificables ("networking de alto valor y posicionamiento de autoridad… potenciando oportunidades de ámbito global"). Cero datos concretos (años, operaciones, zonas). Contrasta con la de Zaira (arquitecta, 10 años, Barcelona→Galicia), que es el modelo a seguir.
- **M-5. Descripciones truncadas con "Leer más"**: en fichas el texto visible se corta con ellipsis; verificar que el texto completo esté en el HTML servidor (en Miami el corte aparece en el propio HTML), porque si el resto solo se inyecta por JS, Google indexa la versión corta.
- **M-6. Meta descriptions de ficha = primeras líneas crudas de la descripción**, con saltos de línea y cortadas a mitad de palabra ("…al Ayuntamiento correspond"). Y en Miami heredan "mast_capital".

---

## FORTALEZAS

1. **Schema técnico muy completo:** RealEstateListing + Offer + BreadcrumbList en fichas; BlogPosting + FAQPage + Question/Answer en posts; Organization con PostalAddress completa. Base excelente para rich results y citación AI.
2. **Posts con citabilidad AI real:** caja "En resumen:" al inicio (post NIE), FAQs con respuestas autocontenidas y datos concretos ("EU and EEA residents can deduct mortgage interest, insurance, community fees, IBI, depreciation…"), cifras y plazos verificables, títulos con año (2026).
3. **/destinos/espana es una landing modelo:** panorama de mercado, zonas costeras, marco legal para extranjeros, FAQ real — replicar en los otros 11 destinos.
4. **/equipo con E-E-A-T genuino:** nombres reales, fotos, bios con trayectoria, enlaces a LinkedIn de fundadores y partners.
5. **Home ES y EN correctamente localizadas** (traducción real, titles/metas propios por idioma) y con jerarquía H1/H2 limpia.
6. **Hreflang implementado** en home y posts (es/en/x-default).
7. **HabiHub EN traducido de verdad** — la infraestructura de traducción existe; el fallo es solo en contenido manual y strings de UI sueltos.

## PRIORIDADES (impacto/esfuerzo)

1. **[Crítico, esfuerzo bajo]** Arreglar los `href` de /en/blog (añadir prefijo `/en`), el canonical de /en/blog y añadir las URLs `/en/*` al sitemap. Desbloquea 13 posts ya escritos.
2. **[Crítico, medio]** Traducir descripciones EN de fichas manuales; traducir amenidades de fichas Miami en ES y limpiar `mast_capital`→"Mast Capital".
3. **[Alto, medio]** Ampliar descripciones manuales y de Cervera a 250-400 palabras (zona, rentabilidad, datos del edificio ya disponibles en el feed).
4. **[Alto, bajo]** Firmar posts con fundadores (schema Person + bio + LinkedIn); añadir dirección física completa al footer.
5. **[Medio]** Desactivar FAQ autogenerada en destinos con <5 propiedades; corregir 11-vs-12 países y typos de /equipo; variar plantillas de descripción HabiHub.
