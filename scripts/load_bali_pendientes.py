#!/usr/bin/env python3
"""
FASE-4.N-P10 — Cargar 4 propiedades Bali desde ZIPs
  INSERT: PV261, PV163, PD199 (skip si ya existen)
  UPDATE: PV656 — solo gallery_urls + image_url (sin tocar ningun otro campo)
"""

import re, unicodedata, time, random, string, json, zipfile, shutil, sys
from pathlib import Path

try:
    import pillow_heif
    from PIL import Image, ImageOps
    pillow_heif.register_heif_opener()
    print("pillow_heif: OK")
except ImportError as e:
    print(f"ERROR: pillow_heif no disponible: {e}")
    print("Instalar: pip install pillow-heif")
    sys.exit(1)

import requests

# ─── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://mromkwpqrxpxbbxhdofs.supabase.co"
SERVICE_ROLE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb21rd3BxcnhweGJieGhkb2ZzIiwicm9sZSI6"
    "InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc1OTE0MSwiZXhwIjoyMDkxMzM1MTQxfQ"
    ".LrfvQ9Uuso382t_cbEqA5fcgiZe4qS2c-WQFwvvkojo"
)
HDR_AUTH = {"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"}
HDR_JSON = {**HDR_AUTH, "Content-Type": "application/json", "Prefer": "return=representation"}

