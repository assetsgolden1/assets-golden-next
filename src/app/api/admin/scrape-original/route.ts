import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET() {
  try {
    // Dynamic import prevents puppeteer from being bundled at build time
    const { runScraper } = await import('@/scripts/scrapeOriginalWeb')
    const result = await runScraper()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
