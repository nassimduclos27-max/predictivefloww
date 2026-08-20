import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projectsAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Projets() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { isAdmin } = useAuth()
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' })

  const load = async () => {
    try {
      const res = await projectsAPI.list({})
      setProjects(res.data?.projects || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await projectsAPI.create(form)
      setForm({ name: '', description: '', start_date: '', end_date: '' })
      setShowForm(false)
      load()
    } catch {}
  }

  const statusColor = (s) => ({
    planned: 'badge-info', in_progress: 'badge-warning', completed: 'badge-success'
  }[s] || 'badge-info')

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Projets</h1>
        {isAdmin && <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Nouveau projet</button>}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card flex flex-col gap-3">
          <h2 className="font-semibold text-white">Nouveau projet</h2>
          <input className="input" placeholder="Nom du projet" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <textarea className="input" placeholder="Description" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label">Date début</label>
              <input className="input" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="label">Date fin prévue</label>
              <input className="input" type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="card text-center text-slate-400 py-10">Aucun projet</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map(p => (
            <Link key={p.id} to={`/projets/${p.id}`} className="card hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <span className={statusColor(p.status)}>{p.status}</span>
              </div>
              {p.description && <p className="text-sm text-slate-400 mb-2">{p.description}</p>}
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${p.progress || 0}%`}} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{p.progress || 0}% complété</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
