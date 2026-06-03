'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function SortableImage({
  url,
  index,
  onRemove,
  onMakeMain,
}: {
  url: string
  index: number
  onRemove: () => void
  onMakeMain: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={{ ...style, position: 'relative' }}>
      <img
        src={url}
        alt={`Imagen ${index + 1}`}
        style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 6, cursor: 'grab' }}
        onError={(e) => { e.currentTarget.src = '/placeholder-property.svg' }}
        {...attributes}
        {...listeners}
      />
      {index === 0 && (
        <span style={{
          position: 'absolute', top: 4, left: 4,
          backgroundColor: '#D4AF37', color: '#131D2E',
          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          pointerEvents: 'none',
        }}>
          Principal
        </span>
      )}
      {index !== 0 && (
        <button
          type="button"
          onClick={onMakeMain}
          style={{
            position: 'absolute', bottom: 4, left: 4,
            backgroundColor: '#D4AF37', color: '#131D2E',
            border: 'none', borderRadius: 4, fontSize: 10, fontWeight: 700,
            padding: '2px 5px', cursor: 'pointer',
          }}
        >
          ★ Hacer principal
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        style={{
          position: 'absolute', top: 4, right: 4,
          backgroundColor: '#dc2626', color: 'white',
          border: 'none', borderRadius: '50%',
          width: 20, height: 20, fontSize: 14,
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: 0, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
