import * as dotenv from 'dotenv'
import path from 'path'

// Load env for local execution
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import puppeteer from 'puppeteer'
import { supabaseAdmin } from '@/lib/supabase/admin'

const URLS_TO_SCRAPE = [
  'https://assetsgolden.com/properties?country=Paraguay&region=Asunci%C3%B3n',
  'https://assetsgolden.com/properties?country=Indonesia&region=ULUWATU',
  'https://assetsgolden.com/properties?country=Indonesia&region=CANGGU',
  'https://assetsgolden.com/properties?country=Indonesia&region=UNGASAN',
  'https://assetsgolden.com/properties?country=Indonesia&region=UBUD',
  'https://assetsgolden.com/properties?country=Indonesia&region=Tumbakbayuh',
  'https://assetsgolden.com/properties?country=Indonesia&region=JIMBARAN',
  'https://assetsgolden.com/properties?country=Indonesia&region=UMALAS',
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
}

async function scrapeWeb(): Promise<ScrapedProperty[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const allProperties: ScrapedProperty[] = []

  for (const url of URLS_TO_SCRAPE) {
    console.log(`\n📍 Scrapeando: ${url}`)

    const urlObj = new URL(url)
    const country = decodeURIComponent(urlObj.searchParams.get('country') ?? '')
    const region  = decodeURIComponent(urlObj.searchParams.get('region')  ?? '')

    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    )

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

      // Wait for React to hydrate
      await page.waitForSelector(
        '[data-testid="property-card"], .property-card, article, .card',
        { timeout: 10000 }
      ).catch(() => {})
      await new Promise(r => setTimeout(r, 3000))

      // Collect unique property links
      const propertyLinks = await page.evaluate(() =>
        [...new Set(
          Array.from(document.querySelectorAll('a[href*="/properties/"]'))
            .map(a => (a as HTMLAnchorElement).href)
            .filter(href => /\/properties\/[^?#]+/.test(href))
        )]
      )

      console.log(`  Encontradas ${propertyLinks.length} propiedades`)

      for (const propUrl of propertyLinks) {
        const propPage = await browser.newPage()
        try {
          await propPage.goto(propUrl, { waitUntil: 'networkidle2', timeout: 30000 })
          await new Promise(r => setTimeout(r, 2000))

          const data = await propPage.evaluate(() => {
            const getText = (selectors: string[]): string => {
              for (const sel of selectors) {
                const el = document.querySelector(sel)
                const text = el?.textContent?.trim()
                if (text) return text
              }
              return ''
            }

            const getImages = (): string[] =>
              Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src =>
                  src.startsWith('http') &&
                  !src.includes('placeholder') &&
                  !src.includes('logo') &&
                  !src.includes('icon')
                )

            const title = getText(['h1', '.property-title', '[data-testid="title"]'])

            const priceText = getText([
              '.price', '.property-price', '[data-testid="price"]',
              '[class*="price"]', '[class*="Price"]',
            ])

            const description = getText([
              '.description', '.property-description',
              '[data-testid="description"]', '[class*="description"]',
              'p',
            ])

            const bodyText = document.body.innerText ?? ''
            const bedroomsMatch = bodyText.match(/(\d+)\s*(habitaciones|bedrooms|dormitorios|beds?|hab)/i)
            const bathroomsMatch = bodyText.match(/(\d+)\s*(baños|bathrooms|baño|baths?)/i)
            const areaMatch = bodyText.match(/(\d[\d.,]*)\s*(m²|m2|sqm|sq\.m)/i)

            return {
              title,
              priceText,
              description,
              bedrooms:  bedroomsMatch  ? parseInt(bedroomsMatch[1], 10)           : null,
              bathrooms: bathroomsMatch ? parseInt(bathroomsMatch[1], 10)          : null,
              area_sqm:  areaMatch      ? parseFloat(areaMatch[1].replace(',', '.')) : null,
              images:    getImages(),
              fullText:  bodyText.slice(0, 2000),
            }
          })

          // Parse price
          const priceClean = data.priceText.replace(/[^\d]/g, '')
          const price = priceClean ? parseInt(priceClean, 10) : null
          const currency = data.priceText.includes('$')
            ? 'USD'
            : data.priceText.includes('€') ? 'EUR' : 'USD'

          // Infer property type from title/description
          const text = (data.title + ' ' + data.description).toLowerCase()
          const property_type =
            text.includes('villa')      ? 'villa'     :
            text.includes('penthouse')  ? 'penthouse' :
            text.includes('house')      ? 'house'     :
            text.includes('townhouse')  ? 'townhouse' :
            text.includes('commercial') ? 'commercial':
            'apartment'

          allProperties.push({
            title:         data.title || propUrl,
            price,
            currency,
            location:      region,
            country,
            description:   data.description,
            bedrooms:      data.bedrooms,
            bathrooms:     data.bathrooms,
            area_sqm:      data.area_sqm,
            property_type,
            image_url:     data.images[0] ?? null,
            gallery_urls:  data.images.slice(0, 10),
            source_url:    propUrl,
          })

          console.log(`    ✓ ${data.title || propUrl}`)
        } catch (err) {
          console.error(`    ✗ Error en ${propUrl}:`, err)
        } finally {
          await propPage.close()
        }
      }
    } catch (err) {
      console.error(`✗ Error scrapeando ${url}:`, err)
    } finally {
      await page.close()
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
      const baseSlug = prop.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)

      const { error } = await supabaseAdmin
        .from('properties')
        .insert({
          title:           prop.title,
          slug:            `${baseSlug}-${Date.now().toString(36)}`,
          price:           prop.price,
          currency:        prop.currency,
          location:        prop.location,
          country:         prop.country,
          description:     prop.description || null,
          bedrooms:        prop.bedrooms,
          bathrooms:       prop.bathrooms,
          area_sqm:        prop.area_sqm,
          property_type:   prop.property_type,
          image_url:       prop.image_url,
          gallery_urls:    prop.gallery_urls.length > 0 ? prop.gallery_urls : null,
          status:          'available',
          external_source: 'scraper-lovable',
          external_id:     prop.source_url,
          hidden:          false,
          sold:            false,
        })

      if (error) {
        console.error(`  ✗ ${prop.title}: ${error.message}`)
        errors++
      } else {
        imported++
        console.log(`  ✓ ${prop.title}`)
      }
    } catch (err) {
      errors++
      console.error('  Error general:', err)
    }
  }

  return { imported, errors }
}

export async function runScraper() {
  console.log('🚀 Iniciando scraper...\n')
  const properties = await scrapeWeb()

  console.log('\n💾 Guardando en Supabase...')
  const result = await importToSupabase(properties)

  return {
    scraped:    properties.length,
    imported:   result.imported,
    errors:     result.errors,
    properties: properties.map(p => ({
      title:    p.title,
      country:  p.country,
      location: p.location,
      price:    p.price,
      images:   p.gallery_urls.length,
    })),
  }
}
