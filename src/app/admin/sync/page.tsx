'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

interface SyncResult {
  success: boolean
  results?: {
    inserted: number
    updated: number
    errors: number
    total: number
  }
  error?: string
}

interface SyncHistoryItem {
  date: string
  result: SyncResult
}

const FEEDS = [
  'feed_blanca_calida.xml',
  'feed_sol.xml',
]

const HISTORY_KEY = 'admin_sync_history'

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [lastResult, setLastResult] = useState<SyncResult | null>(null)
  const [history, setHistory] = useState<SyncHistoryItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) setHistory(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  function saveToHistory(result: SyncResult) {
    const newItem: SyncHistoryItem = { date: new Date().toISOString(), result }
    const updated = [newItem, ...history].slice(0, 5)
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  async function handleSync() {
    setSyncing(true)
    setLastResult(null)
    try {
      const res = await fetch('/api/admin/sync-habihub', { method: 'POST' })
      const data: SyncResult = await res.json()
      setLastResult(data)
      saveToHistory(data)
    } catch (err) {
      const errResult: SyncResult = {
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      }
      setLastResult(errResult)
      saveToHistory(errResult)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sincronización HabiHub</h1>
        <p className="text-gray-500 text-sm mt-1">Importa y actualiza propiedades desde los feeds XML de HabiHub</p>
      </div>

      {/* Feeds configurados */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3">Feeds configurados</h2>
        <ul className="space-y-2">
          {FEEDS.map((feed) => (
            <li key={feed} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <code className="bg-gray-50 px-2 py-0.5 rounded text-xs">{feed}</code>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-3">
          Origen: medianewbuild.com / HabiHub agent 9e04488b
        </p>
      </div>

      {/* Botón sincronizar */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-3 bg-[#0a1628] text-white px-6 py-3 rounded-lg hover:bg-[#1a2638] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando...' : 'Sincronizar HabiHub'}
        </button>

        {syncing && (
          <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            Descargando y procesando feeds XML...
          </p>
        )}

        {lastResult && !syncing && (
          <div className={`mt-4 rounded-lg p-4 ${lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {lastResult.success ? (
                <CheckCircle size={18} className="text-green-600" />
              ) : (
                <XCircle size={18} className="text-red-600" />
              )}
              <span className={`font-medium ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {lastResult.success ? 'Sincronización completada' : 'Error en la sincronización'}
              </span>
            </div>
            {lastResult.results && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {[
                  { label: 'Total', value: lastResult.results.total, color: 'text-gray-700' },
                  { label: 'Nuevas', value: lastResult.results.inserted, color: 'text-green-700' },
                  { label: 'Actualizadas', value: lastResult.results.updated, color: 'text-blue-700' },
                  { label: 'Errores', value: lastResult.results.errors, color: 'text-red-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            )}
            {lastResult.error && (
              <p className="text-sm text-red-700 mt-2">{lastResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Historial */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            Últimas sincronizaciones
          </h2>
          <ul className="space-y-2">
            {history.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                {item.result.success ? (
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle size={14} className="text-red-500 flex-shrink-0" />
                )}
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {new Date(item.date).toLocaleString('es-ES')}
                </span>
                {item.result.results && (
                  <span className="text-gray-600">
                    +{item.result.results.inserted} nuevas, ~{item.result.results.updated} actualizadas
                    {item.result.results.errors > 0 && (
                      <span className="text-red-500"> ({item.result.results.errors} errores)</span>
                    )}
                  </span>
                )}
                {item.result.error && (
                  <span className="text-red-500 truncate">{item.result.error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
