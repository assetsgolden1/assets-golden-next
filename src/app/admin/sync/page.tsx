'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface SyncStats {
  total_in_feed: number
  matched_by_external_id: number
  matched_by_fingerprint: number
  inserted_new: number
  conflicts: number
  errors: number
  deleted_count: number
  updated_count: number
}

interface SyncResult {
  success: boolean
  dryRun: boolean
  stats?: SyncStats
  logId?: string
  error?: string
  deletedCount?: number
  totalInScope?: number
}

interface ConflictDetail {
  externalId: string
  title: string
  location: string
  candidates: number
}

interface InsertedSample {
  externalId: string
  title: string
}

interface DeletedSample {
  id: string
  ref_code: string | null
  location: string
  title: string
}

interface SyncLog {
  id: string
  started_at: string
  finished_at: string | null
  feed_source: string
  total_in_feed: number
  matched_by_external_id: number
  matched_by_fingerprint: number
  inserted_new: number
  conflicts: number
  errors: number
  deleted_count: number
  updated_count: number
  dry_run: boolean
  details: {
    conflict_details?: ConflictDetail[]
    inserted_sample?: InsertedSample[]
    deleted_sample?: DeletedSample[]
  } | null
}

export default function SyncPage() {
  const [running, setRunning] = useState(false)
  const [lastResult, setLastResult] = useState<SyncResult | null>(null)
  const [lastDryRun, setLastDryRun] = useState<SyncResult | null>(null)
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [hasDryRun, setHasDryRun] = useState(false)

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sync-logs')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs ?? [])
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => { loadLogs() }, [loadLogs])

  async function runSync(dryRun: boolean) {
    setRunning(true)
    setLastResult(null)
    try {
      const res = await fetch(`/api/admin/sync-habihub?dry=${dryRun}`, { method: 'POST' })
      const data: SyncResult = await res.json()
      setLastResult(data)
      if (dryRun) {
        setHasDryRun(true)
        if (data.success) setLastDryRun(data)
      }
      await loadLogs()
    } catch (err) {
      setLastResult({
        success: false,
        dryRun,
        error: err instanceof Error ? err.message : 'Error desconocido',
      })
    } finally {
      setRunning(false)
    }
  }

  function handleRealSync() {
    if (!lastDryRun) {
      alert('Primero ejecutá un dry-run en esta sesión.')
      return
    }

    const matchedById = lastDryRun.stats?.matched_by_external_id ?? 0
    const matchedByFp = lastDryRun.stats?.matched_by_fingerprint ?? 0
    const insertedNew = lastDryRun.stats?.inserted_new ?? 0
    const conflicts = lastDryRun.stats?.conflicts ?? 0
    const hiddenCount = lastDryRun.deletedCount ?? lastDryRun.stats?.deleted_count ?? 0
    const updates = matchedById + matchedByFp

    const message =
      `🔴 SYNC REAL — confirmar acción\n\n` +
      `Según el último dry-run:\n` +
      `  • ${updates} propiedades se ACTUALIZARÁN\n` +
      `  • ${insertedNew} propiedades nuevas se AGREGARÁN\n` +
      `  • ${hiddenCount} propiedades se OCULTARÁN (hidden_by_sync=true, reversible)\n` +
      `  • ${conflicts} con huella ambigua (se insertó la del feed, los viejos quedan OCULTOS)\n\n` +
      `Backup en properties_backup_20260429 (1.757 filas).\n\n` +
      `¿Continuar?`

    if (!confirm(message)) return
    runSync(false)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function formatDuration(start: string, end: string | null) {
    if (!end) return '—'
    const ms = new Date(end).getTime() - new Date(start).getTime()
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sincronización HabiHub</h1>
        <p className="text-gray-500 text-sm mt-1">
          Importa y actualiza propiedades desde los feeds XML de HabiHub (Costa Blanca/Cálida + Costa del Sol).
        </p>
      </div>

      {/* Feeds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Feeds configurados</h2>
        <div className="space-y-2">
          {['Costa Blanca / Costa Cálida', 'Costa del Sol'].map((name) => (
            <div key={name} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <span>{name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Origen: medianewbuild.com / HabiHub agent 9e04488b</p>
      </div>

      {/* Botones de acción */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Ejecutar sincronización</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => runSync(true)}
            disabled={running}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={running ? 'animate-spin' : ''} />
            Simular (dry run)
          </button>

          <button
            onClick={handleRealSync}
            disabled={running || !hasDryRun}
            title={!hasDryRun ? 'Ejecuta primero un dry run para ver el impacto' : undefined}
            className="flex items-center gap-2 bg-[#c9a96e] hover:bg-[#b8945a] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={running ? 'animate-spin' : ''} />
            Sincronizar de verdad
          </button>
        </div>

        {!hasDryRun && (
          <p className="text-xs text-amber-600 flex items-center gap-1.5">
            <AlertTriangle size={13} />
            Ejecuta primero un dry run para ver el impacto antes de sincronizar.
          </p>
        )}

        {running && (
          <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            Descargando y procesando feeds XML... puede tardar hasta 60 segundos.
          </p>
        )}

        {/* Resultado última ejecución */}
        {lastResult && !running && (
          <div className={`mt-4 rounded-lg p-4 ${lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              {lastResult.success
                ? <CheckCircle size={16} className="text-green-600" />
                : <XCircle size={16} className="text-red-600" />}
              <span className={`font-medium text-sm ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {lastResult.success
                  ? lastResult.dryRun ? 'Simulación completada' : 'Sincronización completada'
                  : 'Error en la sincronización'}
              </span>
              {lastResult.dryRun && (
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  DRY RUN — no se escribió nada
                </span>
              )}
            </div>

            {lastResult.stats && (
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                {[
                  { label: 'En feed', value: lastResult.stats.total_in_feed, color: 'text-gray-700' },
                  { label: 'Match ID', value: lastResult.stats.matched_by_external_id, color: 'text-blue-700' },
                  { label: 'Match huella', value: lastResult.stats.matched_by_fingerprint, color: 'text-purple-700' },
                  { label: 'Nuevas', value: lastResult.stats.inserted_new, color: 'text-green-700' },
                  { label: 'Conflictos', value: lastResult.stats.conflicts, color: 'text-orange-600' },
                  {
                    label: 'Ocultadas',
                    value: lastResult.deletedCount ?? lastResult.stats.deleted_count ?? 0,
                    color: (lastResult.deletedCount ?? lastResult.stats.deleted_count ?? 0) > 0
                      ? 'text-amber-600 font-bold'
                      : 'text-gray-400',
                  },
                  { label: 'Errores', value: lastResult.stats.errors, color: 'text-red-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center bg-white rounded-lg p-2 shadow-sm">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            Historial (últimas 20 ejecuciones)
          </h2>
          <button onClick={loadLogs} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <RefreshCw size={12} />
            Actualizar
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Sin ejecuciones previas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left py-2 pr-3">Fecha</th>
                  <th className="text-center px-2">Tipo</th>
                  <th className="text-right px-2">Feed</th>
                  <th className="text-right px-2">Match ID</th>
                  <th className="text-right px-2">Huella</th>
                  <th className="text-right px-2">Nuevas</th>
                  <th className="text-right px-2">Conflictos</th>
                  <th className="text-right px-2">Ocultadas</th>
                  <th className="text-right px-2">Errores</th>
                  <th className="text-right pl-2">Duración</th>
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <>
                    <tr
                      key={log.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <td className="py-2.5 pr-3 text-gray-600 whitespace-nowrap">{formatDate(log.started_at)}</td>
                      <td className="text-center px-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${log.dry_run ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                          {log.dry_run ? 'DRY' : 'REAL'}
                        </span>
                      </td>
                      <td className="text-right px-2 text-gray-600">{log.total_in_feed}</td>
                      <td className="text-right px-2 text-blue-600">{log.matched_by_external_id}</td>
                      <td className="text-right px-2 text-purple-600">{log.matched_by_fingerprint}</td>
                      <td className="text-right px-2 text-green-600">{log.inserted_new}</td>
                      <td className="text-right px-2 text-orange-500">{log.conflicts}</td>
                      <td className={`text-right px-2 ${(log.deleted_count ?? 0) > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                        {log.deleted_count ?? 0}
                      </td>
                      <td className="text-right px-2 text-red-500">{log.errors}</td>
                      <td className="text-right pl-2 text-gray-400 text-xs">{formatDuration(log.started_at, log.finished_at)}</td>
                      <td className="pl-2 text-gray-400">
                        {expandedLog === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>

                    {expandedLog === log.id && log.details && (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={11} className="pb-4 pt-1">
                          <div className="bg-gray-50 rounded-lg p-4 ml-4 space-y-4">
                            {log.details.conflict_details && log.details.conflict_details.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-orange-600 mb-2">
                                  Conflictos ({log.details.conflict_details.length} — no se modificaron)
                                </p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {log.details.conflict_details.map((c) => (
                                    <div key={c.externalId} className="text-xs text-gray-600 flex items-center gap-2">
                                      <span className="text-orange-400">●</span>
                                      <span className="font-mono text-gray-400">{c.externalId}</span>
                                      <span>{c.title}</span>
                                      <span className="text-gray-400">({c.candidates} candidatos en {c.location})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {log.details.inserted_sample && log.details.inserted_sample.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-green-600 mb-2">
                                  Nuevas insertadas — muestra ({log.details.inserted_sample.length})
                                </p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {log.details.inserted_sample.map((p) => (
                                    <div key={p.externalId} className="text-xs text-gray-600 flex items-center gap-2">
                                      <span className="text-green-400">●</span>
                                      <span className="font-mono text-gray-400">{p.externalId}</span>
                                      <span>{p.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {log.details.deleted_sample && log.details.deleted_sample.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-600 mb-2">
                                  Ocultadas — muestra ({log.details.deleted_sample.length})
                                </p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {log.details.deleted_sample.map((p) => (
                                    <div key={p.id} className="text-xs text-gray-600 flex items-center gap-2">
                                      <span className="text-red-400">●</span>
                                      <span className="font-mono text-gray-400">{p.ref_code ?? p.id.slice(0, 8)}</span>
                                      <span className="text-gray-400">{p.location}</span>
                                      <span>{p.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(!log.details.conflict_details?.length
                              && !log.details.inserted_sample?.length
                              && !log.details.deleted_sample?.length) && (
                              <p className="text-xs text-gray-400">Sin detalles adicionales</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
