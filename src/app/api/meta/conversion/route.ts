import { NextRequest, NextResponse } from 'next/server'
import { sendCapiEvent } from '@/lib/meta/capi'
import { getMetaCookies } from '@/lib/meta/cookies'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventName, eventId, userData = {}, customData } = body

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      undefined

    const userAgent = request.headers.get('user-agent') ?? undefined
    const { fbp, fbc } = getMetaCookies(request)
    const referer = request.headers.get('referer') ?? 'https://assetsgolden.com'

    const result = await sendCapiEvent({
      eventName,
      eventId,
      userData: {
        ...userData,
        clientIpAddress: ip,
        clientUserAgent: userAgent,
        fbp,
        fbc,
      },
      customData,
      eventSourceUrl: referer,
    })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('[CAPI]', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
