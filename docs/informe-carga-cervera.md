# Informe dry-run — carga Cervera

> Generado por `npm run cervera -- report`. **No se escribió nada en la BD.**

## Resumen

| | |
|---|---|
| Proyectos en la fuente | 122 |
| **Listos para cargar** | **65** |
| Duplicados detectados (no se cargan) | 4 |
| Excluidos por datos insuficientes | 53 |

## Exclusiones

| Motivo | N |
|---|---|
| sin imagen ni precio | 26 |
| sin imagen | 9 |
| sin precio válido | 18 |

## ⚠️ Posibles duplicados — NO se cargan

Detectados por token distintivo compartido. Revisar y decidir a mano (puede ser la misma torre cargada antes, o una fase distinta del mismo complejo).

| Cervera | Ya en el catálogo | Coincide en |
|---|---|---|
| The St. Regis Residences | AG-00808 — APARTAMENTO EN THE PARK REGIS | `regis` |
| The Rider Residences | AG-00805 — THE RIDER MIAMI 1, 2 y 3 D | `rider` |
| Domus Brickell Center | AG-00020 — CONDO HOTEL DOMUS EN BRICKELL - MIAMI | `domus` |
| Domus Brickell Park | AG-00020 — CONDO HOTEL DOMUS EN BRICKELL - MIAMI | `domus` |

## ⚠️ Precios PSF descartados (revisión manual)

La fuente trae el precio por pie cuadrado en el campo de precio. Se cargan SIN precio o se excluyen.

| Proyecto | Valor en la fuente |
|---|---|
| One West Palm | 2750 |
| Nautilus 220 | 950 |
| La Mare | 1157 |
| The Raleigh Rosewood Hotel & Residences | 3000 |
| River District | 1200 |
| 2000 Ocean | 1400 |
| Rosewood Hillsboro | 2100 |
| One Metropica | 550 |
| One Park Tower by Turnberry | 900 |
| Visions at Brickell Station | 1080 |
| Diesel Wynwood Condos | 913 |

## Sin ciudad (11) — decisión tuya

La dirección no se pudo extraer de la ficha. Se cargarían con país (Estados Unidos) pero **sin ciudad**: no aparecerían en filtros por ciudad y la ficha queda más pobre. Opciones: cargarlas igual, o dejarlas para completar a mano.

- Mandarin Oriental Residences, West Palm Beach — https://cerverabrokerportal.com/projects/mandarin-oriental-residences-west-palm-beach/
- Seven Park — https://cerverabrokerportal.com/projects/seven-park/
- Hollywood Moon — https://cerverabrokerportal.com/projects/hollywood-moon/
- Bay Harbor Towers — https://cerverabrokerportal.com/projects/bay-harbor-towers/
- Casa Murano Las Olas — https://cerverabrokerportal.com/projects/casa-murano-las-olas/
- Alba Palm Beach — https://cerverabrokerportal.com/projects/alba-palm-beach/
- Andare Residences — https://cerverabrokerportal.com/projects/andare-residences/
- Sixth & Rio — https://cerverabrokerportal.com/projects/sixth-rio/
- The Condominium Residences at Pier Sixty-Six — https://cerverabrokerportal.com/projects/the-condominium-residences-at-pier-sixty-six/
- Selene Oceanfront Residences — https://cerverabrokerportal.com/projects/selene-oceanfront-residences/
- Natiivo Fort Lauderdale — https://cerverabrokerportal.com/projects/natiivo-fort-lauderdale/

## Muestra de 5 fichas normalizadas

### Mandarin Oriental Residences, West Palm Beach