ZIPS_DIR = Path(r"C:\Users\Asus\Downloads\fotos")
OUT_BASE = Path(r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-fotos-pendientes")
LOG_PATH = Path(r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-carga-log.json")

IMG_EXT = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".gif", ".bmp", ".tiff"}
MAX_PX  = 2000

# ─── Datos de propiedades ──────────────────────────────────────────────────────
PROPS = {
    "PV261": {
        "action":        "insert",
        "title":         "Villa de Lujo en Venta en Ubicación Premium en Uluwatu",
        "description": (
            "Prepárate para disfrutar de una vida de opulencia y sofisticación en esta impresionante villa de dos plantas "
            "ubicada en el corazón de Uluwatu. Asentada en 1.017 m² de terreno, la propiedad cuenta con 4 dormitorios en "
            "suite a tan solo 500 metros de la reconocida Karma Beach.\n\n"
            "Ubicación privilegiada: situada en la codiciada área de Uluwatu, esta villa ofrece proximidad a Karma Beach, "
            "convirtiéndola en un oasis ideal para los amantes de la playa y quienes buscan la mejor vida costera.\n\n"
            "Diseño exquisito: artesanía impecable, carpintería maciza y una majestuosa escalera de Murbao son solo el "
            "comienzo. Tecnología de vanguardia: sistemas de ventanas Allegro, griferías alemanas Grohe y un completo "
            "sistema de domótica garantizan confort y seguridad.\n\n"
            "Piscina infinity con vistas: la piscina infinity con pared transparente ofrece panorámicas impresionantes y "
            "el rincón perfecto para descansar. Particiones de vidrio inteligente: una perfecta fusión entre interior y "
            "exterior gracias a particiones que se abren hacia el entorno natural.\n\n"
            "Completamente amueblada con electrodomésticos de alta gama. Seguridad integral: puertas automáticas y sistema "
            "de vigilancia completo para tu tranquilidad. Una oportunidad única de poseer este pedazo de paraíso en Uluwatu, "
            "ya sea como residencia principal de lujo o como propiedad de inversión rentable."
        ),
        "property_type": "villa",
        "price":         1600000,
        "currency":      "USD",
        "country":       "Indonesia",
        "location":      "Uluwatu",
        "bedrooms":      4,
        "bathrooms":     5,
        "area_sqm":      414,
    },
    "PV163": {
        "action":        "insert",
        "title":         "Gran Villa Boutique en Venta en Ungasan",
        "description": (
            "Ubicada en el área de Bukit, Bali, esta gran villa boutique se asienta en un expansivo terreno de 1.500 m², "
            "ofreciendo amplio espacio para relajarse. Con 350 m² de construcción, la villa cuenta con 4 dormitorios, "
            "4 baños y aseo de invitados, perfecta para familias o grupos de amigos.\n\n"
            "En el interior encontrarás espacios comunes amplios y luminosos que se integran con coherencia estética. "
            "La ecléctica decoración fusiona estilos incorporando elementos de color, función, textura, forma y peso sin "
            "resultar abrumadora. La cocina bien equipada incluye una cómoda isla, mientras que cada dormitorio ofrece "
            "impresionantes vistas a la piscina y el jardín gracias a sus amplios ventanales.\n\n"
            "En el exterior, la hermosa piscina cuenta con un cómodo sofá bajo toldo para relajarse en los días más "
            "calurosos. Disfrutarás también de buenas vistas al mar y de fácil acceso en coche a las mejores playas y "
            "beach clubs del Bukit, como Pandawa, Balangan, Dreamland y Padang-Padang.\n\n"
            "Otras características incluyen mobiliario completo, limpieza diaria, recepción 24 horas, jardín, seguridad, "
            "instalaciones de barbacoa, estacionamiento seguro y lavandería. Leasehold hasta 2043 (20 años más) con "
            "zonificación residencial."
        ),
        "property_type": "villa",
        "price":         960000,
        "currency":      "USD",
        "country":       "Indonesia",
        "location":      "Ungasan",
        "bedrooms":      4,
        "bathrooms":     5,
        "area_sqm":      350,
    },
    "PD199": {
        "action":        "insert",
        "title":         "Lujosos Townhouses en Venta en Berawa",
        "description": (
            "Descubre el epítome de la vida tropical moderna con nuestra exquisita colección de villas de 1 y 2 dormitorios "
            "situadas en un prestigioso complejo. A tan solo 10 minutos a pie de la cautivadora Berawa Beach, los townhouses "
            "ofrecen la combinación perfecta de comodidad, estilo y belleza natural, rodeados de un vibrante barrio con "
            "cafés, restaurantes y tiendas de primer nivel.\n\n"
            "Villa de 1 dormitorio – 250.000 USD: 70 m² de espacio meticulosamente diseñado con jardín trasero y jacuzzi.\n\n"
            "Villa de 2 dormitorios – 320.000 USD: 110 m² con piscina privada.\n\n"
            "Ofrecidos bajo título leasehold de 29 años más extensión de 10 años. Las instalaciones del complejo incluyen "
            "piscina de 22 × 3,6 m, cine al aire libre y zona de BBQ/bar/shisha. Disponibles con opción a elegir entre "
            "3 diseños diferentes."
        ),
        "property_type": "townhouse",
        "price":         250000,
        "currency":      "USD",
        "country":       "Indonesia",
        "location":      "Berawa",
        "bedrooms":      1,
        "bathrooms":     1,
        "area_sqm":      70,
    },
    "PV656": {
        "action": "update",
    },
}

# ─── Helpers ───────────────────────────────────────────────────────────────────
def to_base36(n):
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    r = ""
    while n:
        r = chars[n % 36] + r
        n //= 36
    return r or "0"

def make_slug(title):
    nfd    = unicodedata.normalize("NFD", title.lower())
    no_acc = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
    base   = re.sub(r"[^a-z0-9\s-]", "", no_acc).strip()
    base   = re.sub(r"\s+", "-", base)
    return f"{base}-{to_base36(int(time.time() * 1000))}"

def upload_image(local_path):
    ts   = int(time.time() * 1000)
    rand = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    path = f"properties/{ts}-{rand}.jpg"
    with open(local_path, "rb") as f:
        data = f.read()
    for attempt in range(1, 4):
        try:
            r = requests.post(
                f"{SUPABASE_URL}/storage/v1/object/property-images/{path}",
                headers={**HDR_AUTH, "Content-Type": "image/jpeg", "x-upsert": "true"},
                data=data,
                timeout=120,
            )
            if r.status_code not in (200, 201):
                raise Exception(f"HTTP {r.status_code}: {r.text[:300]}")
            pub = f"{SUPABASE_URL}/storage/v1/object/public/property-images/{path}"
            print(f"    OK (intento {attempt}) {local_path.name} -> {path}")
            return pub
        except Exception as e:
            print(f"    Intento {attempt}/3 fallido: {e}")
            if attempt < 3:
                time.sleep(3)
    raise Exception(f"Upload fallido tras 3 intentos: {local_path.name}")

OUT_BASE.mkdir(parents=True, exist_ok=True)

# ─── Paso 1 + 2: Descomprimir, convertir, comprimir, renumerar ────────────────
print("=" * 60)
print("PASO 1+2: Descomprimir y procesar imágenes")
print("=" * 60)

processed = {}

for zip_path in sorted(ZIPS_DIR.glob("*.zip")):
    m = re.match(r"^(P[VD]\d+)", zip_path.stem)
    if not m:
        print(f"\nSKIP (sin external_id): {zip_path.name}")
        continue
    ext_id = m.group(1)
    if ext_id not in PROPS:
        print(f"\nSKIP (no en lista target): {ext_id}")
        continue

    prop_dir = OUT_BASE / ext_id
    opt_dir  = prop_dir / "optimizadas"

    print(f"\n--- {ext_id}: {zip_path.name} ---")

    # Limpiar y extraer
    if prop_dir.exists():
        shutil.rmtree(prop_dir)
    prop_dir.mkdir(parents=True)

    print(f"  Extrayendo a {prop_dir.name}/...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(prop_dir)

    # Buscar imágenes recursivamente (excluye carpeta optimizadas si existiera)
    all_imgs = sorted(
        f for f in prop_dir.rglob("*")
        if f.is_file()
        and f.suffix.lower() in IMG_EXT
        and "optimizadas" not in f.parts
    )
    print(f"  Imágenes encontradas: {len(all_imgs)}")
    for img in all_imgs:
        print(f"    {img.relative_to(prop_dir)}")

    if not all_imgs:
        print(f"  WARN: sin imágenes — skip {ext_id}")
        processed[ext_id] = {"status": "sin_fotos"}
        continue

    opt_dir.mkdir(exist_ok=True)
    n_heic    = 0
    opt_files = []

    for i, src in enumerate(all_imgs, start=1):
        is_heic = src.suffix.lower() in (".heic", ".heif")
        if is_heic:
            n_heic += 1
        dst = opt_dir / f"{i:02d}.jpg"

        img = Image.open(src)
        img = ImageOps.exif_transpose(img)
        if img.mode not in ("RGB",):
            img = img.convert("RGB")

        w, h = img.size
        if max(w, h) > MAX_PX:
            scale = MAX_PX / max(w, h)
            img   = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

        quality = 90 if is_heic else 85
        img.save(dst, "JPEG", quality=quality, optimize=True)

        size_orig = src.stat().st_size // 1024
        size_new  = dst.stat().st_size // 1024
        tag = "HEIC->JPG" if is_heic else "img"
        print(f"  [{i:02d}] {src.name} ({tag})  {size_orig}KB -> {size_new}KB  {img.size[0]}x{img.size[1]}")
        opt_files.append(dst)

    print(f"  Procesadas: {len(opt_files)}  |  HEIC convertidas: {n_heic}")
    processed[ext_id] = {"opt_files": opt_files, "n_heic": n_heic}

# ─── Paso 3-5: Upload + INSERT/UPDATE ─────────────────────────────────────────
print("\n" + "=" * 60)
print("PASO 3-5: Upload a Supabase + INSERT/UPDATE")
print("=" * 60)

log_entries = []

for ext_id, prop_cfg in PROPS.items():
    if ext_id not in processed:
        print(f"\n[{ext_id}] SKIP: ZIP no encontrado o external_id no reconocido")
        continue
    if processed[ext_id].get("status") == "sin_fotos":
        print(f"\n[{ext_id}] SKIP: sin fotos en el ZIP")
        continue

    opt_files = processed[ext_id]["opt_files"]
    n_heic    = processed[ext_id]["n_heic"]
    action    = prop_cfg["action"]

    print(f"\n--- {ext_id} | accion={action} | fotos={len(opt_files)} ---")
    print(f"  Subiendo {len(opt_files)} imágenes...")

    gallery_urls = []
    for f in opt_files:
        url = upload_image(f)
        gallery_urls.append(url)
        time.sleep(0.3)

    image_url = gallery_urls[0]
    print(f"  image_url: {image_url}")
    print(f"  n_gallery: {len(gallery_urls)}")

    # ── INSERT ──────────────────────────────────────────────────────────────────
    if action == "insert":
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/properties?external_id=eq.{ext_id}"
            "&select=id,slug,ref_code",
            headers=HDR_AUTH, timeout=15,
        )
        existing = r.json()
        if existing:
            print(f"  SKIP INSERT: {ext_id} ya existe -> ref_code={existing[0].get('ref_code')}")
            log_entries.append({
                "external_id": ext_id,
                "status":      "skip_exists",
                "ref_code":    existing[0].get("ref_code"),
                "slug":        existing[0].get("slug"),
                "n_fotos":     len(gallery_urls),
                "n_heic":      n_heic,
            })
            continue

        slug    = make_slug(prop_cfg["title"])
        payload = {
            "title":          prop_cfg["title"],
            "slug":           slug,
            "description":    prop_cfg["description"],
            "price":          prop_cfg["price"],
            "currency":       prop_cfg["currency"],
            "country":        prop_cfg["country"],
            "province":       None,
            "location":       prop_cfg["location"],
            "bedrooms":       int(prop_cfg["bedrooms"]),
            "bathrooms":      int(prop_cfg["bathrooms"]),
            "area_sqm":       prop_cfg["area_sqm"],
            "property_type":  prop_cfg["property_type"],
            "classification": None,
            "status":         "active",
            "is_development": False,
            "featured":       False,
            "hidden":         False,
            "sold":           False,
            "external_source":"prestige-bali",
            "external_id":    ext_id,
            "image_url":      image_url,
            "gallery_urls":   gallery_urls,
        }

        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/properties",
            headers=HDR_JSON, json=payload, timeout=30,
        )
        if r.status_code not in (200, 201):
            raise Exception(f"INSERT {ext_id} falló {r.status_code}: {r.text}")
        row = r.json()
        if isinstance(row, list):
            row = row[0]
        prop_id = row.get("id")
        print(f"  INSERT OK — id={prop_id}  slug={row.get('slug')}  ref_code={row.get('ref_code')}")

        time.sleep(1.5)
        r2 = requests.get(
            f"{SUPABASE_URL}/rest/v1/properties?id=eq.{prop_id}"
            "&select=id,slug,ref_code,location,image_url,gallery_urls",
            headers=HDR_AUTH, timeout=15,
        )
        fresh = r2.json()[0] if r2.ok and r2.json() else row
        print(f"  ref_code (post-trigger): {fresh.get('ref_code')}")
        print(f"  location               : {fresh.get('location')}")
        print(f"  n_gallery              : {len(fresh.get('gallery_urls') or [])}")

        log_entries.append({
            "external_id": ext_id,
            "status":      "ok",
            "action":      "insert",
            "ref_code":    fresh.get("ref_code"),
            "slug":        fresh.get("slug"),
            "n_fotos":     len(gallery_urls),
            "n_heic":      n_heic,
            "location":    fresh.get("location"),
            "image_url":   image_url,
            "property_id": prop_id,
            "cargado_at":  time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })

    # ── UPDATE PV656 (solo gallery_urls + image_url) ────────────────────────────
    elif action == "update":
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/properties?external_id=eq.{ext_id}"
            "&select=id,slug,ref_code",
            headers=HDR_AUTH, timeout=15,
        )
        existing = r.json()
        if not existing:
            print(f"  WARN: {ext_id} no existe en DB — no se puede hacer UPDATE")
            continue

        prop_id  = existing[0]["id"]
        ref_code = existing[0].get("ref_code")
        slug_db  = existing[0].get("slug")
        print(f"  Encontrado: id={prop_id}  ref_code={ref_code}")

        patch = {"image_url": image_url, "gallery_urls": gallery_urls}
        r2 = requests.patch(
            f"{SUPABASE_URL}/rest/v1/properties?id=eq.{prop_id}",
            headers=HDR_JSON, json=patch, timeout=30,
        )
        if r2.status_code not in (200, 201, 204):
            raise Exception(f"UPDATE {ext_id} falló {r2.status_code}: {r2.text}")
        print(f"  UPDATE OK (HTTP {r2.status_code}) — gallery_urls + image_url actualizados")

        log_entries.append({
            "external_id": ext_id,
            "status":      "ok",
            "action":      "update_gallery",
            "ref_code":    ref_code,
            "slug":        slug_db,
            "n_fotos":     len(gallery_urls),
            "n_heic":      n_heic,
            "image_url":   image_url,
            "property_id": prop_id,
            "cargado_at":  time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })

# ─── Guardar en log ────────────────────────────────────────────────────────────
with open(LOG_PATH, encoding="utf-8") as f:
    log = json.load(f)
log.append({
    "run":       "FASE-4.N-P10",
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "entries":   log_entries,
})
with open(LOG_PATH, "w", encoding="utf-8") as f:
    json.dump(log, f, ensure_ascii=False, indent=2)

# ─── Reporte final ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("REPORTE FINAL")
print("=" * 60)
for e in log_entries:
    print(f"\n  {e['external_id']}")
    print(f"    status   : {e.get('status')}")
    print(f"    action   : {e.get('action', '-')}")
    print(f"    ref_code : {e.get('ref_code', '-')}")
    print(f"    slug     : {e.get('slug', '-')}")
    print(f"    n_fotos  : {e.get('n_fotos', 0)}")
    print(f"    n_heic   : {e.get('n_heic', 0)}")

print(f"\nLog guardado: {LOG_PATH}")
print("\n=== DONE ===")
