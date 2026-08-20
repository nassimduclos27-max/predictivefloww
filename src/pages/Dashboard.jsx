import React, { useState, useEffect, useCallback } from 'react'
import { machinesAPI, alertsAPI, sensorsAPI } from '../api/client'

function KpiCard({ label, value, unit, color = 'text-blue-400', sub }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <div className="flex items-end gap-1">
        <span className="stat-value" style={{color: color.replace('text-','')}}>{value ?? '–'}</span>
        {unit && <span className="text-xs text-slate-400 mb-0.5">{unit}</span>}
      </div>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const [machines, setMachines] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const loadData = useCallback(async () => {
    try {
      const [mRes, aRes] = await Promise.allSettled([
        machinesAPI.list(),
        alertsAPI.list({ resolved: false, limit: 5 }),
      ])
      if (mRes.status === 'fulfilled') setMachines(mRes.value.data?.machines || [])
      if (aRes.status === 'fulfilled') setAlerts(aRes.value.data?.alerts || [])
      setLastUpdate(new Date())
    } catch {}
  }, [])

  useEffect(() => {
    setLoading(true)
    loadData().finally(() => setLoading(false))
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  const machinesOk = machines.filter(m => m.status === 'ok').length
  const machinesAlert = machines.filter(m => ['warning','critical'].includes(m.status)).length
  const machinesTotal = machines.length
  const availability = machinesTotal > 0 ? ((machinesOk / machinesTotal) * 100).toFixed(1) : '–'

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Tableau de bord</h1>
          <p className="text-sm text-slate-400">Maintenance prédictive en temps réel</p>
        </div>
        <span className="text-xs text-slate-500">Mise à jour : {lastUpdate.toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Machines totales" value={machinesTotal} color="#38bdf8" />
        <KpiCard label="Machines OK" value={machinesOk} color="#4ade80" />
        <KpiCard label="En alerte" value={machinesAlert} color={machinesAlert > 0 ? "#ef4444" : "#94a3b8"} />
        <KpiCard label="Disponibilité" value={availability} unit="%" color="#4ade80" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="MTTF" value="–" unit="h" color="#38bdf8" sub="Durée avant 1ère panne" />
        <KpiCard label="MTBF" value="–" unit="h" color="#7dd3fc" sub="Entre deux pannes" />
        <KpiCard label="MTTR" value="–" unit="h" color="#fb923c" sub="Durée de réparation" />
        <KpiCard label="Taux de panne" value="–" unit="/h" color="#ef4444" sub="Pannes par heure" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Alertes récentes</h2>
        {alerts.length === 0 ? (
          <div className="card text-center text-slate-400 py-6">✅ Aucune alerte active</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="table-container">
              <table>
                <thead><tr>
                  <th>Sévérité</th><th>Machine</th><th>Composant</th><th>Valeur</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr key={alert.id}>
                      <td><span className={alert.severity === 'critical' ? 'badge-danger' : 'badge-warning'}>{alert.severity}</span></td>
                      <td className="font-medium">{alert.machine_name}</td>
                      <td className="text-slate-400">{alert.component_name}</td>
                      <td className="text-red-400 font-semibold">{alert.value} {alert.unit}</td>
                      <td className="text-slate-400 text-xs">{new Date(alert.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
