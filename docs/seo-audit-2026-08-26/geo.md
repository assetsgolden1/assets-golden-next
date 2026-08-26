# Auditoria GEO - assetsgolden.com
Fecha: 2026-08-26. Metodo: curl (UA Mozilla) sobre HTML servido + analisis de JSON-LD, robots.txt, llms.txt y sitemap.

## Score GEO: 64/100

| Dimension | Peso | Score | Aporte |
|---|---|---|---|
| Citabilidad (pasajes) | 25% | 62 | 15.5 |
| Legibilidad estructural | 20% | 72 | 14.4 |
| Contenido multi-modal | 15% | 45 | 6.8 |
| Autoridad y senales de marca | 20% | 50 | 10.0 |
| Accesibilidad tecnica | 20% | 85 | 17.0 |
| **Total** | | | **63.7 = 64** |

Score por plataforma (estimado):
- **Perplexity: 70** - contenido SSR con datos y fuentes; le favorecen los posts tipo guia.
- **ChatGPT search: 65** - GPTBot permitido por defecto, llms.txt presente; falta autoridad off-site.
- **Google AI Overviews: 60** - FAQPage schema ayuda, pero respuestas de destinos demasiado cortas y sin autor humano (E-E-A-T debil).
- **Bing Copilot / Claude: 60** - accesible, pero entidad poco corroborada fuera del sitio (sin Wikipedia, sin YouTube).

---

## 1. Acceso de crawlers AI - PERMITIDO (implicito)

robots.txt (107 bytes): User-Agent: * / Allow: / / Disallow: /admin/ y /portal/ / Sitemap declarado.

| Crawler | Estado | Base |
|---|---|---|
| GPTBot | Permitido | wildcard |
| OAI-SearchBot | Permitido | wildcard |
| ClaudeBot | Permitido | wildcard |
| PerplexityBot | Permitido | wildcard |
| Google-Extended | Permitido | wildcard |
| CCBot | Permitido | wildcard |

**Evaluacion:** funcionalmente correcto - con wildcard + Allow ningun crawler AI esta bloqueado. **Recomendacion: si, agregar bloques explicitos.** Motivos: (a) documenta la intencion y evita que un futuro cambio generico bloquee AI search sin querer; (b) permite politica diferenciada busqueda-vs-entrenamiento (permitir GPTBot/OAI-SearchBot/ClaudeBot/PerplexityBot; opcionalmente bloquear CCBot si se quiere excluir solo entrenamiento; ojo: bloquear Google-Extended puede reducir presencia en Gemini). Para un negocio que vive de la visibilidad, lo razonable es permitir todo explicitamente.

## 2. llms.txt - PRESENTE, util, con desvios menores de la spec

https://assetsgolden.com/llms.txt (200, 2.1 KB). Contenido bueno: H1 con el nombre, seccion "Quienes somos" con razon social (COVA FUMADA GROUP SL), contacto, 13 paginas principales, especialidades, y una seccion de licencia que autoriza citas con atribucion "Assets Golden (assetsgolden.com)" - senal pro-cita valiosa y poco comun.

Desvios vs spec (llmstxt.org):
- Falta el **blockquote de resumen** despues del H1.
- Los links son URLs planas con guion en vez del formato markdown [Nombre](url): descripcion que esperan los parsers de la spec.
- No hay seccion Optional.
- **No existe llms-full.txt** (404). Con 17 posts de blog tipo guia, un llms-full.txt con el texto completo de las guias clave seria barato y de alto valor.
- Detalle: dice "12 paises" pero la FAQ de servicios enumera 11, areaServed del schema tiene 12 (con Rep. Dominicana) y el sitemap tiene 13 paginas de destino (incluye Brasil). Unificar.

## 3. Citabilidad a nivel pasaje

**Lo bueno:**
- **Blog post analizado** (/blog/comprar-piso-espana-siendo-extranjero-2026): excelente. Primer parrafo con dato duro citable en las primeras 40 palabras: "Espana cerro 2024 con 92.958 compras de vivienda realizadas por extranjeros... 14,6% del total", con atribucion de fuentes (Registradores 2024 + idealista/news + CaixaBank Research). 191 tokens numericos, 1 tabla, 11 listas, H2/H3 tematicos, seccion FAQ con 5 H3 en forma de pregunta. Es el tipo de pagina que Perplexity cita.
- /servicios: FAQ de 6 preguntas con FAQPage schema. Respuestas autocontenidas de 20-37 palabras (algo por debajo del optimo 40-80, pero directas y con datos: "12 paises", "due diligence legal completo").
- /destinos/espana: seccion editorial real ("Espana: panorama del mercado inmobiliario exclusivo", zonas costeras, marco legal para compradores internacionales) + FAQ con schema.