```
{
 "external_id": "4107",
 "external_source": "cervera",
 "title": "Mandarin Oriental Residences, West Palm Beach",
 "slug": "mandarin-oriental-residences-west-palm-beach-4107",
 "country": "Estados Unidos",
 "province": null,
 "location": null,
 "property_type": "apartment",
 "price": 3500000,
 "currency": "USD",
 "area_sqm": 200,
 "bedrooms": null,
 "bathrooms": null,
 "description": "Ubicada a lo largo de la vía navegable intracoastal de Palm Beach y envueltas en serenos jardines tropicales, Mandarin Oriental Residences, West Palm Beach inauguran una nueva era de refinada vida frente al mar. Concebid…",
 "description_en": "Set along a private shore of the Intracoastal Waterway and enveloped in tranquil tropical gardens, Mandarin Oriental Res…",
 "image_url": "https://cerverabrokerportal.com/wp-content/uploads/2026/02/hero-mo-wpb.jpg",
 "gallery_urls": [
  "https://cerverabrokerportal.com/wp-content/uploads/2026/02/hero-mo-wpb.jpg",
  "https://cerverabrokerportal.com/wp-content/uploads/2026/02/overview-mo-wpb.jpg"
 ],
 "features": [
  "31 plantas",
  "87 residencias",
  "Entrega 2031"
 ],
 "is_development": true,
 "skip": null,
 "warnings": [
  "sin ciudad (no se pudo extraer la dirección)"
 ],
 "sourceUrl": "https://cerverabrokerportal.com/projects/mandarin-oriental-residences-west-palm-beach/"
}
```

### Seventeen Gables

```
{
 "external_id": "3768",
 "external_source": "cervera",
 "title": "Seventeen Gables",
 "slug": "seventeen-gables-3768",
 "country": "Estados Unidos",
 "province": "Florida",
 "location": "Coral Gables",
 "property_type": "apartment",
 "price": 634900,
 "currency": "USD",
 "area_sqm": 52,
 "bedrooms": null,
 "bathrooms": null,
 "description": "Seventeen Gabes se encuentra en el corazón de todo — cerca de Miracle Mile y The Shops at Merrick Park, con fácil acceso a Brickell y al centro de la ciudad. Una dirección boutique rodeada de calles arboladas, las mejore…",
 "description_en": "Seventeen Gables is set in the heart of it all — near Miracle Mile and The Shops at Merrick Park, with easy access to Br…",
 "image_url": "https://cerverabrokerportal.com/wp-content/uploads/2024/08/featured-seventeen-gables.jpg",
 "gallery_urls": [
  "https://cerverabrokerportal.com/wp-content/uploads/2024/08/featured-seventeen-gables.jpg",
  "https://cerverabrokerportal.com/wp-content/uploads/2025/10/25_235_02_FACHADA_2_DIA_FINAL-scaled.jpg"
 ],
 "features": [
  "8 plantas",
  "117 residencias",
  "Entrega 2028"
 ],
 "is_development": true,
 "skip": null,
 "warnings": [],
 "sourceUrl": "https://cerverabrokerportal.com/projects/seventeen-gables/"
}
```

### Missioni Baia

```
{
 "external_id": "3693",
 "external_source": "cervera",
 "title": "Missioni Baia",
 "slug": "missioni-baia-3693",
 "country": "Estados Unidos",
 "province": "Florida",
 "location": "Miami",
 "property_type": "apartment",
 "price": 560000,
 "currency": "USD",
 "area_sqm": 63,
 "bedrooms": null,
 "bathrooms": null,
 "description": "Missioni Baia es una promoción de obra nueva en Miami, Florida (Estados Unidos). Está promovida por oko_group y con arquitectura de revuelta_architecture_international,asymptote_architecture. Las viviendas parten de 63 m…",
 "description_en": "Missioni Baia is a new development in Miami, Florida (United States). It is developed by oko_group and with architecture…",
 "image_url": "https://cerverabrokerportal.com/wp-content/uploads/2025/09/missioni-baia.webp",
 "gallery_urls": [
  "https://cerverabrokerportal.com/wp-content/uploads/2025/09/missioni-baia.webp"
 ],
 "features": [
  "Promotora: oko_group",
  "Arquitectura: revuelta_architecture_international,asymptote_architecture",
  "Entrega 2023"
 ],
 "is_development": true,
 "skip": null,
 "warnings": [],
 "sourceUrl": "https://cerverabrokerportal.com/projects/missioni-baia/"
}
```

### Seven Park

