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

OPT = Path(r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-fotos\PV656_tranquil-riverfront-retreat\optimizadas")
LOG_PATH = Path(r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-carga-log.json")

# Las 4 URLs ya subidas
BASE_PUB = f"{SUPABASE_URL}/storage/v1/object/public/property-images"
already_uploaded = [
    f"{BASE_PUB}/properties/1780869436355-7kxiel.jpg",  # 01_bridge
    f"{BASE_PUB}/properties/1780869439676-qk2f7i.jpg",  # 02_outdoor-gym
    f"{BASE_PUB}/properties/1780869440772-46m2rz.jpg",  # 03_pool-night
    f"{BASE_PUB}/properties/1780869441888-lg5pv6.jpg",  # 04_view-bridge
]

# ─── Idempotencia ──────────────────────────────────────────────────────────────
print("=== Verificando idempotencia ===")
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/properties?external_id=eq.PV656&select=id,slug,ref_code",
    headers={"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"},
    timeout=15,
)
existing = r.json()
if existing:
    print(f"  SKIP: PV656 ya existe -> {existing[0]}")
    raise SystemExit(0)
print("  OK: PV656 no existe, procediendo.")

# ─── Upload foto 5 (con retry) ────────────────────────────────────────────────
def to_base36(n):
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    r = ""
    while n:
        r = chars[n % 36] + r
        n //= 36
    return r or "0"

def upload_with_retry(local_path, max_retries=3, timeout=120):
    for attempt in range(1, max_retries + 1):
        try:
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
                timeout=timeout,
            )
            if r.status_code not in (200, 201):
                raise Exception(f"HTTP {r.status_code}: {r.text}")
            pub = f"{SUPABASE_URL}/storage/v1/object/public/property-images/{path}"
            print(f"  OK (intento {attempt}) {local_path.name} -> {path}")
            return pub
        except Exception as e:
            print(f"  Intento {attempt}/{max_retries} fallido: {e}")
            if attempt < max_retries:
                time.sleep(3)
    raise Exception(f"Upload fallido tras {max_retries} intentos")

print("\n=== Subiendo foto 5 (05_evening-garden-view.jpg) ===")
url5 = upload_with_retry(OPT / "05_evening-garden-view.jpg")

gallery_urls = already_uploaded + [url5]
image_url = gallery_urls[0]
print(f"\nn_gallery : {len(gallery_urls)}")
print(f"image_url : {image_url}")

# ─── Slug ─────────────────────────────────────────────────────────────────────
title_ascii = "Refugio Tranquilo a Orillas del Rio Tres Villas en el Corazon de Canggu"
nfd = unicodedata.normalize("NFD", title_ascii.lower())
no_acc = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
base = re.sub(r"[^a-z0-9\s-]", "", no_acc).strip()
base = re.sub(r"\s+", "-", base)
slug = f"{base}-{to_base36(int(time.time() * 1000))}"
print(f"slug: {slug}")

# ─── Description ─────────────────────────────────────────────────────────────
DESCRIPTION = (
    "Enclavado en un paisaje sereno por el que discurre un río, este extraordinario conjunto de tres villas ofrece "
    "una armoniosa combinación de naturaleza, lujo y privacidad. Inspiradas en los exuberantes entornos de la jungla "
    "de Ubud, pero a solo minutos de los vibrantes restaurantes y beach clubs de Canggu, esta propiedad ofrece lo "
    "mejor de ambos mundos.\n\n"
    "La Villa Uno es una exclusiva residencia privada boutique con jardines orgánicos, piscina de 12 metros, chimenea "
    "acogedora y gimnasio al aire libre. Dispone de pabellón spa privado, estudio de arte y cocina de planta abierta "
    "perfecta para reuniones íntimas o fiestas privadas. Los 1.000 m² de jardines paisajísticos brindan espacio para "
    "descansar, mientras que la chimenea junto a la piscina invita a relajarse, disfrutar de las vistas o hacer una "
    "barbacoa. El amplio dormitorio de planta baja de 45 m² está dividido en dos zonas, una llena de luz para los "
    "madrugadores y un rincón oscuro para quienes prefieren dormir más. El gimnasio al aire libre hace también las "
    "veces de estudio de yoga.\n\n"
    "La Villa Dos es una residencia de dos dormitorios en suite con piscina privada suficientemente profunda para "
    "clases de buceo, rodeada de árboles frutales y huertos, con pabellón piscina al aire libre, área de barbacoa "
    "y chimenea.\n\n"
    "La Villa Tres es una casa joglo antigua de un dormitorio con piscina privada y sereno jardín acuático, perfecta "
    "para quienes buscan paz e intimidad.\n\n"
    "Juntas, estas tres villas crean un refugio extraordinario que fusiona naturaleza, lujo y tranquilidad."
)

# ─── INSERT property ──────────────────────────────────────────────────────────
prop_payload = {
    "title": "Refugio Tranquilo a Orillas del Río: Tres Villas en el Corazón de Canggu",
    "slug": slug,
    "description": DESCRIPTION,
    "price": 2386930,
    "currency": "USD",
    "country": "Indonesia",
    "province": None,
    "location": "Canggu",
    "bedrooms": 4,
    "bathrooms": 4,
    "area_sqm": 1050,
    "property_type": "villa",
    "classification": None,
    "status": "active",
    "is_development": False,
    "featured": False,
    "hidden": False,
    "sold": False,
    "external_source": "prestige-bali",
    "external_id": "PV656",
    "image_url": image_url,
    "gallery_urls": gallery_urls,
}

print("\n=== INSERT property ===")
r = requests.post(
    f"{SUPABASE_URL}/rest/v1/properties",
    headers=HDR_JSON,
    json=prop_payload,
    timeout=30,
)
if r.status_code not in (200, 201):
    raise Exception(f"Insert fallo {r.status_code}: {r.text}")
prop_row = r.json()
if isinstance(prop_row, list):
    prop_row = prop_row[0]
print(f"  id       : {prop_row.get('id')}")
print(f"  slug     : {prop_row.get('slug')}")
print(f"  ref_code : {prop_row.get('ref_code')}")

time.sleep(1.5)
prop_id = prop_row.get("id")
r2 = requests.get(
    f"{SUPABASE_URL}/rest/v1/properties?id=eq.{prop_id}&select=id,slug,ref_code,location,image_url,gallery_urls",
    headers={"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"},
    timeout=15,
)
fresh = r2.json()[0] if r2.ok and r2.json() else prop_row
print(f"  ref_code (post-trigger): {fresh.get('ref_code')}")
print(f"  location               : {fresh.get('location')}")
print(f"  n_gallery              : {len(fresh.get('gallery_urls') or [])}")

# ─── Actualizar log ───────────────────────────────────────────────────────────
log_entry = {
    "external_id": "PV656",
    "status": "cargado",
    "ref_code": fresh.get("ref_code"),
    "slug": fresh.get("slug"),
    "n_fotos": len(gallery_urls),
    "location": fresh.get("location"),
    "image_url": fresh.get("image_url"),
    "property_id": prop_id,
    "cargado_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "nota": "Drive solo tenia 5 fotos accesibles (carpeta Picture); 36 fotos en Prestige Bali website no accesibles via Drive",
}
with open(LOG_PATH, encoding="utf-8") as f:
    log = json.load(f)
log.append(log_entry)
with open(LOG_PATH, "w", encoding="utf-8") as f:
    json.dump(log, f, ensure_ascii=False, indent=2)
print(f"\nLog actualizado.")
print("\n=== DONE ===")
