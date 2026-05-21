'use client'

import { useEffect, useRef } from 'react'
import { fbqTrack, sendServerEvent } from '@/lib/meta/track'

interface Props {
  propertyId: string
  propertyTitle: string
  price?: number | null
  currency?: string | null
  refCode?: string | null
}

// Dispara ViewContent al visitar una página de propiedad individual
export default function ViewContentTracker({
  propertyId,
  propertyTitle,
  price,
  currency,
  refCode,
}: Props) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    const eventId = crypto.randomUUID()
    const contentId = refCode ?? propertyId

    fbqTrack(
      'ViewContent',
      {
        content_ids: [contentId],
        content_name: propertyTitle,
        content_type: 'product',
        ...(price != null && { value: price, currency: currency ?? 'EUR' }),
      },
      eventId
    )

    sendServerEvent({
      eventName: 'ViewContent',
      eventId,
      customData: {
        contentIds: [contentId],
        contentName: propertyTitle,
        ...(price != null && { value: price, currency: currency ?? 'EUR' }),
      },
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
