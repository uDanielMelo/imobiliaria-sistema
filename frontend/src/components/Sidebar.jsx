import { NavLink, useNavigate } from 'react-router-dom'
import { Building2, Home, FileText, CreditCard, Users, LogOut } from 'lucide-react'
import useAuthStore from '../store/authStore'

const links = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/imoveis', icon: Building2, label: 'Imóveis' },
  { to: '/inquilinos', icon: Users, label: 'Inquilinos' },
  { to: '/contratos', icon: FileText, label: 'Contratos' },
  { to: '/pagamentos', icon: CreditCard, label: 'Pagamentos' },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Building2 className="text-white" size={20} />
          </div>
          <span className="text-white font-bold text-lg">ImobSystem</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700 hover:text-white w-full transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}