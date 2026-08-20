import React, { useState, useEffect } from 'react'
import { machinesAPI, weibullAPI } from '../api/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

function RiskBadge({ level }) {
  const map = { ok: 'badge-success', warning: 'badge-warning', critical: 'badge-danger' }
  const label = { ok: 'Faible', warning: 'Modéré', critical: 'Critique' }
  return <span className={map[level] || 'badge-info'}>{label[level] || level}</span>
}

function ReliabilityChart({ beta, eta }) {
  const points = Array.from({ length: 50 }, (_, i) => {
    const t = (i + 1) * (eta * 2) / 50
    const r = Math.exp(-Math.pow(t / eta, beta)) * 100
    return { t: Math.round(t), r: Math.round(r * 10) / 10 }
  })
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Courbe de fiabilité R(t)</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="t" stroke="#94a3b8" tick={{ fontSize: 10 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v) => [`${v}%`, 'Fiabilité']} labelFormatter={(l) => `t = ${l}h`} />
          <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="r" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500 mt-1">La courbe montre la probabilité que le composant fonctionne encore après t heures. En dessous de 50% le remplacement est recommandé.</p>
    </div>
  )
}

function WeibullCard({ result }) {
  const [showChart, setShowChart] = useState(false)
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
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-400">Fiabilité actuelle</p>
          <p className={`text-2xl font-bold ${result.reliability < 50 ? 'text-red-400' : result.reliability < 80 ? 'text-yellow-400' : 'text-green-400'}`}>{result.reliability}%</p>
          <div className="w-full bg-slate-600 rounded-full h-1.5 mt-1">
            <div className={`h-1.5 rounded-full ${result.reliability < 50 ? 'bg-red-500' : result.reliability < 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${result.reliability}%`}} />
          </div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-400">Vie restante estimée</p>
          <p className="text-2xl font-bold text-blue-400">{result.remainingLife}h</p>
          <p className="text-xs text-slate-500 mt-1">{Math.round(result.remainingLife / 24)} jours</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-400">MTTF</p>
          <p className="text-xl font-bold text-white">{result.mttf}h</p>
          <p className="text-xs text-slate-500">Durée de vie moyenne</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-400">Risque panne 30j</p>
          <p className={`text-xl font-bold ${result.failureProb30 > 70 ? 'text-red-400' : result.failureProb30 > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{result.failureProb30}%</p>
        </div>
      </div>
      <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">Paramètres Weibull</span>
          <span className="text-xs text-blue-400">{result.diagnosis}</span>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-slate-400">β (beta)</p>
            <p className="text-lg font-bold text-white">{result.beta}</p>
            <p className="text-xs text-slate-500">{result.beta < 1 ? 'Rodage' : result.beta < 1.5 ? 'Aléatoire' : 'Usure'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">η (eta)</p>
            <p className="text-lg font-bold text-white">{result.eta}h</p>
            <p className="text-xs text-slate-500">Durée caractéristique</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Mesures</p>
            <p className="text-lg font-bold text-white">{result.data_points}</p>
            <p className="text-xs text-slate-500">Points analysés</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {result.beta < 1 ? '⚠️ β < 1 : défauts précoces, les pannes diminuent avec le temps.' :
           result.beta < 1.5 ? '🔵 β ≈ 1 : pannes aléatoires, taux constant.' :
           '🔴 β > 1 : usure progressive, remplacement préventif recommandé.'}
        </p>
      </div>
      <button onClick={() => setShowChart(!showChart)} className="btn-secondary text-xs w-full">
        {showChart ? 'Masquer le graphique' : '📈 Voir la courbe de fiabilité'}
      </button>
      {showChart && <ReliabilityChart beta={result.beta} eta={result.eta} />}
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
      setResults({ error: "Erreur lors de l'analyse" })
    } finally { setLoading(false) }
  }

  if (loadingMachines) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-white">Analyse Weibull</h1>
        <p className="text-sm text-slate-400 mt-1">Prédiction de durée de vie et fiabilité des composants</p>
      </div>
      <div className="card bg-slate-700/30">
        <p className="text-xs font-semibold text-blue-400 uppercase mb-2">Comment ça marche ?</p>
        <p className="text-xs text-slate-300">L'analyse Weibull utilise l'historique des mesures capteur pour modéliser la dégradation. Elle calcule <span className="text-white font-medium">β (forme)</span> qui indique le type d'usure, et <span className="text-white font-medium">η (échelle)</span> qui représente la durée de vie caractéristique. On prédit ensuite la fiabilité actuelle et la durée de vie restante.</p>
      </div>
      <div>
        <label className="label">Sélectionner une machine</label>
        <select className="input max-w-sm" value={selected || ''} onChange={e => analyze(Number(e.target.value))}>
          <option value="">Choisir une machine...</option>
          {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      {loading && <div className="flex items-center gap-3 text-slate-400"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500" /><span>Analyse en cours...</span></div>}
      {results && !results.error && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Résultats — {machines.find(m => m.id === selected)?.name}</h2>
          {results.components?.length === 0 ? (
            <div className="card text-center text-slate-400 py-10">Aucun composant trouvé</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.components?.map(r => <WeibullCard key={r.component_id} result={r} />)}
            </div>
          )}
        </div>
      )}
      {results?.error && <div className="card text-red-400 text-center py-6">{results.error}</div>}
      {!selected && !loading && (
        <div className="card text-center text-slate-400 py-10">
          <p className="text-3xl mb-3">📊</p>
          <p className="font-medium">Sélectionne une machine pour lancer l'analyse</p>
          <p className="text-xs mt-2">Minimum 3 mesures capteur par composant requis</p>
        </div>
      )}
    </div>
  )
}
