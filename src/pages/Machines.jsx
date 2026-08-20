import React, { useState, useEffect } from 'react'
import { machinesAPI } from '../api/client'

export default function Machines() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', location: '', type: '' })

  const load = async () => {
    try {
      const res = await machinesAPI.list()
      setMachines(res.data?.machines || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await machinesAPI.create(form)
      setForm({ name: '', description: '', location: '', type: '' })
      setShowForm(false)
      load()
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Parc machines</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Ajouter</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card flex flex-col gap-3">
          <h2 className="font-semibold text-white">Nouvelle machine</h2>
          <input className="input" placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input className="input" placeholder="Type (pompe, moteur...)" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
          <input className="input" placeholder="Localisation" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <input className="input" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {machines.length === 0 ? (
        <div className="card text-center text-slate-400 py-10">Aucune machine enregistrée</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {machines.map(m => (
            <div key={m.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{m.name}</h3>
                <span className={`badge-${m.status === 'ok' ? 'success' : m.status === 'warning' ? 'warning' : 'danger'}`}>{m.status}</span>
              </div>
              <p className="text-sm text-slate-400">{m.type} • {m.location}</p>
              {m.description && <p className="text-xs text-slate-500 mt-1">{m.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
