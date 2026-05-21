import crypto from 'crypto'

function hash(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function hashPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return crypto.createHash('sha256').update(digits).digest('hex')
}

interface SendCapiEventParams {
  eventName: 'Lead' | 'Contact' | 'ViewContent' | 'PageView'
  eventId?: string
  userData: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    city?: string
    country?: string
    clientIpAddress?: string
    clientUserAgent?: string
    fbp?: string
    fbc?: string
  }
  customData?: {
    currency?: string
    value?: number
    contentName?: string
    contentIds?: string[]
  }
  eventSourceUrl: string
}

export async function sendCapiEvent(event: SendCapiEventParams) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN

  if (!pixelId || !accessToken) return null

  const userData: Record<string, unknown> = {}
  if (event.userData.email) userData.em = hash(event.userData.email)
  if (event.userData.phone) userData.ph = hashPhone(event.userData.phone)
  if (event.userData.firstName) userData.fn = hash(event.userData.firstName)
  if (event.userData.lastName) userData.ln = hash(event.userData.lastName)
  if (event.userData.city) userData.ct = hash(event.userData.city)
  if (event.userData.country) userData.country = hash(event.userData.country)
  if (event.userData.clientIpAddress) userData.client_ip_address = event.userData.clientIpAddress
  if (event.userData.clientUserAgent) userData.client_user_agent = event.userData.clientUserAgent
  if (event.userData.fbp) userData.fbp = event.userData.fbp
  if (event.userData.fbc) userData.fbc = event.userData.fbc

  const customData: Record<string, unknown> = {}
  if (event.customData?.currency) customData.currency = event.customData.currency
  if (event.customData?.value != null) customData.value = event.customData.value
  if (event.customData?.contentName) customData.content_name = event.customData.contentName
  if (event.customData?.contentIds) customData.content_ids = event.customData.contentIds

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: event.eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        ...(event.eventId && { event_id: event.eventId }),
        ...(Object.keys(customData).length > 0 && { custom_data: customData }),
      },
    ],
  }

  // Test events solo en desarrollo
  if (
    process.env.META_CAPI_TEST_EVENT_CODE &&
    process.env.NODE_ENV !== 'production'
  ) {
    body.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE
  }

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${pixelId}/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    }
  )

  return res.json()
}
