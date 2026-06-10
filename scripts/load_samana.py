import re, unicodedata, time, random, string, json, requests
from pathlib import Path
from PIL import Image, ImageOps

SUPABASE_URL = "https://mromkwpqrxpxbbxhdofs.supabase.co"
SERVICE_ROLE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb21rd3BxcnhweGJieGhkb2ZzIiwicm9sZSI6"
    "InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc1OTE0MSwiZXhwIjoyMDkxMzM1MTQxfQ"
    ".LrfvQ9Uuso382t_cbEqA5fcgiZe4qS2c-WQFwvvkojo"
)

HDR_JSON = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

BASE = Path(r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\samana-fotos")
OPT  = BASE / "optimizadas"
OPT.mkdir(exist_ok=True)

# Orden de galería: piscina (principal), playa, nocturna, garita, implantacion, urbanismo
GALLERY = [
    "02_VistaAereaPiscina.jpg",
    "06_VistaAereaPlaya.jpg",
    "03_VistaAereaNocturna.jpg",
    "01_AccesoGarita.jpg",
    "04_Implantacion.jpg",
    "05_Urbanismo.jpg",
]

# ─── PASO 1: Comprimir ────────────────────────────────────────────────────────
print("=== PASO 1: Comprimir ===")
for fname in GALLERY:
    src = BASE / fname
    dst = OPT / fname
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    if img.mode != "RGB":
        img = img.convert("RGB")
    w, h = img.size
    MAX = 2000
    if max(w, h) > MAX:
        scale = MAX / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    img.save(dst, "JPEG", quality=85, optimize=True)
    print(f"  {fname}: {src.stat().st_size//1024} KB -> {dst.stat().st_size//1024} KB  ({img.size[0]}x{img.size[1]})")


# ─── PASO 2: Upload a Supabase Storage ───────────────────────────────────────
def to_base36(n):
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    r = ""
    while n:
        r = chars[n % 36] + r
        n //= 36
    return r or "0"


def upload(local_path):
    ts   = int(time.time() * 1000)
    rand = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    path = f"properties/{ts}-{rand}.jpg"
    with open(local_path, "rb") as f:
        data = f.read()
    r = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/property-images/{path}",
        headers={
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "image/jpeg",
            "x-upsert": "true",
        },
        data=data,
        timeout=60,
    )
    if r.status_code not in (200, 201):
        raise Exception(f"Upload fallo {r.status_code}: {r.text}")
    pub = f"{SUPABASE_URL}/storage/v1/object/public/property-images/{path}"
    print(f"  OK {local_path.name} -> {path}")
    return pub


print("\n=== PASO 2: Upload ===")
gallery_urls = []
for fname in GALLERY:
    url = upload(OPT / fname)
    gallery_urls.append(url)
    time.sleep(0.3)

image_url = gallery_urls[0]  # VistaAereaPiscina = principal
playa_url = gallery_urls[1]  # VistaAereaPlaya   = country_destinations

print(f"\nimage_url : {image_url}")
print(f"playa_url : {playa_url}")

# ─── PASO 3: Generar slug ─────────────────────────────────────────────────────
title = "My Dream Samana"  # sin tilde para el slug (como JS normalize)
nfd = unicodedata.normalize("NFD", title.lower())
no_accents = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
base = re.sub(r"[^a-z0-9\s-]", "", no_accents).strip()
base = re.sub(r"\s+", "-", base)
slug = f"{base}-{to_base36(int(time.time() * 1000))}"
print(f"\nslug: {slug}")

# ─── PASO 3: INSERT property ──────────────────────────────────────────────────
DESCRIPTION = (
    "My Dream Samaná: vive tu propia aventura.\n\n"
    "En Las Pascualas, donde la selva toca el mar, nace un refugio de paz a solo 5 minutos del corazón de Samaná. "
    "Un rincón exclusivo, abrazado por montañas y playas vírgenes, donde la vida fluye al ritmo del Caribe y el lujo no interrumpe la naturaleza.\n\n"
    "En My Dream Samaná, el lujo y la naturaleza coexisten en perfecta armonía: un exclusivo conjunto de apartamentos con acceso privado a playa, "
    "justo en el lugar donde las majestuosas ballenas nos visitan durante su temporada. Con impresionantes vistas al mar, este entorno único invita "
    "al descanso, la aventura y la belleza, dando paso a un estilo sereno, auténtico y sin excesos.\n\n"
    "La comodidad de lo moderno, con las bondades intactas de lo natural. My Dream Samaná une diseño consciente, acceso inmediato a la ciudad y el "
    "privilegio de acceso privado a playa. Aquí, la tranquilidad tropical es real.\n\n"
    "My Dream Samaná te envuelve en calma, pero también te invita a reencontrarte con esa versión tuya que jugaba con el mar. Entre columpios sobre "
    "la arena, senderos de selva y equipo para kayaking, paddle, pesca, buceo y exploración, cada día es emocionante.\n\n"
    "Precio desde 151.000 USD. Entrega a partir de febrero de 2028."
)

