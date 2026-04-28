import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/getUserRole'
import { generatePropertyPdfHtml } from '@/lib/pdf/propertyPdfTemplate'
import type { Property } from '@/types'
import type { Agent } from '@/types/agent'

export const maxDuration = 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

  const siteOrigin = new URL(request.url).origin
  const html = generatePropertyPdfHtml(property as Property, agent, siteOrigin)

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    })

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

    // Puppeteer v20+ returns Uint8Array<ArrayBufferLike>; convert to Buffer
    // so NextResponse accepts it as BodyInit.
    const pdfBuffer = Buffer.from(pdfUint8)
    const filename  = `${property.slug ?? id}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control':       'private, no-store',
      },
    })
  } catch (err) {
    if (browser) await browser.close().catch(() => {})
    console.error('[generate-pdf]', err)
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 })
  }
}
