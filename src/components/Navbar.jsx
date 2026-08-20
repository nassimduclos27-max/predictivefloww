import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/machines', label: 'Machines' },
    { to: '/alertes', label: 'Alertes' },
    { to: '/projets', label: 'Projets' },
    { to: '/messagerie', label: 'Messagerie' },
    ...(isAdmin ? [
      { to: '/devis', label: 'Devis' },
      { to: '/factures', label: 'Factures' },
      { to: '/admin', label: 'Admin' },
    ] : []),
  ]

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="font-bold text-white text-lg">⚡ PredictiveFlow</span>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs text-slate-400">{user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary text-sm py-1">Déconnexion</button>
        </div>

        {/* Mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-300 text-2xl">☰</button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === l.to ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              {l.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="btn-danger text-sm mt-2">Déconnexion</button>
        </div>
      )}
    </nav>
  )
}
