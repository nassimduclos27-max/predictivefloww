import React, { useState, useEffect } from 'react'
import { adminAPI } from '../api/client'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', role: 'client', full_name: '' })

  const load = async () => {
    try {
      const res = await adminAPI.listUsers()
      setUsers(res.data?.users || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createUser(form)
      setForm({ email: '', password: '', role: 'client', full_name: '' })
      setShowForm(false)
      load()
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await adminAPI.deleteUser(id)
      load()
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Administration</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Créer un compte</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card flex flex-col gap-3">
          <h2 className="font-semibold text-white">Nouveau compte</h2>
          <input className="input" placeholder="Nom complet" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input className="input" placeholder="Mot de passe" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead><tr>
            <th>Nom</th><th>Email</th><th>Rôle</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="font-medium">{u.full_name || '–'}</td>
                <td>{u.email}</td>
                <td><span className={u.role === 'admin' ? 'badge-info' : 'badge-success'}>{u.role}</span></td>
                <td>
                  <button onClick={() => handleDelete(u.id)} className="btn-danger text-xs py-1 px-2">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
