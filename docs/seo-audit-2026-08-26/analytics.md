# Análisis GA4 — assetsgolden.com (export 01/01–26/08/2026)

Fuente: 2 CSV "Informe panorámico" exportados por Iván el 26/08. Los datos reales
empiezan el ~17/06 (día 168 del año): la propiedad GA4 con gateo de consentimiento
quedó operativa a mediados de junio. **Ventana efectiva: ~70 días (17/06 → 25/08).**

## Números globales (70 días)
- **305 usuarios activos** (todos nuevos — cohorte inicial), 4.411 eventos.
- Engagement medio: **128 s/usuario** — muy bueno para inmobiliaria (referencia típica: 50–90 s).
- ~601 sesiones totales.

## Canales (usuarios por primera fuente)
| Canal | Usuarios | % | Nota |
|---|---|---|---|
| Directo | 138 | 45% | Incluye tráfico de WhatsApp/links sin tag y marca |
| **Google orgánico** | **70** | **23%** | 127 sesiones; el 2º canal del sitio |
| Paid (meta+ig) | 31 | 10% | Engagement 57 s — la mitad que orgánico |
| LinkedIn referral | 20 | 7% | Actividad de Atilio/equipo |
| l.wl.co (WhatsApp) | 17 | 6% | Link de WhatsApp Business |
| FB/IG social | 23 | 8% | |
| Bing orgánico | 4 | 1% | |

## Lectura SEO
1. **El orgánico YA es el segundo canal (23% de usuarios)** y el de mejor calidad:
   121 s de engagement vs 57 s del paid. La inversión técnica de junio está dando
   sus primeros frutos.
2. **Pico el 27/06** (día 178: 15 usuarios orgánicos nuevos en un día) — coincide
   exactamente con el envío del sitemap a GSC el 29/06 (±TZ). Después se estabiliza
   en 1–3/día y en agosto sube levemente a 2–8/día. Tendencia: **creciente pero
   desde base minúscula** (~40–60 usuarios orgánicos/mes).
3. **Long-tail funcionando**: decenas de fichas de propiedad con 1–2 vistas cada una
   (Villas Alicante/Málaga, Miami, Tulum, Dubai). Google está sirviendo fichas
   individuales, no solo la home. Las fichas Cervera de Miami (cargadas 27/07) ya
   reciben visitas (2200 Brickell, 888 Brickell D&G, Waldorf Astoria, etc.).
4. **Los titles viejos aún dominan el histórico**: "Propiedades Exclusivas — Assets
   Golden" (516 vistas) vs el nuevo "…en España y el Mundo | Assets Golden" (270).
   El cambio de title está migrando dentro del período. También aparecen residuos
   "de Lujo" (63 vistas) = visitas de cuando el rebranding no estaba desplegado.
5. **Demanda nórdica/europea sin atender**: títulos de página en sueco
   ("Exklusiva fastigheter…", "Fastigheter i Spanien") y polaco ("Willa w San Miguel
   de Salinas") = visitantes usando el traductor del navegador. Suecia aparece
   además en ciudades (Luleå 4, Estocolmo 3, Östersund, Malmö…). Los competidores
   de Costa del Sol atacan ese mercado con sitios en sv/de/nl/pl.
6. **Geografía**: núcleo Barcelona (37) + Madrid (13) + costa (Palma, Valencia,
   Málaga, Marbella), y compradores potenciales desde Dublín (7), NY (7), Londres,
   Manchester, Estocolmo, Buenos Aires. Consistente con el negocio.
7. **Ruido bot**: Boardman, Moses Lake, Prineville, Forest City, Flint Hill (~15
   "usuarios") son datacenters de AWS/Google/Meta — descontarlos mentalmente.

## Problemas de medición detectados
- **CRÍTICO: cero "eventos clave" (conversiones) configurados** — la tabla
  "Plataforma, Eventos clave" vino vacía en los 4 segmentos. GA4 no está midiendo
  leads, envíos de formulario, clicks a WhatsApp ni descargas de PDF. Sin esto no
  se puede calcular costo/lead del paid ni valor del orgánico.
- Subconteo estructural: GA4 solo ve a quienes aceptan cookies analytics
  (típico 40–70%). El tráfico real es mayor. La atribución UTM propia (leads →
  Supabase/Sheet, desde 07/08) es la fuente fiable para leads.
- `meta / paid` vs `ig / paid` divididos; conviene unificar utm_source en las
  campañas para leer el paid como un solo canal.
