const META_GRAPH_BASE = 'https://graph.facebook.com/v19.0'

export interface MetaLeadRaw {
  id: string
  created_time: string
  ad_id?: string
  ad_name?: string
  adset_id?: string
  adset_name?: string
  campaign_id?: string
  campaign_name?: string
  field_data: Array<{ name: string; values: string[] }>
  platform?: string
}

interface MetaLeadsResponse {
  data: MetaLeadRaw[]
  paging?: {
    cursors?: { before?: string; after?: string }
  }
}

const FIELDS = 'id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,field_data,platform'

export async function fetchLeadsFromMeta(
  formId: string,
  accessToken: string,
  sinceTimestamp?: number,
): Promise<MetaLeadRaw[]> {
  const leads: MetaLeadRaw[] = []

  const baseParams = new URLSearchParams({ fields: FIELDS, limit: '50' })
  if (sinceTimestamp) {
    baseParams.set(
      'filtering',
      JSON.stringify([{ field: 'time_created', operator: 'GREATER_THAN', value: sinceTimestamp }]),
    )
  }

  let cursor: string | undefined

  do {
    const params = new URLSearchParams(baseParams)
    if (cursor) params.set('after', cursor)

    const res = await fetch(`${META_GRAPH_BASE}/${formId}/leads?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errText = await res.text()
      if (res.status === 401) throw new Error('Meta token inválido o expirado (401). Regenerar META_SYSTEM_USER_TOKEN.')
      if (res.status === 403) throw new Error('Sin permiso leads_retrieval en Meta (403). Verificar permisos del System User.')
      throw new Error(`Meta Graph API error ${res.status}: ${errText}`)
    }

    const body = (await res.json()) as MetaLeadsResponse
    if (Array.isArray(body.data)) leads.push(...body.data)

    cursor = body.data?.length ? body.paging?.cursors?.after : undefined
  } while (cursor)

  return leads
}
