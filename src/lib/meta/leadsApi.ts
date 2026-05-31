const META_GRAPH_BASE = 'https://graph.facebook.com/v19.0'

export interface MetaLeadRaw {
  id: string
  created_time: string
  ad_id?: string
  ad_name?: string
  field_data: Array<{ name: string; values: string[] }>
}

interface MetaLeadsResponse {
  data: MetaLeadRaw[]
  paging?: {
    next?: string
    cursors?: { before?: string; after?: string }
  }
}

export async function fetchLeadsFromMeta(
  formId: string,
  sinceTimestamp: number,
): Promise<MetaLeadRaw[]> {
  const token = process.env.META_SYSTEM_USER_TOKEN
  if (!token) throw new Error('META_SYSTEM_USER_TOKEN no configurado')

  const leads: MetaLeadRaw[] = []
  let url: string | null =
    `${META_GRAPH_BASE}/${formId}/leads` +
    `?access_token=${token}` +
    `&since=${sinceTimestamp}` +
    `&fields=id,created_time,ad_id,ad_name,field_data` +
    `&limit=100`

  while (url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Meta Graph API error ${res.status}: ${errText}`)
    }
    const body = (await res.json()) as MetaLeadsResponse
    if (Array.isArray(body.data)) {
      leads.push(...body.data)
    }
    url = body.paging?.next ?? null
  }

  return leads
}
