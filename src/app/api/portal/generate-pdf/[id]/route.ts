import { NextRequest, NextResponse } from 'next/server'
import puppeteerCore from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/getUserRole'
import { generatePropertyPdfHtml } from '@/lib/pdf/propertyPdfTemplate'
import { getPropertyImages, resolveSelectedPhotos } from '@/lib/portal/propertyImages'
import type { Property } from '@/types'
import type { Agent } from '@/types/agent'

export const maxDuration = 60
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Binario remoto — versión debe coincidir con @sparticuz/chromium-min instalado (143.0.4)
const CHROMIUM_REMOTE_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'

const isServerless = !!process.env.VERCEL_ENV || !!process.env.AWS_LAMBDA_FUNCTION_NAME

async function getBrowser() {
  if (isServerless) {
    const executablePath = await chromium.executablePath(CHROMIUM_REMOTE_URL)
    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath,
      headless: 'shell',
    })
  }
  // Local: usa el Chromium bundleado con puppeteer
  const puppeteer = await import('puppeteer')
  return puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })
}

// GET: sin selección → PDF con el layout por defecto (portada + 2 fotos).
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  return renderPdf(request, ctx, undefined)
}

// POST: el agente manda `{ imageIndices: number[] }` (índices contra la lista
// canónica de fotos de la propiedad) para elegir qué fotos y en qué orden salen.
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  let imageIndices: unknown = undefined
  try {
    const body = await request.json()
    imageIndices = body?.imageIndices
  } catch {
    // body vacío o inválido → tratamos como sin selección
  }
  return renderPdf(request, ctx, imageIndices)
}

async function renderPdf(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  imageIndices: unknown,
) {
  const role = await getUserRole()
  if (role !== 'agent' && role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (propError || !property) {
    return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  let agent: Agent | null = null
  if (user) {
    const { data } = await supabase
      .from('agents')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    agent = data as Agent | null
  }

  // Selección validada contra las fotos reales de ESTA propiedad: Puppeteer
  // solo carga URLs que ya están en la BD (nunca URLs arbitrarias del cliente).
  const images = getPropertyImages(property as Property)
  const selectedPhotos = resolveSelectedPhotos(images, imageIndices)

  const siteOrigin = new URL(request.url).origin
  const html = generatePropertyPdfHtml(property as Property, agent, siteOrigin, selectedPhotos)

  let browser
  try {
    browser = await getBrowser()
    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    })

    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    await browser.close()
    browser = undefined

    const pdfBuffer = Buffer.from(pdfUint8)
    const filename = `${property.slug ?? id}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    if (browser) await browser.close().catch(() => {})
    console.error('[generate-pdf]', err)
    return NextResponse.json(
      { error: 'Error generando PDF', details: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 },
    )
  }
}
