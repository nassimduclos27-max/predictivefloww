import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Machines from './pages/Machines'
import Alertes from './pages/Alertes'
import Admin from './pages/Admin'
import Devis from './pages/Devis'
import DevisDetail from './pages/DevisDetail'
import Factures from './pages/Factures'
import Projets from './pages/Projets'
import ProjetDetail from './pages/ProjetDetail'
import Messagerie from './pages/Messagerie'
import Weibull from './pages/Weibull'

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Loader />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <Loader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/machines" element={<PrivateRoute><AppLayout><Machines /></AppLayout></PrivateRoute>} />
      <Route path="/alertes" element={<PrivateRoute><AppLayout><Alertes /></AppLayout></PrivateRoute>} />
      <Route path="/weibull" element={<PrivateRoute><AppLayout><Weibull /></AppLayout></PrivateRoute>} />
      <Route path="/messagerie" element={<PrivateRoute><AppLayout><Messagerie /></AppLayout></PrivateRoute>} />
      <Route path="/projets" element={<PrivateRoute><AppLayout><Projets /></AppLayout></PrivateRoute>} />
      <Route path="/projets/:id" element={<PrivateRoute><AppLayout><ProjetDetail /></AppLayout></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AppLayout><Admin /></AppLayout></AdminRoute>} />
      <Route path="/devis" element={<AdminRoute><AppLayout><Devis /></AppLayout></AdminRoute>} />
      <Route path="/devis/:id" element={<AdminRoute><AppLayout><DevisDetail /></AppLayout></AdminRoute>} />
      <Route path="/factures" element={<AdminRoute><AppLayout><Factures /></AppLayout></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
