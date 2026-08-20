import React, { useState, useEffect } from 'react'
import { alertsAPI } from '../api/client'
import { exportAlertes } from '../utils/exportExcel'

export default function Alertes() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await alertsAPI.list({})
      setAlerts(res.data?.alerts || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleResolve = async (id) => {
    try { await alertsAPI.resolve(id); load() } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-white">Alertes</h1>
        <button onClick={() => exportAlertes(alerts)} className="btn-secondary text-sm">📥 Export Excel</button>
      </div>
      {alerts.length === 0 ? (
        <div className="card text-center text-slate-400 py-10">✅ Aucune alerte active</div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map(a => (
            <div key={a.id} className={`card border-l-4 ${a.severity === 'critical' ? 'border-red-500' : 'border-yellow-500'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={a.severity === 'critical' ? 'badge-danger' : 'badge-warning'}>{a.severity}</span>
                    <span className="font-medium text-white">{a.machine_name}</span>
                    <span className="text-slate-400 text-sm">• {a.component_name}</span>
                  </div>
                  <p className="text-sm text-slate-300">Valeur : <span className="text-red-400 font-semibold">{a.value} {a.unit}</span> (seuil : {a.threshold_min}–{a.threshold_max})</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                {!a.resolved_at && (
                  <button onClick={() => handleResolve(a.id)} className="btn-secondary text-sm">Résoudre</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
