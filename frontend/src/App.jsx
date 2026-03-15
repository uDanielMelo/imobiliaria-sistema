import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Imoveis from './pages/Imoveis'
import Inquilinos from './pages/Inquilinos'
import Contratos from './pages/Contratos'
import Pagamentos from './pages/Pagamentos'
import Sidebar from './components/Sidebar'

function PrivateLayout({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" />
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
        <Route path="/imoveis" element={<PrivateLayout><Imoveis /></PrivateLayout>} />
        <Route path="/inquilinos" element={<PrivateLayout><Inquilinos /></PrivateLayout>} />
        <Route path="/contratos" element={<PrivateLayout><Contratos /></PrivateLayout>} />
        <Route path="/pagamentos" element={<PrivateLayout><Pagamentos /></PrivateLayout>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}