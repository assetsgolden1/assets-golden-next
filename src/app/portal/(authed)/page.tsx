import { PortalPropertiesGrid } from '@/components/portal/PortalPropertiesGrid'
import { ExpertosGestionCard } from '@/components/portal/ExpertosGestionCard'

export default function PortalHome() {
  return (
    <div>
      <ExpertosGestionCard />

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
