import React, { useState, useEffect } from 'react'
import { machinesAPI, weibullAPI } from '../api/client'

function RiskBadge({ level }) {
  const map = { ok: 'badge-success', warning: 'badge-warning', critical: 'badge-danger' }
  const label = { ok: 'Faible', warning: 'Modéré', critical: 'Critique' }
  return <span className={map[level] || 'badge-info'}>{label[level] || level}</span>
}

function WeibullCard({ result }) {
  if (result.error) return (
    <div className="card border-l-4 border-slate-600">
      <p className="font-medium text-white">{result.component_name}</p>
      <p className="text-xs text-slate-400 mt-1">{result.error}</p>
    </div>
  )
  return (
    <div className={`card border-l-4 ${result.riskLevel === 'critical' ? 'border-red-500' : result.riskLevel === 'warning' ? 'border-yellow-500' : 'border-green-500'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{result.component_name}</h3>
        <RiskBadge level={result.riskLevel} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-400">Fiabilité</p>
          <p className={`text-xl font-bold ${result.reliability < 50 ? 'text-red-400' : result.reliability < 80 ? 'text-yellow-400' : 'text-green-400'}`}>{result.reliability}%</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-400">Vie restante</p>
          <p className="text-xl font-bold text-blue-400">{result.remainingLife}h</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-400">MTTF</p>
          <p className="text-xl font-bold text-white">{result.mttf}h</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-400">Risque 30j</p>
          <p className={`text-xl font-bold ${result.failureProb30 > 70 ? 'text-red-400' : result.failureProb30 > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{result.failureProb30}%</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>β = {result.beta} • η = {result.eta}</span>
        <span className="text-slate-300">{result.diagnosis}</span>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Fiabilité</span>
          <span>{result.reliability}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${result.reliability < 50 ? 'bg-red-500' : result.reliability < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{width: `${result.reliability}%`}} />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">{result.data_points} mesures analysées</p>
    </div>
  )
}

export default function Weibull() {
  const [machines, setMachines] = useState([])
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMachines, setLoadingMachines] = useState(true)

  useEffect(() => {
    machinesAPI.list().then(r => setMachines(r.data?.machines || [])).finally(() => setLoadingMachines(false))
  }, [])

  const analyze = async (machineId) => {
    setSelected(machineId)
    setLoading(true)
    setResults(null)
    try {
      const res = await weibullAPI.stats(machineId)
      setResults(res.data)
    } catch {
      setResults({ error: 'Erreur lors de l\'analyse' })
    } finally { setLoading(false) }
  }

  if (loadingMachines) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-white">Analyse Weibull</h1>
        <p className="text-sm text-slate-400 mt-1">Prédiction de durée de vie et fiabilité des composants</p>
      </div>

      <div>
        <label className="label">Sélectionner une machine</label>
        <select className="input max-w-sm" value={selected || ''} onChange={e => analyze(Number(e.target.value))}>
          <option value="">Choisir une machine...</option>
          {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-400">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500" />
          <span>Analyse en cours...</span>
        </div>
      )}

      {results && !results.error && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Résultats pour {machines.find(m => m.id === selected)?.name}
          </h2>
          {results.components?.length === 0 ? (
            <div className="card text-center text-slate-400 py-10">Aucun composant trouvé</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.components?.map(r => <WeibullCard key={r.component_id} result={r} />)}
            </div>
          )}
        </div>
      )}

      {results?.error && (
        <div className="card text-red-400 text-center py-6">{results.error}</div>
      )}

      {!selected && !loading && (
        <div className="card text-center text-slate-400 py-10">
          <p className="text-2xl mb-2">📊</p>
          <p>Sélectionne une machine pour analyser la fiabilité de ses composants</p>
          <p className="text-xs mt-2">Minimum 3 mesures capteur par composant</p>
        </div>
      )}
    </div>
  )
}
