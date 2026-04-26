import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasSheetsId: !!process.env.GOOGLE_SHEETS_LEADS_ID,
    sheetsIdLength: process.env.GOOGLE_SHEETS_LEADS_ID?.length,
    hasCredentials: !!process.env.GOOGLE_SHEETS_CREDENTIALS_JSON,
    credentialsLength: process.env.GOOGLE_SHEETS_CREDENTIALS_JSON?.length,
    nodeEnv: process.env.NODE_ENV,
  })
}