prop_payload = {
    "title": "My Dream Samaná",
    "slug": slug,
    "description": DESCRIPTION,
    "price": 151000,
    "currency": "USD",
    "country": "República Dominicana",
    "province": "Samaná",
    "location": "Samaná",
    "bedrooms": 1,
    "bathrooms": 1,
    "area_sqm": 60,
    "property_type": "apartment",
    "classification": None,
    "status": "active",
    "is_development": True,
    "featured": False,
    "hidden": False,
    "sold": False,
    "external_source": "my-dream-samana",
    "external_id": "SAMANA-MYDREAM",
    "image_url": image_url,
    "gallery_urls": gallery_urls,
}

print("\n=== PASO 3: INSERT property ===")
r = requests.post(
    f"{SUPABASE_URL}/rest/v1/properties",
    headers=HDR_JSON,
    json=prop_payload,
    timeout=30,
)
if r.status_code not in (200, 201):
    raise Exception(f"Insert property fallo {r.status_code}: {r.text}")
prop_row = r.json()
if isinstance(prop_row, list):
    prop_row = prop_row[0]
print(f"  id       : {prop_row.get('id')}")
print(f"  slug     : {prop_row.get('slug')}")
print(f"  ref_code : {prop_row.get('ref_code')}")

# Releer para capturar ref_code del trigger
time.sleep(1.5)
prop_id = prop_row.get("id")
r2 = requests.get(
    f"{SUPABASE_URL}/rest/v1/properties?id=eq.{prop_id}&select=id,slug,ref_code,image_url,gallery_urls",
    headers={"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"},
    timeout=15,
)
fresh = r2.json()[0] if r2.ok and r2.json() else prop_row
print(f"  ref_code (post-trigger) : {fresh.get('ref_code')}")
print(f"  gallery_urls count      : {len(fresh.get('gallery_urls') or [])}")
print(f"  image_url               : {fresh.get('image_url')}")

# ─── PASO 4: INSERT country_destinations ─────────────────────────────────────
print("\n=== PASO 4: INSERT country_destinations ===")
country_raw = "Republica Dominicana"
cs = unicodedata.normalize("NFD", country_raw.lower())
cs = "".join(c for c in cs if unicodedata.category(c) != "Mn")
cs = re.sub(r"[^a-z0-9\s-]", "", cs).strip()
cs = re.sub(r"\s+", "-", cs)
country_slug = re.sub(r"-+", "-", cs)
print(f"  country_slug: {country_slug}")

DEST_DESC = (
    "República Dominicana combina playas caribeñas de arena blanca, naturaleza exuberante y un mercado de obra nueva en crecimiento. "
    "La península de Samaná, con sus bahías de ballenas y selva tropical, es uno de sus enclaves más exclusivos."
)

dest_payload = {
    "country_name": "República Dominicana",
    "slug": country_slug,
    "description": DEST_DESC,
    "active": True,
    "hero_image_url": playa_url,
    "card_image_url": playa_url,
}

r = requests.post(
    f"{SUPABASE_URL}/rest/v1/country_destinations",
    headers=HDR_JSON,
    json=dest_payload,
    timeout=15,
)
if r.status_code not in (200, 201):
    raise Exception(f"Insert country_destinations fallo {r.status_code}: {r.text}")
dest_row = r.json()
if isinstance(dest_row, list):
    dest_row = dest_row[0]
print(f"  id            : {dest_row.get('id')}")
print(f"  country_name  : {dest_row.get('country_name')}")
print(f"  slug          : {dest_row.get('slug')}")
print(f"  active        : {dest_row.get('active')}")
print(f"  hero_image_url: {dest_row.get('hero_image_url')}")

print("\n=== DONE ===")
