import { NextRequest, NextResponse } from 'next/server'
import { appendLeadToSheets } from '@/lib/googleSheets'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, readRateLimit, getIdentifier } from '@/lib/ratelimit'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const rateLimitCheck = await checkRateLimit(
    readRateLimit,
    getIdentifier(request)
  )
  if (!rateLimitCheck.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: rateLimitCheck.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimitCheck.retryAfter) } }
    )
  }

  console.log('[Test] GOOGLE_SHEETS_LEADS_ID:',
    process.env.GOOGLE_SHEETS_LEADS_ID)
  console.log('[Test] GOOGLE_SHEETS_CREDENTIALS_JSON exists:',
    !!process.env.GOOGLE_SHEETS_CREDENTIALS_JSON)
  console.log('[Test] GOOGLE_SHEETS_CREDENTIALS_JSON length:',
    process.env.GOOGLE_SHEETS_CREDENTIALS_JSON?.length)

  try {
    await appendLeadToSheets({
      name: 'Test Usuario',
      email: 'test@test.com',
      phone: '+34600000000',
      type: 'test',
      message: 'Test desde API route',
      source: 'test',
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      error: String(error)
    }, { status: 500 })
  }
}
