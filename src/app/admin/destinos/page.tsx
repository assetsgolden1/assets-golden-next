import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { MapPin } from 'lucide-react'

interface Destination {
  slug: string
  country_name: string
  card_image_url: string | null
  hero_image_url: string | null
  active: boolean
}

export default async function DestinosAdminPage() {
  await requireAdmin()

  const { data } = await supabaseAdmin
    .from('country_destinations')
    .select('slug,country_name,card_image_url,hero_image_url,active')
    .order('country_name', { ascending: true })

  const destinations = (data as Destination[]) ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Destinos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Editá la descripción e imágenes de cada destino. No se pueden crear ni eliminar destinos desde aquí.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {destinations.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <MapPin size={32} className="mx-auto mb-2 opacity-40" />
            <p>No hay destinos en la base de datos</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium w-16">Imagen</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Destino</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Slug</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Estado</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((dest, idx) => (
                <tr
                  key={dest.slug}
                  className={`border-t border-gray-50 hover:bg-gray-50 ${!dest.active ? 'opacity-50' : ''} ${idx === 0 ? 'border-t-0' : ''}`}
                >
                  <td className="px-4 py-3">
                    {dest.card_image_url ? (
                      <img
                        src={dest.card_image_url}
                        alt={dest.country_name}
                        className="w-12 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <MapPin size={14} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{dest.country_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{dest.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${dest.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {dest.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={`/admin/destinos/${dest.slug}/edit`}
                      style={{
                        fontSize: 12,
                        color: '#131D2E',
                        textDecoration: 'none',
                        padding: '3px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        backgroundColor: '#f9fafb',
                      }}
                    >
                      ✏️ Editar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