**Lo malo:**
- **FAQ de destinos con respuestas raquiticas**: "El precio medio orientativo es 2,500-4,500 EUR/m2" (6 palabras), "La rentabilidad bruta por alquiler ronda 4-7%" (7 palabras), "La revalorizacion reciente ronda +5.2%" (5 palabras). Tienen el dato pero no el contexto: sin ano, sin fuente, sin ambito. Un LLM prefiere citar un pasaje de 40-80 palabras con fuente y fecha. Igual en /destinos/estados-unidos (3,000-15,000 USD/m2, +5.8%).
- **Inconsistencia factual detectable por un LLM**: la FAQ de Espana dice "2622 propiedades en Espana" mientras el OfferCatalog del schema global dice numberOfItems 2364 (total del catalogo). 2622 en Espana > 2364 total. Erosiona confianza de cita.
- **Home sin definicion de la empresa**: hero = "Propiedades exclusivas, sin fronteras / Compraventa de activos inmobiliarios en cualquier parte del mundo". No hay un parrafo "Assets Golden es una consultora inmobiliaria internacional..." en el HTML de la home (si existe en llms.txt).
- La home y /destinos/espana estan dominadas por decenas de H3 de fichas de propiedad (ruido estructural); el contenido editorial queda al fondo.
- El post del blog tiene FAQ visible pero **sin FAQPage schema** (solo BlogPosting).

## 4. Senales de marca y entidad

