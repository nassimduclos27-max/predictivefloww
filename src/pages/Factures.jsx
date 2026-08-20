import React, { useState, useEffect } from 'react'
import { invoicesAPI } from '../api/client'

export default function Factures() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await invoicesAPI.list({})
      setInvoices(res.data?.invoices || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleMarkPaid = async (id) => {
    try { await invoicesAPI.markPaid(id); load() } catch {}
  }

  const statusColor = (s) => ({
    pending: 'badge-warning', paid: 'badge-success', overdue: 'badge-danger'
  }[s] || 'badge-info')

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="text-xl font-bold text-white">Factures</h1>
      {invoices.length === 0 ? (
        <div className="card text-center text-slate-400 py-10">Aucune facture</div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr>
              <th>N°</th><th>Client</th><th>Montant</th><th>Statut</th><th>Date</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="font-medium">#{inv.id}</td>
                  <td>{inv.client_name}</td>
                  <td className="font-semibold text-white">{inv.total?.toFixed(2)} €</td>
                  <td><span className={statusColor(inv.status)}>{inv.status}</span></td>
                  <td className="text-slate-400 text-xs">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td>
                    {inv.status !== 'paid' && (
                      <button onClick={() => handleMarkPaid(inv.id)} className="btn-primary text-xs py-1 px-2">Marquer payée</button>
                    )}
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
