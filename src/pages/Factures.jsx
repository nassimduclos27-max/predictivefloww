import React, { useState, useEffect } from 'react'
import { invoicesAPI, adminAPI } from '../api/client'
import { exportFactures } from '../utils/exportExcel'

export default function Factures() {
  const [invoices, setInvoices] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_id: '', items: [{ description: '', quantity: 1, unit_price: 0 }], notes: '' })

  const load = async () => {
    try {
      const [invRes, usersRes] = await Promise.allSettled([invoicesAPI.list({}), adminAPI.listUsers()])
      if (invRes.status === 'fulfilled') setInvoices(invRes.value.data?.invoices || [])
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data?.users || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await invoicesAPI.create(form)
      setForm({ client_id: '', items: [{ description: '', quantity: 1, unit_price: 0 }], notes: '' })
      setShowForm(false)
      load()
    } catch {}
  }

  const handleMarkPaid = async (id) => {
    try { await invoicesAPI.markPaid(id); load() } catch {}
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette facture ?')) return
    try { await invoicesAPI.delete(id); load() } catch {}
  }

  const addItem = () => setForm({...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0 }]})
  const updateItem = (i, field, val) => {
    const items = [...form.items]
    items[i] = {...items[i], [field]: val}
    setForm({...form, items})
  }
  const removeItem = (i) => setForm({...form, items: form.items.filter((_, idx) => idx !== i)})
  const total = form.items.reduce((s, it) => s + (it.quantity * it.unit_price), 0)

  const statusColor = (s) => ({ pending: 'badge-warning', paid: 'badge-success', overdue: 'badge-danger' }[s] || 'badge-info')

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-white">Factures</h1>
        <div className="flex gap-2">
          <button onClick={() => exportFactures(invoices)} className="btn-secondary text-sm">📥 Export Excel</button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Nouvelle facture</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card flex flex-col gap-4">
          <h2 className="font-semibold text-white">Nouvelle facture</h2>
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
                {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="btn-danger px-2">✕</button>}
              </div>
            ))}
            <button type="button" onClick={addItem} className="btn-secondary text-sm">+ Ajouter une ligne</button>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white font-bold">Total : {total.toFixed(2)} €</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
              <button type="submit" className="btn-primary">Créer</button>
            </div>
          </div>
        </form>
      )}

      {invoices.length === 0 ? (
        <div className="card text-center text-slate-400 py-10">Aucune facture</div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr>
              <th>N°</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="font-medium">#{inv.id}</td>
                  <td>{inv.client_name}</td>
                  <td className="font-semibold text-white">{inv.total?.toFixed(2)} €</td>
                  <td><span className={statusColor(inv.status)}>{inv.status}</span></td>
                  <td className="text-slate-400 text-xs">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="flex gap-1">
                    {inv.status !== 'paid' && (
                      <button onClick={() => handleMarkPaid(inv.id)} className="btn-primary text-xs py-1 px-2">✓ Payée</button>
                    )}
                    <button onClick={() => handleDelete(inv.id)} className="btn-danger text-xs py-1 px-2">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
