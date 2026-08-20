import React, { useState, useEffect } from 'react'
import { machinesAPI } from '../api/client'
import { exportMachines } from '../utils/exportExcel'

function ComponentForm({ machineId, component, onDone, onCancel }) {
  const [form, setForm] = useState(component || { name: '', type: '', threshold_min: 0, threshold_max: 100, unit: '' })
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (component) await machinesAPI.updateComponent(machineId, component.id, form)
      else await machinesAPI.createComponent(machineId, form)
      onDone()
    } catch {}
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-3 border-t border-slate-700 pt-3">
      <p className="text-xs font-semibold text-slate-400 uppercase">{component ? 'Modifier composant' : 'Nouveau composant'}</p>
      <input className="input text-sm" placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      <input className="input text-sm" placeholder="Type (temperature, vibration...)" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
      <div className="flex gap-2">
        <input className="input text-sm" type="number" placeholder="Seuil min" value={form.threshold_min} onChange={e => setForm({...form, threshold_min: Number(e.target.value)})} />
        <input className="input text-sm" type="number" placeholder="Seuil max" value={form.threshold_max} onChange={e => setForm({...form, threshold_max: Number(e.target.value)})} />
        <input className="input text-sm" placeholder="Unité" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary text-sm">{component ? 'Modifier' : 'Ajouter'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">Annuler</button>
      </div>
    </form>
  )
}

function MachineCard({ machine, onRefresh }) {
  const [components, setComponents] = useState([])
  const [showComponents, setShowComponents] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editComponent, setEditComponent] = useState(null)
  const [editMachine, setEditMachine] = useState(false)
  const [form, setForm] = useState({ name: machine.name, type: machine.type, location: machine.location, description: machine.description })

  const loadComponents = async () => {
    try {
      const res = await machinesAPI.listComponents(machine.id)
      setComponents(res.data?.components || [])
    } catch {}
  }

  const handleToggle = async () => {
    if (!showComponents) await loadComponents()
    setShowComponents(!showComponents)
  }

  const handleDeleteMachine = async () => {
    if (!confirm('Supprimer cette machine ?')) return
    try { await machinesAPI.delete(machine.id); onRefresh() } catch {}
  }

  const handleDeleteComponent = async (componentId) => {
    if (!confirm('Supprimer ce composant ?')) return
    try { await machinesAPI.deleteComponent(machine.id, componentId); loadComponents() } catch {}
  }

  const handleUpdateMachine = async (e) => {
    e.preventDefault()
    try { await machinesAPI.update(machine.id, form); setEditMachine(false); onRefresh() } catch {}
  }

  return (
    <div className="card">
      {editMachine ? (
        <form onSubmit={handleUpdateMachine} className="flex flex-col gap-2">
          <input className="input text-sm" placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input className="input text-sm" placeholder="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
          <input className="input text-sm" placeholder="Localisation" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <input className="input text-sm" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Enregistrer</button>
            <button type="button" onClick={() => setEditMachine(false)} className="btn-secondary text-sm">Annuler</button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{machine.name}</h3>
            <span className={`badge-${machine.status === 'ok' ? 'success' : machine.status === 'warning' ? 'warning' : 'danger'}`}>{machine.status}</span>
          </div>
          <p className="text-sm text-slate-400">{machine.type} • {machine.location}</p>
          {machine.description && <p className="text-xs text-slate-500 mt-1">{machine.description}</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={handleToggle} className="btn-secondary text-xs flex-1">
              {showComponents ? 'Masquer' : 'Composants'}
            </button>
            <button onClick={() => setEditMachine(true)} className="btn-secondary text-xs px-2">✏️</button>
            <button onClick={handleDeleteMachine} className="btn-danger text-xs px-2">🗑️</button>
          </div>
        </>
      )}

      {showComponents && (
        <div className="mt-3">
          {components.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun composant</p>
          ) : (
            <div className="flex flex-col gap-2">
              {components.map(c => (
                <div key={c.id} className="bg-slate-700/50 rounded-lg px-3 py-2">
                  {editComponent?.id === c.id ? (
                    <ComponentForm machineId={machine.id} component={c} onDone={() => { setEditComponent(null); loadComponents() }} onCancel={() => setEditComponent(null)} />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{c.name}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setEditComponent(c)} className="text-xs text-blue-400 hover:text-blue-300">✏️</button>
                          <button onClick={() => handleDeleteComponent(c.id)} className="text-xs text-red-400 hover:text-red-300">🗑️</button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">{c.type} • {c.threshold_min}–{c.threshold_max} {c.unit}</p>
                      <p className="text-xs text-slate-500">ID : {c.id}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {!editComponent && (
            <>
              <button onClick={() => setShowForm(!showForm)} className="btn-secondary text-xs mt-2 w-full">
                {showForm ? 'Annuler' : '+ Ajouter un composant'}
              </button>
              {showForm && <ComponentForm machineId={machine.id} onDone={() => { setShowForm(false); loadComponents() }} onCancel={() => setShowForm(false)} />}
            </>
          )}
        </div>
      )}
    </div>
  )
}

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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-white">Parc machines</h1>
        <div className="flex gap-2">
          <button onClick={() => exportMachines(machines)} className="btn-secondary text-sm">📥 Export Excel</button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Ajouter</button>
        </div>
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
          {machines.map(m => <MachineCard key={m.id} machine={m} onRefresh={load} />)}
        </div>
      )}
    </div>
  )
}