```
{
 "external_id": "3512",
 "external_source": "cervera",
 "title": "Seven Park",
 "slug": "seven-park-3512",
 "country": "Estados Unidos",
 "province": null,
 "location": null,
 "property_type": "apartment",
 "price": 370000,
 "currency": "USD",
 "area_sqm": 46,
 "bedrooms": null,
 "bathrooms": null,
 "description": "Seven Park es una promoción de obra nueva (Estados Unidos). Las viviendas parten de 46 m² y llegan hasta 153 m². Amenidades: Elevated Amenities That Inspire Leisure & Wellness: • Resort-style pool, 2 hot tubs, private ca…",
 "description_en": "SEVEN PARK is more than a building — it’s a signal of what’s next. Across from a $30 million green space and minutes fro…",
 "image_url": "https://cerverabrokerportal.com/wp-content/uploads/2025/07/Screen-Shot-2025-07-23-at-11.28.09-AM.png",
 "gallery_urls": [
  "https://cerverabrokerportal.com/wp-content/uploads/2025/07/Screen-Shot-2025-07-23-at-11.28.09-AM.png"
 ],
 "features": [],
 "is_development": true,
 "skip": null,
 "warnings": [
  "sin ciudad (no se pudo extraer la dirección)"
 ],
 "sourceUrl": "https://cerverabrokerportal.com/projects/seven-park/"
}
```

### Poolhaus

```
{
 "external_id": "3504",
 "external_source": "cervera",
 "title": "Poolhaus",
 "slug": "poolhaus-3504",
 "country": "Estados Unidos",
 "province": "Florida",
 "location": "Bay Harbor Islands",
 "property_type": "apartment",
 "price": 1990000,
 "currency": "USD",
 "area_sqm": 203,
 "bedrooms": null,
 "bathrooms": null,
 "description": "Poolhaus es una promoción de obra nueva en Bay Harbor Islands, Florida (Estados Unidos). El edificio cuenta con 18 residencias. Las viviendas parten de 203 m² y llegan hasta 297 m². Entrega prevista: Q2 2026.…",
 "description_en": "Nestled in the serene enclave of Bay Harbor Islands, Pool Haus features a limited collection of eighteen expansive resid…",
 "image_url": "https://cerverabrokerportal.com/wp-content/uploads/2025/07/Screen-Shot-2025-07-22-at-12.58.57-PM.png",
 "gallery_urls": [
  "https://cerverabrokerportal.com/wp-content/uploads/2025/07/Screen-Shot-2025-07-22-at-12.58.57-PM.png"
 ],
 "features": [
  "18 residencias",
  "Entrega 2026"
 ],
 "is_development": true,
 "skip": null,
 "warnings": [],
 "sourceUrl": "https://cerverabrokerportal.com/projects/poolhaus/"
}
```

## Excluidos — detalle para carga manual

