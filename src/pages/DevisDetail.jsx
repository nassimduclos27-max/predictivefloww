import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quotesAPI, adminAPI } from '../api/client'

export default function DevisDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [quote, setQuote] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [form, setForm] = useState({ client_id: '', items: [{ description: '', quantity: 1, unit_price: 0 }], discount: 0, notes: '' })

  useEffect(() => {
    adminAPI.listUsers().then(r => setUsers(r.data?.users || [])).catch(() => {})
    if (!isNew) {
      quotesAPI.get(id).then(r => setQuote(r.data?.quote)).catch(() => {}).finally(() => setLoading(false))
    }
  }, [id])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await quotesAPI.create(form)
      navigate('/devis')
    } catch {}
  }

  const updateStatus = async (status) => {
    try { await quotesAPI.updateStatus(id, status); navigate('/devis') } catch {}
  }

  const addItem = () => setForm({...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0 }]})
  const updateItem = (i, field, val) => {
    const items = [...form.items]
    items[i] = {...items[i], [field]: val}
    setForm({...form, items})
  }
  const total = form.items.reduce((s, it) => s + (it.quantity * it.unit_price), 0) * (1 - form.discount / 100)

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  if (isNew) return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl">
      <h1 className="text-xl font-bold text-white">Nouveau devis</h1>
      <form onSubmit={handleCreate} className="card flex flex-col gap-4">
        <div>
          <label className="label">Client</label>
          <select className="input" value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} required>
            <option value="">Sélectionner un client</option>
            {users.filter(u => u.role === 'client').map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Prestations</label>
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input className="input" placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
              <input className="input w-20" type="number" placeholder="Qté" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
              <input className="input w-28" type="number" placeholder="Prix HT" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', Number(e.target.value))} />
            </div>
          ))}
          <button type="button" onClick={addItem} className="btn-secondary text-sm">+ Ajouter une ligne</button>
        </div>
        <div>
          <label className="label">Remise (%)</label>
          <input className="input w-32" type="number" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-lg">Total HT : {total.toFixed(2)} €</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate('/devis')} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">Créer</button>
          </div>
        </div>
      </form>
    </div>
  )

  if (!quote) return <div className="card text-slate-400 text-center py-10">Devis introuvable</div>

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Devis #{quote.id}</h1>
        <span className="badge-info">{quote.status}</span>
      </div>
      <div className="card">
        <p className="text-slate-300">Client : <span className="text-white font-medium">{quote.client_name}</span></p>
        <p className="text-slate-300 mt-1">Total : <span className="text-white font-bold">{quote.total?.toFixed(2)} €</span></p>
        {quote.notes && <p className="text-slate-400 text-sm mt-2">{quote.notes}</p>}
      </div>
      <div className="flex gap-2 flex-wrap">
        {quote.status === 'draft' && <button onClick={() => updateStatus('sent')} className="btn-primary">Envoyer</button>}
        {quote.status === 'sent' && <>
          <button onClick={() => updateStatus('accepted')} className="btn-primary">Accepter</button>
          <button onClick={() => updateStatus('refused')} className="btn-danger">Refuser</button>
        </>}
        <button onClick={() => navigate('/devis')} className="btn-secondary">Retour</button>
      </div>
    </div>
  )
}
