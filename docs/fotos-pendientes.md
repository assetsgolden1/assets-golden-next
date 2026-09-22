# Fotos pendientes de recuperar — 2026-09-22

Generado por `scripts/auditMissingPhotos.ts` comprobando cada URL contra el Storage del proyecto reconstruido.
Las 2721 propiedades visibles menos las 169 con fotos propias usan el CDN del proveedor y **no se vieron afectadas**.

## Resumen
- Propiedades con fotos propias: **169** → completas **158**, parciales **0**, **sin ninguna foto: 11**
- Sin foto por origen: manual 11
- Destacadas sin foto: **11**
- Equipo sin foto: **1** · Blog con portada rota: **0** · Destinos con imágenes rotas: **0**

## Propiedades SIN ninguna foto (11)
| Ref | Dest. | Título | Lugar | Origen | Fotos OK | Enlaces |
|---|---|---|---|---|---|---|
| AG-04385 | ⭐ | PISO LUMINOSO Y ESPACIOSO PISO DE 4 DORMITORIOS | Barcelona, España | manual | 0/13 | [idealista](https://www.habitaclia.com/i57877000000021) https://assetsgolden.com/propiedades/piso-luminoso-y-espacioso-piso-de-4-dormitorios-mp84837k |
| AG-04485 | ⭐ | PISO EN CARRETERA DE SANTS, BARCELONA | Barcelona, España | manual | 0/11 |  https://assetsgolden.com/propiedades/piso-en-carretera-de-sants-barcelona-mpsg5hyh |
| AG-05131 | ⭐ | RESTAURANTE DE SERVICIO COMPLETO | Miami, Estados Unidos | manual | 0/5 |  https://assetsgolden.com/propiedades/restaurante-de-servicio-completo-mqdm326p |
| AG-05132 | ⭐ | PRESTIGIOSA PELUQUERÍA CANINA | Pompano Beach, Estados Unidos | manual | 0/4 |  https://assetsgolden.com/propiedades/prestigiosa-peluqueria-canina-mqdmf773 |
| AG-05133 | ⭐ | FULL SERVICE SALON & SPA | Bay Harbor, Estados Unidos | manual | 0/4 |  https://assetsgolden.com/propiedades/full-service-salon-spa-mqdmn119 |
| AG-05134 | ⭐ | EMPRESA DE GESTIÓN DE ALQUILERES VACACIONALES | Miami, Estados Unidos | manual | 0/2 |  https://assetsgolden.com/propiedades/empresa-de-gestion-de-alquileres-vacacionales-mqe2r9hd |
| AG-05178 | ⭐ | PISO REFORMADO EN EL CENTRO DE BARCELONA | Barcelona, España | manual | 0/16 |  https://assetsgolden.com/propiedades/piso-reformado-en-el-centro-de-barcelona-mqfgti7t |
| AG-05179 | ⭐ | FINCA RUSTICA CON LICENCIA VACACIONAL (ETV) EN MALLORCA | Porreres, España | manual | 0/31 |  https://assetsgolden.com/propiedades/finca-rustica-con-licencia-vacacional-etv-en-mallorca-mqfhuwql |
| AG-05322 | ⭐ | PARKING BENALMADENA - MALAGA | Benalmádena, España | manual | 0/6 |  https://assetsgolden.com/propiedades/parking-benalmadena---malaga-mqtsyn5y |
| AG-05323 | ⭐ | EDIFICIO PARA PARKING  - ANTEQUERA, MALAGA | Antequera, España | manual | 0/5 |  https://assetsgolden.com/propiedades/edificio-para-parking---antequera-malaga-mqttked0 |
| AG-05324 | ⭐ | EDIFICIO A REFORMAR - CAPUCHINO RESIDENCES - MALAGA | Málaga, España | manual | 0/7 |  https://assetsgolden.com/propiedades/edificio-a-reformar---capuchino-residences---malaga-mqtxmw5k |

## Propiedades con galería PARCIAL (0)
| Ref | Dest. | Título | Lugar | Origen | Fotos OK | Enlaces |
|---|---|---|---|---|---|---|


## Equipo sin foto (1)
| Nombre | Tipo | LinkedIn |
|---|---|---|
| ANA SERRAT | partner |  |

## Blog con portada rota (0)


## Destinos con imágenes rotas (0)


## Información perdida (no fotos)
- Cambios hechos desde el panel entre el **5 y el 21 de septiembre**: el backup es del 5/09. El log de auditoría muestra que en ese período la actividad habitual eran destacados, ocultar/vendida y gestión de leads. Las propiedades nuevas del feed HabiHub ya se regeneraron con el sync (85 insertadas el 22/09).
- **Leads web** del 5 al 21/09 (24 filas): no están en la BD, pero **sí en el Google Sheet "Contactos Web"**.
- **Contraseñas** de los 18 usuarios (2 admins + 16 agentes): cada uno debe usar "¿Olvidaste tu contraseña?" en /admin/login o /portal/login.
