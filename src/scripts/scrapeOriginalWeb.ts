import puppeteer from 'puppeteer'
import { supabaseAdmin } from '@/lib/supabase/admin'

const PROPERTY_URLS = [
  'https://assetsgolden.com/property/0a2533a5-f8b0-4f33-a84b-f62abfa9515a',
  'https://assetsgolden.com/property/3f9ff093-ae44-4fa9-9e80-9b7805588d00',
  'https://assetsgolden.com/property/0ad39683-2ebe-46d2-acec-62e0f3430ee2',
  'https://assetsgolden.com/property/735f3a4c-14bd-4e3b-b879-04addeb8b17f',
  'https://assetsgolden.com/property/d79980c6-033d-437d-9676-f4635c2e10f7',
  'https://assetsgolden.com/property/b6ac7d67-42ff-4370-8686-17bd20f93c66',
  'https://assetsgolden.com/property/57673ada-31d4-4ac8-b2b6-bbf324f8420f',
  'https://assetsgolden.com/property/1fcd1123-438e-47e4-9a92-19d7e1b40f4b',
  'https://assetsgolden.com/property/ea3e1eaf-ebb5-4e78-bc30-b70cbf87658e',
]

interface ScrapedProperty {
  title: string
  price: number | null
  currency: string
  location: string
  country: string
  description: string
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  property_type: string
  image_url: string | null
  gallery_urls: string[]
  source_url: string
  external_id: string
}

async function scrapeWeb() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const allProperties: ScrapedProperty[] = []

  for (const propUrl of PROPERTY_URLS) {
    console.log(`\n📍 Scrapeando: ${propUrl}`)

    const propPage = await browser.newPage()
    await propPage.setViewport({ width: 1920, height: 1080 })

    try {
      await propPage.goto(propUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      })

      // SPA tarda en renderizar — esperar 6s
      await new Promise(r => setTimeout(r, 6000))

      // No usar funciones con nombre dentro de evaluate — tsx/esbuild inyecta
      // __name() para preservar nombres, pero esa referencia no existe en el
      // contexto del browser al serializar la función con Function.toString()
      const data = await propPage.evaluate(() => {
        const bodyText = document.body?.innerText ?? ''

        const title =
          document.querySelector('h1')?.textContent?.trim() ||
          document.querySelector('.property-title')?.textContent?.trim() ||
          document.querySelector('[data-testid="title"]')?.textContent?.trim() ||
          ''

        const priceText =
          document.querySelector('.price')?.textContent?.trim() ||
          document.querySelector('.property-price')?.textContent?.trim() ||
          document.querySelector('[data-testid="price"]')?.textContent?.trim() ||
          (bodyText.match(/\$[\d,]+/)?.[0] ?? '')

        const description =
          document.querySelector('.description')?.textContent?.trim() ||
          document.querySelector('.property-description')?.textContent?.trim() ||
          document.querySelector('[data-testid="description"]')?.textContent?.trim() ||
          document.querySelector('p')?.textContent?.trim() ||
          ''

        const images = Array.from(document.querySelectorAll('img'))
          .map((img) => (img as HTMLImageElement).src)
          .filter((src) =>
            src.startsWith('http') &&
            !src.includes('placeholder') &&
            !src.includes('logo') &&
            !src.includes('avatar') &&
            !src.includes('icon') &&
            !src.includes('data:image')
          )

        const bedroomsMatch  = bodyText.match(/(\d+)\s*(habitaciones|bedrooms|dormitorios|hab|rooms)/i)
        const bathroomsMatch = bodyText.match(/(\d+)\s*(baños|bathrooms|baño|bath)/i)
        const areaMatch      = bodyText.match(/(\d+(?:[.,]\d+)?)\s*(m²|m2|sqm|sq\.m)/i)
        const countryMatch   = bodyText.match(/(Paraguay|Indonesia|Bali)/i)
        const cityMatch      = bodyText.match(/(Asunci[oó]n|Uluwatu|Canggu|Ungasan|Ubud|Tumbakbayuh|Jimbaran|Umalas|Bali)/i)

        return {
          title,
          priceText,
          description,
          bedrooms:     bedroomsMatch  ? parseInt(bedroomsMatch[1],  10) : null,
          bathrooms:    bathroomsMatch ? parseInt(bathroomsMatch[1], 10) : null,
          area_sqm:     areaMatch      ? parseFloat(areaMatch[1].replace(',', '.')) : null,
          images,
          countryHint:  countryMatch?.[0] ?? '',
          cityHint:     cityMatch?.[0]    ?? '',
          pageTitle:    document.title ?? '',
        }
      })

      const priceClean = data.priceText.replace(/[^\d]/g, '')
      const price = priceClean ? parseInt(priceClean) : null

      const currency = data.priceText.includes('$')
        ? 'USD'
        : data.priceText.includes('€')
          ? 'EUR'
          : 'USD'

      const country = data.countryHint || 'Indonesia'

      const externalId = propUrl.split('/property/')[1] ?? propUrl

      allProperties.push({
        title: data.title || `Propiedad ${externalId.slice(0, 8)}`,
        price,
        currency,
        location: data.cityHint || '',
        country,
        description: data.description,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area_sqm: data.area_sqm,
        property_type: 'villa',
        image_url: data.images[0] ?? null,
        gallery_urls: data.images.slice(0, 15),
        source_url: propUrl,
        external_id: externalId,
      })

      console.log(`  ✓ ${data.title} | ${country} / ${data.cityHint} | ${data.images.length} fotos`)
    } catch (err) {
      console.error(`  ✗ Error en ${propUrl}:`, err)
    } finally {
      await propPage.close()
    }
  }

  await browser.close()

  console.log(`\n📦 Total scrapeadas: ${allProperties.length}`)
  return allProperties
}

