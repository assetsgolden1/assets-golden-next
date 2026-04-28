import { PortalPropertiesGrid } from '@/components/portal/PortalPropertiesGrid'

export default function PortalHome() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-primary mb-1">
          Catálogo de propiedades
        </h1>
        <p className="text-sm text-muted-foreground">
          Busca, filtra y descarga fichas de todas las propiedades disponibles
        </p>
      </div>
      <PortalPropertiesGrid />
    </div>
  )
}
