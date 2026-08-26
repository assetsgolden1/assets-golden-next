# Plan de acción SEO — 26/08/2026 (priorizado)

Leyenda: [CC] = Claude Code lo hace con código · [Ivan] = manual/panel · [Atilio] = cliente.

## CRÍTICO — arreglar ya (bloquea indexación o pierde leads)

1. **[CC] Blog EN roto** — corregir en el código: (a) links de `/en/blog` que hoy
   apuntan a `/blog/<slug>`; (b) canonical de `/en/blog` que apunta a `/blog`;
   (c) sitemap.ts: los posts EN-only deben listarse como `/en/blog/<slug>` (hoy 12
   URLs 404 en el sitemap). Desbloquea 13 posts YA escritos sin escribir uno nuevo.
2. **[CC] Sitemap sin versión EN** — añadir las URLs `/en/...` como `<loc>` propias
   (~2.800), lastmod real desde la BD (hoy es el timestamp del request), sumar las
   4 categorías del blog, x-default en alternates, y quitar changefreq/priority.
3. **[Ivan decide + CC] `/mi-demanda` roto en prod** (500, tabla `demands` no
   existe; pendiente desde 07/08): decidir destino (tabla nueva vs `leads` con
   source='demand_form') y arreglarlo. Cada envío hoy es un lead perdido.
4. **[Ivan + CC] GA4 sin conversiones** — configurar eventos clave: submit de los 3
   forms, click WhatsApp, click teléfono/email, descarga PDF portal. Sin esto el
   paid y el orgánico no se pueden valorar. (CC puede emitir los eventos gtag;
   marcarlos como key events se hace en el panel GA4.)

## ALTO — esta semana (impacto directo en rankings)

5. **[CC] lang dinámico por locale** — el HTML servido lleva `lang="es"` también en
   `/en`. Moverlo al server (hoy lo corrige JS con HtmlLangSync).
6. **[CC] Canonical de paginación** — `?page=N` debe self-canonicalizar (hoy todo
   apunta a página 1 y ~2.576 fichas quedan sin enlazado interno rastreable).
7. **[CC] Imágenes del feed medianewbuild** — proxearlas por el transform de
   Supabase o next/image remoto: el listado carga 13,4 MB (una foto de 4,8 MB);
   ahorro estimado −9 s de LCP mobile. Las propias ya están OK.
8. **[CC] Fichas Cervera/Miami en ES** — traducir/formatear descripciones
   (amenidades en inglés crudo, "mast_capital"/"arquitectonica" sin formatear,
   "Leer más" colado en EN). Son 62 fichas de un mercado que ya recibe visitas.
9. **[CC] Banner de cookies como LCP** — diferir su render o convertirlo en barra
   inferior SSR; hoy es el elemento LCP de home y listado en mobile.
10. **[CC] Hreflang en /blog, /servicios y legales** + unificar `es-ES` → `es`.

## MEDIO — este mes

11. **[CC] Schema EN**: url/@id/breadcrumbs con prefijo `/en`; `about: Accommodation`
    en fichas (rooms/baths/floorSize van ahí); datePosted; Person en /equipo;
    geo/priceRange en LocalBusiness.
12. **[CC] Consistencia de cifras data-driven**: 2.622 vs 2.364 propiedades y
    11/12/13 países según página — un solo origen (BD) para todos los conteos.
13. **[CC] FAQ de destinos**: respuestas de 40–80 palabras con datos y año (hoy 5–7
    palabras; "ofrecemos 1 propiedades en Grecia"). Molde: /destinos/espana.
14. **[CC] Variar plantilla de fichas HabiHub** (riesgo scaled content) y engordar
    descripciones <300 palabras priorizando las que ya reciben visitas (GA4).
15. **[CC] Ficha mobile**: CTA de contacto above-the-fold (hoy solo FAB WhatsApp);
    arreglar tarjeta "0 €" en posición 1 del listado (dato o filtro); hueco de
    ~60px galería→título; FAB que tapa m².
16. **[CC] fetchpriority/priority en el hero de la ficha** (el LCP ya es WebP OK).
17. **[Claude] Contenido nuevo**: guía "Invertir en obra nueva en Miami" ES+EN
    (aprovecha las 62 fichas y el tráfico ya detectado en GA4) + retomar Fase C
    (7 posts EN) + plan editorial 4–6/mes por clústeres.
18. **[Ivan] GSC**: revisar con la cuenta assetsgolden1@gmail.com — estado del
    sitemap, cobertura de indexación (¿cuántas de las 2.813 + EN?), queries. Sin
    revisar desde el 29/06.

## BAJO — backlog

19. [CC] llms-full.txt + mejorar llms.txt según spec (blockquote, links markdown).
20. [CC] Bloques explícitos para GPTBot/ClaudeBot/PerplexityBot en robots.txt.
21. [CC] sameAs ampliado (YouTube, Google Business Profile cuando exista).
22. [CC] 307→308 en el redirect /es/*; quitar href="/es" de la home.
23. [CC] icon.png 111 KB → optimizar; 3 CSS render-blocking (~150 ms).
24. [Atilio+Ivan] Autoridad/backlinks: prensa, portales, partners — sigue siendo
    el techo estructural (sin cambios desde junio).
25. [Ivan] Valorar idiomas del norte de Europa (sv/de/nl/pl): GA4 muestra
    visitantes traduciendo el sitio a sueco y polaco con el navegador.
