"""
Parchea bali-raw.json: area_sqm, precios USD para IDR, property_type, location.
Salida: scripts/output/bali-fixed.json
"""
import json, re, os

RAW_IN   = r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-raw.json"
FIXED_OUT = r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-fixed.json"

# ── PATCHES HARDCODED ────────────────────────────────────────────────────────
# area_sqm (metros cuadrados construidos), extraídos de write-up o HTML detail-wrap
AREA_FIX = {
    "stunning-freehold-villa-in-uluwatu":                                         131,
    "rare-4-bedroom-freehold-villa-in-ungasan-with-panoramic-gwk-views":          250,
    "freehold-tropical-villas-for-sale-in-nusa-dua":                             275,
    "spacious-5-bedroom-villa-with-sunset-rice-field-views-in-kaba-kaba":         498,
    "tranquil-riverfront-retreat-three-villas-in-the-heart-of-canggu":           1050,
    "authentic-beachfront-6-bedroom-freehold-villa-in-jembrana":                 620,
    "walking-distance-villa-to-the-beach":                                        459,
    "luxury-villa-for-sale-in-prime-uluwatu-location":                            414,
    "unique-brand-new-villa-in-seseh":                                            229,
    "4-bedroom-leasehold-family-home-villa-in-kaba-kaba-with-rice-field-volcano-views": 247,
    "luxurious-leasehold-villa-in-bumbak-umalas":                                 239,
    "2-bedroom-leasehold-jungle-view-villa-close-to-nyang-nyang-beach":           110,
    "ubud-riverside-haven-2-bedroom-leasehold-villas":                            242,
    "luxurious-umalas-villa-modern-serenity-minutes-from-canggu-seminyak":        461,
    "leasehold-modern-wood-villa-in-buduk-canggu-early-bird-discount":            300,
    "luxurious-5-bedroom-villa-in-seminyak":                                      767,
    "outstanding-villas-complex-with-rice-field-view-in-canggu":                 1090,
    "huge-boutique-villa-for-sale-in-ungasan":                                    350,
    "1-bedroom-leasehold-villa-near-bingin-beach":                                 70,
    "luxurious-townhouses-for-sale-berawa":                                        70,
    "jungle-view-eco-style-apartment-in-dreamland":                                40,
    "luxury-leasehold-lofts-in-canggu-only-8-left":                               80,
    "unique-terracotta-style-villas-in-kedungu":                                  138,
    "stunning-ocean-view-1-bedroom-villa-in-uluwatu-with-private-pool-panoramic-rooftop": 182,
    "3br-mediterranean-jungle-villa-with-double-private-pool-concept":            155,
    "luxury-3br-riverfront-leasehold-villa-in-ubud-with-12-guaranteed-roi":       210,
    "luxury-family-villas-for-investment-in-seminyak":                            208,
}

# precios en USD para propiedades con precio IDR en JSON-LD (extraídos de HTML detail-wrap)
PRICE_USD_FIX = {
    "rare-4-bedroom-freehold-villa-in-ungasan-with-panoramic-gwk-views":  "249795",
    "freehold-tropical-villas-for-sale-in-nusa-dua":                     "416325",
    "spacious-5-bedroom-villa-with-sunset-rice-field-views-in-kaba-kaba": "888160",
    "tranquil-riverfront-retreat-three-villas-in-the-heart-of-canggu":   "2386930",
    "authentic-beachfront-6-bedroom-freehold-villa-in-jembrana":         "1221220",
    "4-bedroom-leasehold-family-home-villa-in-kaba-kaba-with-rice-field-volcano-views": "327509",
    "leasehold-modern-wood-villa-in-buduk-canggu-early-bird-discount":    "499590",
    "outstanding-villas-complex-with-rice-field-view-in-canggu":         "1276730",
    "unique-terracotta-style-villas-in-kedungu":                         "222040",
}

# location overrides (algunos extraídos mal o menos descriptivos)
LOC_FIX = {
    "authentic-beachfront-6-bedroom-freehold-villa-in-jembrana": "Jembrana",
    "luxury-leasehold-lofts-in-canggu-only-8-left":              "Canggu",
}

# property_type mapping
def map_property_type(slug: str, title: str, type_raw: str) -> str:
    slug_l  = slug.lower()
    title_l = title.lower()
    raw_l   = type_raw.lower()

    if "loft" in title_l or "loft" in raw_l:
        return "apartment"
    if "apartment" in title_l or "apartment" in raw_l:
        return "apartment"
    if "townhouse" in title_l or "townhouse" in raw_l:
        return "townhouse"
    return "villa"


def extract_narrative(writeup_text: str, title_en: str) -> str:
    """Return only narrative paragraphs (before numbered spec list)."""
    lines = writeup_text.splitlines()
    narrative = []
    for line in lines:
        line = line.strip().lstrip('﻿')
        if not line:
            continue
        # Stop at numbered spec list
        if re.match(r"^\d+\.\s", line):
            break
        # Skip BOM / title repeat
        if line == title_en or line == title_en.replace("&amp;", "&"):
            continue
        narrative.append(line)
    return "\n".join(narrative).strip()


with open(RAW_IN, encoding="utf-8") as f:
    raw = json.load(f)

fixed = []
for p in raw:
    slug = p["slug_prestige"]

    # area_sqm
    area = AREA_FIX.get(slug, "")
    area_note = ""
    if not area:
        # fallback: use land_sqm with note
        area = p.get("land_sqm", "")
        area_note = "usando land_sqm como fallback"

    # price / currency
    if slug in PRICE_USD_FIX:
        price    = PRICE_USD_FIX[slug]
        currency = "USD"
    else:
        price    = p["price"]
        currency = p.get("currency", "USD")

    # location
    location = LOC_FIX.get(slug, p.get("location", ""))

    # property_type
    property_type = map_property_type(slug, p.get("title_en",""), p.get("property_type_raw",""))

    # narrative description (English, for translation)
    narrative_en = extract_narrative(p.get("writeup_text",""), p.get("title_en",""))

    # photos folder: the one with images (last folder tends to be photos based on phase-1)
    folder_ids = [fid for fid in p.get("drive_folder_ids","").split("|") if fid]

    fixed.append({
        "slug_prestige":     slug,
        "link_prestige":     p["link_prestige"],
        "bloque":            p["bloque"],
        "title_en":          p["title_en"].replace("&amp;","&"),
        "external_id":       p["external_id"],
        "price":             price,
        "currency":          currency,
        "bedrooms":          p.get("bedrooms",""),
        "bathrooms":         p.get("bathrooms",""),
        "area_sqm":          str(area),
        "land_sqm":          p.get("land_sqm",""),
        "location":          location,
        "property_type":     property_type,
        "narrative_en":      narrative_en,
        "drive_folder_ids":  "|".join(folder_ids),
        "n_fotos":           p.get("n_fotos", 0),
        "n_videos":          p.get("n_videos", 0),
        "area_note":         area_note,
    })

os.makedirs(os.path.dirname(FIXED_OUT), exist_ok=True)
with open(FIXED_OUT, "w", encoding="utf-8") as f:
    json.dump(fixed, f, ensure_ascii=False, indent=2)

print(f"Fijados: {len(fixed)} propiedades -> {FIXED_OUT}")
for p in fixed:
    print(f"  {p['external_id']:8s} | {p['price']:>10s} {p['currency']} | area={p['area_sqm']:>5s} | {p['property_type']:10s} | {p['location']:15s} | {p['title_en'][:45]}")
