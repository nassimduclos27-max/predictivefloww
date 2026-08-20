import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectsAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ProjetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStep, setNewStep] = useState('')
  const [newIntervention, setNewIntervention] = useState({ date: '', description: '', technician: '' })

  const load = async () => {
    try {
      const res = await projectsAPI.get(id)
      setProject(res.data?.project)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleAddStep = async (e) => {
    e.preventDefault()
    try { await projectsAPI.addStep(id, { title: newStep }); setNewStep(''); load() } catch {}
  }

  const handleStepStatus = async (stepId, status) => {
    try { await projectsAPI.updateStep(id, stepId, { status }); load() } catch {}
  }

  const handleAddIntervention = async (e) => {
    e.preventDefault()
    try { await projectsAPI.addIntervention(id, newIntervention); setNewIntervention({ date: '', description: '', technician: '' }); load() } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>
  if (!project) return <div className="card text-slate-400 text-center py-10">Projet introuvable</div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/projets')} className="btn-secondary text-sm">← Retour</button>
        <h1 className="text-xl font-bold text-white">{project.name}</h1>
      </div>

      <div className="card">
        <p className="text-slate-400 text-sm">{project.description}</p>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{width: `${project.progress || 0}%`}} />
        </div>
        <p className="text-xs text-slate-500 mt-1">{project.progress || 0}% complété</p>
      </div>

      <div className="card flex flex-col gap-3">
        <h2 className="font-semibold text-white">Étapes</h2>
        {(project.steps || []).map(step => (
          <div key={step.id} className="flex items-center gap-3">
            <input type="checkbox" checked={step.status === 'done'} onChange={() => handleStepStatus(step.id, step.status === 'done' ? 'todo' : 'done')} className="w-4 h-4" />
            <span className={step.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}>{step.title}</span>
          </div>
        ))}
        {isAdmin && (
          <form onSubmit={handleAddStep} className="flex gap-2 mt-2">
            <input className="input" placeholder="Nouvelle étape" value={newStep} onChange={e => setNewStep(e.target.value)} required />
            <button type="submit" className="btn-primary">Ajouter</button>
          </form>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <h2 className="font-semibold text-white">Interventions terrain</h2>
        {(project.interventions || []).map(int => (
          <div key={int.id} className="border border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium text-sm">{int.technician}</span>
              <span className="text-xs text-slate-400">{new Date(int.date).toLocaleDateString()}</span>
            </div>
            <p className="text-slate-300 text-sm">{int.description}</p>
          </div>
        ))}
        {isAdmin && (
          <form onSubmit={handleAddIntervention} className="flex flex-col gap-2 mt-2">
            <input className="input" type="date" value={newIntervention.date} onChange={e => setNewIntervention({...newIntervention, date: e.target.value})} required />
            <input className="input" placeholder="Technicien" value={newIntervention.technician} onChange={e => setNewIntervention({...newIntervention, technician: e.target.value})} />
            <textarea className="input" placeholder="Description de l'intervention" rows={2} value={newIntervention.description} onChange={e => setNewIntervention({...newIntervention, description: e.target.value})} required />
            <button type="submit" className="btn-primary">Ajouter l'intervention</button>
          </form>
        )}
      </div>
    </div>
  )
}