| Proyecto | Motivo | Ficha |
|---|---|---|
| Aria Reserve South | sin imagen | https://cerverabrokerportal.com/projects/aria-reserve-south/ |
| Edgehouse | sin precio válido | https://cerverabrokerportal.com/projects/edgehouse/ |
| Twenty Sixth & 2nd Wynwood | sin precio válido | https://cerverabrokerportal.com/projects/twenty-sixth-2nd-wynwood/ |
| The Well Bay Harbor Islands | sin imagen | https://cerverabrokerportal.com/projects/the-well-bay-harbor-islands/ |
| The Cloud One Hotel & Residences | sin imagen | https://cerverabrokerportal.com/projects/the-cloud-one-hotel-residences/ |
| Jean-Georges Miami Tropic Residences | sin precio válido | https://cerverabrokerportal.com/projects/jean-georges-miami-tropic-residences/ |
| Midtown Park | sin precio válido | https://cerverabrokerportal.com/projects/midtown-park/ |
| Season One Brickell | sin imagen ni precio | https://cerverabrokerportal.com/projects/season-one-brickell/ |
| Millux Place Miami | sin imagen ni precio | https://cerverabrokerportal.com/projects/millux-place-miami/ |
| Atelier | sin imagen | https://cerverabrokerportal.com/projects/atelier/ |
| Missoni Baia | sin precio válido | https://cerverabrokerportal.com/projects/missoni-baia/ |
| 1212 Aventura | sin precio válido | https://cerverabrokerportal.com/projects/1212-aventura/ |
| Quadro Design District | sin precio válido | https://cerverabrokerportal.com/projects/quadro-design-district/ |
| Villa 17 | sin precio válido | https://cerverabrokerportal.com/projects/villa-17/ |
| Six Fisher Island | sin imagen ni precio | https://cerverabrokerportal.com/projects/six-fisher-island/ |
| Olakino House | sin imagen ni precio | https://cerverabrokerportal.com/projects/olakino-house/ |
| 100 Las Olas | sin imagen ni precio | https://cerverabrokerportal.com/projects/100-las-olas/ |
| COVE Miami | sin imagen ni precio | https://cerverabrokerportal.com/projects/cove-miami-2/ |
| Cora | sin precio válido | https://cerverabrokerportal.com/projects/cora/ |
| One West Palm | sin precio válido | https://cerverabrokerportal.com/projects/one-west-palm/ |
| Shorecrest | sin imagen | https://cerverabrokerportal.com/projects/shorecrest/ |
| Nautilus 220 | sin imagen ni precio | https://cerverabrokerportal.com/projects/nautilus-220/ |
| Forte On Flagler | sin imagen ni precio | https://cerverabrokerportal.com/projects/forte-on-flagler/ |
| The Ritz-Carlton Residences, West Palm Beach | sin imagen | https://cerverabrokerportal.com/projects/the-ritz-carlton-residences-west-palm-beach/ |
| Olara Residences | sin imagen | https://cerverabrokerportal.com/projects/olara-residences/ |
| La Mare | sin imagen ni precio | https://cerverabrokerportal.com/projects/la-mare/ |
| La Baia North Tower | sin imagen ni precio | https://cerverabrokerportal.com/projects/la-baia-north-tower/ |
| The Raleigh Rosewood Hotel & Residences | sin imagen ni precio | https://cerverabrokerportal.com/projects/the-raleigh-rosewood-hotel-residences/ |
| Pagani Residences Miami | sin imagen ni precio | https://cerverabrokerportal.com/projects/pagani-residences-miami/ |
| Sage on the Intracoastal | sin imagen ni precio | https://cerverabrokerportal.com/projects/sage-on-the-intracoastal/ |
| One W12 | sin imagen ni precio | https://cerverabrokerportal.com/projects/one-w12/ |
| Edge House | sin imagen ni precio | https://cerverabrokerportal.com/projects/edge-house/ |
| River District | sin imagen ni precio | https://cerverabrokerportal.com/projects/river-district/ |
| 2000 Ocean | sin imagen ni precio | https://cerverabrokerportal.com/projects/2000-ocean/ |
| Rosewood Hillsboro | sin imagen ni precio | https://cerverabrokerportal.com/projects/rosewood-hillsboro/ |
| One Metropica | sin imagen ni precio | https://cerverabrokerportal.com/projects/one-metropica/ |
| Nexxo Residences | sin imagen ni precio | https://cerverabrokerportal.com/projects/nexxo-residences/ |
| Bentley Residences | sin precio válido | https://cerverabrokerportal.com/projects/bentley-residences/ |
| One Park Tower by Turnberry | sin imagen ni precio | https://cerverabrokerportal.com/projects/one-park-tower-by-turnberry/ |
| The Village at Coral Gables | sin imagen ni precio | https://cerverabrokerportal.com/projects/the-village-at-coral-gables-2/ |
| District 14 | sin imagen | https://cerverabrokerportal.com/projects/district-14/ |
| Smart Brickell 3 | sin imagen | https://cerverabrokerportal.com/projects/smart-brickell-3/ |
| Visions at Brickell Station | sin imagen ni precio | https://cerverabrokerportal.com/projects/visions-at-brickell-station/ |
| St Regis Sunny Isles Beach | sin imagen ni precio | https://cerverabrokerportal.com/projects/st-regis-sunny-isles-beach/ |
| Mr.C Tigertail | sin imagen ni precio | https://cerverabrokerportal.com/projects/mr-c-tigertail/ |
| ELLE Miami | sin precio válido | https://cerverabrokerportal.com/projects/elle-miami/ |
| COVE Miami | sin precio válido | https://cerverabrokerportal.com/projects/cove-miami/ |
| The Standard | sin precio válido | https://cerverabrokerportal.com/projects/the-standard/ |
| Edition Residences | sin precio válido | https://cerverabrokerportal.com/projects/edition-residences/ |
| Diesel Wynwood Condos | sin precio válido | https://cerverabrokerportal.com/projects/diesel-wynwood/ |
| Rose Wynwood | sin precio válido | https://cerverabrokerportal.com/projects/rose-wynwood/ |
| Mr.C | sin imagen ni precio | https://cerverabrokerportal.com/projects/mr-c/ |
| Aston Martin Residences | sin precio válido | https://cerverabrokerportal.com/projects/aston-martin-residences/ |