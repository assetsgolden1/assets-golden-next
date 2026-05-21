# Debug: Meta Pixel no visible en producción
**Fecha:** 2026-05-22  
**Commit de origen del bug:** c2398f2 (ADS-P5)  
**Commit de fix:** (este commit)

---

## Síntomas reportados

- Meta Pixel Helper → "No se han encontrado píxeles" en assetsgolden.com  
- `Ctrl+U` no muestra `1009529298161262` en el código fuente

---

## Causa raíz identificada

**Causa 1 (principal):** La variable de entorno `NEXT_PUBLIC_META_PIXEL_ID` no estaba configurada en Vercel cuando se ejecutó el primer build del commit c2398f2. Las variables `NEXT_PUBLIC_*` se **embeben en el bundle JS en tiempo de build**, no en runtime. Si no están presentes durante el build, el valor queda como `undefined` y el componente ejecuta `return null`.

El redeploy posterior usó el **build cacheado** con el valor baked-in como `undefined`, por lo que añadir la env var en Vercel sin forzar un rebuild completo no tenía efecto.

**Causa 2 (arquitectura mejorada):** El `<Script strategy="afterInteractive">` estaba dentro de un componente `'use client'` (`MetaPixel.tsx`). Si bien esto es técnicamente soportado, es más frágil que ponerlo directamente en el server component del root layout:
- Con `'use client'` + `<Script>`: el script se inyecta después de la hidratación del componente cliente
- Con server component + `<Script>`: Next.js gestiona el script a nivel de layout, más robusto

---

## Verificación local pre-fix

```bash
curl -s http://localhost:3000 | grep '1009529298161262'
```
**Resultado:** `1009529298161262` sí aparece en el noscript del HTML server-rendered.

Los chunks JS del build (`0ebjul4896wi-.js`) contenían el pixel ID correctamente: `let o="1009529298161262"`, confirmando que el código era correcto localmente.

---

## Fix aplicado

### 1. `MetaPixel.tsx` — simplificado a SPA PageView tracker

```tsx
'use client'
// Solo dispara PageView en navegaciones SPA
// El init script está en layout.tsx (server component)
export default function MetaPixelPageViewTracker() {
  const pathname = usePathname()
  // ...useEffect para fbq('track', 'PageView') en cambios de ruta
}
```

### 2. `layout.tsx` — Script directamente en server component

```tsx
// Directamente en RootLayout (no dentro de 'use client')
{process.env.NEXT_PUBLIC_META_PIXEL_ID && (
  <Script
    id="meta-pixel"
    strategy="afterInteractive"
    dangerouslySetInnerHTML={{ __html: `...fbq init...` }}
  />
)}
```

**Por qué `dangerouslySetInnerHTML` en vez de JSX children:**  
Patrón oficial de Next.js docs para inline scripts. Más explícito y evita ambigüedad en el procesamiento del template literal por Turbopack.

---

## Verificación post-fix

```bash
# 1. HTML local muestra noscript con pixel ID
curl -s http://localhost:3000 | grep '1009529298161262'
# ✓ Aparece en <noscript> (renderizado server-side)

# 2. Build sin errores
npm run build
# ✓ Compiled successfully, TypeScript OK
```

---

## Acción requerida en Vercel

El nuevo commit (este fix) triggereará un **build fresco en Vercel**. Con `NEXT_PUBLIC_META_PIXEL_ID=1009529298161262` ya configurado en Vercel antes del build, el pixel ID quedará correctamente embebido.

**Verificación post-deploy:**
1. Instalar Meta Pixel Helper en Chrome
2. Visitar https://assetsgolden.com
3. El helper debe mostrar Pixel `1009529298161262` activo
4. En Network tab: requests a `connect.facebook.net` y `facebook.com/tr`

---

## Nota sobre META_CAPI_ACCESS_TOKEN

Si en Vercel el token tiene el formato `<EAAZAM...>` (con ángulos `<>`), las llamadas CAPI fallarán con error 401. El token debe ser solo el valor sin los caracteres `<>`.
