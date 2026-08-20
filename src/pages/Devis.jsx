import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { quotesAPI } from '../api/client'

export default function Devis() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await quotesAPI.list({})
      setQuotes(res.data?.quotes || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const statusColor = (s) => ({
    draft: 'badge-info', sent: 'badge-warning',
    accepted: 'badge-success', refused: 'badge-danger', expired: 'badge-danger'
  }[s] || 'badge-info')

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Devis</h1>
        <Link to="/devis/new" className="btn-primary">+ Nouveau devis</Link>
      </div>
      {quotes.length === 0 ? (
        <div className="card text-center text-slate-400 py-10">Aucun devis créé</div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr>
              <th>N°</th><th>Client</th><th>Montant</th><th>Statut</th><th>Date</th><th></th>
            </tr></thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td className="font-medium">#{q.id}</td>
                  <td>{q.client_name}</td>
                  <td className="font-semibold text-white">{q.total?.toFixed(2)} €</td>
                  <td><span className={statusColor(q.status)}>{q.status}</span></td>
                  <td className="text-slate-400 text-xs">{new Date(q.created_at).toLocaleDateString()}</td>
                  <td><Link to={`/devis/${q.id}`} className="btn-secondary text-xs py-1 px-2">Voir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