async function importToSupabase(properties: ScrapedProperty[]) {
  let imported = 0
  let errors = 0

  for (const prop of properties) {
    try {
      const slug = prop.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)

      const { error } = await supabaseAdmin
        .from('properties')
        .insert({
          title: prop.title,
          slug: `${slug}-${Date.now()}`,
          price: prop.price,
          currency: prop.currency,
          location: prop.location,
          country: prop.country,
          description: prop.description,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area_sqm: prop.area_sqm,
          property_type: prop.property_type,
          image_url: prop.image_url,
          gallery_urls: prop.gallery_urls,
          status: 'available',
          external_source: 'scraper-lovable',
          external_id: prop.external_id,
        })

      if (error) {
        console.error(`✗ ${prop.title}: ${error.message}`)
        errors++
      } else {
        imported++
        console.log(`✓ ${prop.title}`)
      }
    } catch (err) {
      errors++
      console.error('Error general:', err)
    }
  }

  return { imported, errors }
}

export async function runScraper() {
  console.log('🚀 Iniciando scraper de propiedades directas...\n')
  const properties = await scrapeWeb()

  console.log('\n💾 Guardando en Supabase...')
  const result = await importToSupabase(properties)

  console.log('\n📊 RESULTADO FINAL:')
  console.log(`  Scrapeadas: ${properties.length}`)
  console.log(`  Importadas: ${result.imported}`)
  console.log(`  Errores: ${result.errors}`)

  return {
    scraped: properties.length,
    imported: result.imported,
    errors: result.errors,
    properties: properties.map(p => ({
      title: p.title,
      country: p.country,
      location: p.location,
      price: p.price,
      images: p.gallery_urls.length,
    })),
  }
}

if (require.main === module) {
  runScraper().then(result => {
    console.log('\n✅ Resultado:', JSON.stringify(result, null, 2))
    process.exit(0)
  }).catch(err => {
    console.error('\n❌ Error fatal:', err)
    process.exit(1)
  })
}
