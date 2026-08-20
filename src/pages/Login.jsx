import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-700/30 border border-blue-600/50 rounded-2xl p-4 mb-4">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-white">PredictiveFlow</h1>
          <p className="text-sm text-slate-400 mt-1">Maintenance prédictive industrielle</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Connexion</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@flowpack.fr" required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" className="input" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            {error && (
              <div className="bg-red-600/10 border border-red-600/30 rounded-lg px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || !email || !password}
              className="btn-primary w-full mt-2">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
        <div className="mt-4 text-center text-xs text-slate-500">
          Admin : admin@flowpack.fr / admin123
        </div>
      </div>
    </div>
  )
}