- **Schema Organization: muy bueno on-site.** LocalBusiness+RealEstateAgent con @id estable, name, legalName, taxID B05380886, direccion postal completa (Sant Joan Despi), telefono, email, areaServed (12 paises), OfferCatalog. Consistente entre ES y EN (mismo legalName y catalogo en /en; descripcion estable: "Inmobiliaria Internacional de Propiedades Exclusivas" / "International real estate consultancy for exclusive properties").
- **sameAs debil: solo 3** - LinkedIn, Instagram y una URL de Fotocasa larga con clientId (fragil). Faltan: YouTube (la correlacion mas fuerte con citas AI, ~0.737), Google Business Profile, X, Facebook. Sin entidad Wikipedia/Wikidata.
- **Autoria sin humanos**: author del BlogPosting = la organizacion (#organization). Cero E-E-A-T personal pese a que existe /equipo. Ningun Person schema.
- **hreflang: ausente en el head** de todas las paginas revisadas (home, /en, post). Si esta en el sitemap (2.812 alternates xhtml:link con /en/), lo que mitiga pero no reemplaza.
- Off-site (segun sameAs y evidencia on-site; no se ejecuto busqueda externa): sin canal YouTube declarado, sin presencia Reddit conocida, sin Wikipedia. Es el punto mas debil para citacion: los LLM citan marcas corroboradas en fuentes terceras.

## 5. Prueba practica - responderia el sitio estas consultas?

**"Best real estate agency for buying property in Spain as a foreigner"**
- Pagina candidata: /blog/comprar-piso-espana-siendo-extranjero-2026 (parte informacional) + /en (parte de agencia).
- Que falta: (1) version EN del post - la consulta es en ingles y el blog parece solo ES; (2) una pagina EN tipo "Buying property in Spain as a foreigner - how Assets Golden helps" que combine guia + propuesta de valor; (3) prueba social citable (reviews con AggregateRating, casos, cifras verificables). Para consultas "best X" los LLM citan listados de terceros y fuentes con reviews, no la web de la propia agencia: conseguir menciones en Reddit, foros de expats y prensa pesa mas que el on-site.

**"Invertir en Miami obra nueva desde Espana"**
- Pagina candidata: /destinos/estados-unidos (menciona Miami 129 veces, FAQ con precio 3.000-15.000 USD/m2 y yield 4-8%) + fichas (The Rider Miami, 72 Park Miami Beach, 14 ROC).
- Que falta: **no existe contenido dedicado a Miami**. Ni /destinos/estados-unidos/miami ni post "Invertir en obra nueva en Miami desde Espana". La pagina de EEUU es generica-pais; un LLM citara antes a un competidor con guia especifica (proceso de compra para no residentes, visados, financiacion para extranjeros, zonas Brickell/Edgewater/Miami Beach, fiscalidad Espana-EEUU, precios obra nueva 2026). El blog ya cubre Dubai y Tulum para este publico; Miami es el hueco evidente.

---

## Hallazgos priorizados (con evidencia)

1. **[Alto]** FAQ de destinos con respuestas de 5-7 palabras sin fuente ni fecha (/destinos/espana, /destinos/estados-unidos, JSON-LD FAQPage). Reescribir a 40-80 palabras con ano y fuente.
2. **[Alto]** Contradiccion de datos: 2622 propiedades en Espana (FAQ) vs numberOfItems 2364 (catalogo total, schema). Generar ambos numeros de la misma fuente.
3. **[Alto]** Sin contenido Miami / obra nueva EEUU pese a tener inventario y demanda objetivo.
4. **[Medio]** Autoria no humana en BlogPosting (author = #organization). Anadir Person schema enlazado a /equipo con sameAs a LinkedIn personal.
5. **[Medio]** sameAs pobre (3 entradas, una fragil de Fotocasa) y sin YouTube - la senal con mayor correlacion con citas AI.
6. **[Medio]** Blog solo en ES (las consultas "best/buying in Spain" son mayoritariamente EN) y hreflang ausente del head (solo en sitemap).
7. **[Medio]** Sin llms-full.txt; llms.txt no usa markdown links ni blockquote de resumen (spec llmstxt.org).
8. **[Bajo]** Home sin parrafo de definicion de entidad en HTML; solo eslogan.
9. **[Bajo]** FAQ del blog sin FAQPage schema (solo la tienen servicios/destinos).
10. **[Bajo]** robots.txt sin reglas explicitas para UAs de AI (hoy permitido por wildcard - correcto, pero indocumentado).

## Quick wins (esfuerzo / impacto)

1. **Reescribir las 3 respuestas de datos de cada FAQ de destino** a 40-80 palabras con ano y fuente ("Segun Registradores/INE 2026, el precio medio en zonas prime de la costa espanola es de 2.500-4.500 EUR/m2...") - 2-3 h, impacto alto (son las paginas con FAQPage schema).
2. **Corregir 2622 vs 2364** y unificar "12 paises" en llms.txt/FAQ/schema/destinos - 1 h, impacto alto en confianza.
3. **Publicar post "Invertir en obra nueva en Miami desde Espana: guia 2026"** con el mismo patron del post de extranjeros (datos con fuente, tabla, FAQ) y enlazar las fichas Miami existentes - 1 dia, impacto alto en la consulta objetivo.
4. **Anadir FAQPage schema a los posts del blog** que ya tienen seccion de preguntas frecuentes - 2 h (plantilla), impacto medio-alto.
5. **Crear llms-full.txt** concatenando las 5-6 guias clave + paginas de destino, y ajustar llms.txt a markdown links + blockquote - 2 h, impacto medio.
6. **Ampliar sameAs** (YouTube si existe canal, Google Business, X/Facebook; reemplazar la URL de Fotocasa por la canonica del perfil) y crear entrada en Wikidata con legalName/taxID - 3 h, impacto medio.
7. **Anadir hreflang ES/EN en el head** (next-intl lo soporta) y un parrafo "Assets Golden es..." en la home y /sobre-nosotros, identico al de llms.txt - 2 h, impacto medio.
8. **Bloques explicitos en robots.txt** para GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended (Allow) - 15 min, impacto bajo pero documenta la politica.

## Datos de verificacion
- robots.txt: 200, wildcard allow, sin reglas AI especificas.
- llms.txt: 200, 2.154 bytes. llms-full.txt: 404.
- Home 725 KB SSR (contenido completo en HTML, sin dependencia de JS - apto para crawlers AI que no ejecutan JS).
- Sitemap: 1.2 MB, con 2.812 alternates hreflang /en/.
- JSON-LD: WebSite + LocalBusiness/RealEstateAgent (global), FAQPage (servicios, destinos), BlogPosting + BreadcrumbList (posts), sin Person, sin AggregateRating, sin VideoObject.
- Post auditado: datePublished 2026-04-26, dateModified 2026-05-26 (frescura correcta).
