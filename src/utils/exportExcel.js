import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const exportToExcel = (data, sheetName, fileName) => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${fileName}.xlsx`)
}

export const exportMachines = (machines) => {
  const data = machines.map(m => ({
    'ID': m.id,
    'Nom': m.name,
    'Type': m.type,
    'Localisation': m.location,
    'Statut': m.status,
    'Description': m.description,
    'Date création': new Date(m.created_at).toLocaleDateString()
  }))
  exportToExcel(data, 'Machines', 'machines_export')
}

export const exportAlertes = (alerts) => {
  const data = alerts.map(a => ({
    'ID': a.id,
    'Sévérité': a.severity,
    'Machine': a.machine_name,
    'Composant': a.component_name,
    'Valeur': a.value,
    'Unité': a.unit,
    'Seuil min': a.threshold_min,
    'Seuil max': a.threshold_max,
    'Résolu': a.resolved_at ? 'Oui' : 'Non',
    'Date': new Date(a.created_at).toLocaleDateString()
  }))
  exportToExcel(data, 'Alertes', 'alertes_export')
}

export const exportDevis = (quotes) => {
  const data = quotes.map(q => ({
    'ID': q.id,
    'Client': q.client_name,
    'Total HT (€)': q.total?.toFixed(2),
    'Remise (%)': q.discount,
    'Statut': q.status,
    'Notes': q.notes,
    'Date': new Date(q.created_at).toLocaleDateString()
  }))
  exportToExcel(data, 'Devis', 'devis_export')
}

export const exportFactures = (invoices) => {
  const data = invoices.map(inv => ({
    'ID': inv.id,
    'Client': inv.client_name,
    'Total (€)': inv.total?.toFixed(2),
    'Statut': inv.status,
    'Notes': inv.notes,
    'Date': new Date(inv.created_at).toLocaleDateString()
  }))
  exportToExcel(data, 'Factures', 'factures_export')
}

export const exportProjets = (projects) => {
  const data = projects.map(p => ({
    'ID': p.id,
    'Nom': p.name,
    'Description': p.description,
    'Statut': p.status,
    'Progression (%)': p.progress,
    'Date début': p.start_date,
    'Date fin': p.end_date,
    'Date création': new Date(p.created_at).toLocaleDateString()
  }))
  exportToExcel(data, 'Projets', 'projets_export')
}
