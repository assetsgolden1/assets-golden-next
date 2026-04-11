'use client'
import { useState } from 'react'

interface Props {
  description: string
}

export default function PropertyDescriptionExpand({ description }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isLong = description.length > 300

  return (
    <div>
      <p
        className={`text-muted-foreground leading-relaxed whitespace-pre-line ${
          !expanded && isLong ? 'line-clamp-4' : ''
        }`}
      >
        {description}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm text-gold hover:underline"
        >
          {expanded ? 'Ver menos' : 'Leer más'}
        </button>
      )}
    </div>
  )
}
