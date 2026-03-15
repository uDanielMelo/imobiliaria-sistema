import { useEffect, useState } from 'react'
import { Building2, Users, FileText, CreditCard, AlertCircle } from 'lucide-react'
import api from '../services/api'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    imoveis: 0, inquilinos: 0, contratos: 0, pagamentos_atrasados: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [imoveis, inquilinos, contratos, pagamentos] = await Promise.all([
          api.get('/imoveis/'),
          api.get('/inquilinos/'),
          api.get('/contratos/'),
          api.get('/pagamentos/?status=atrasado'),
        ])
        setStats({
          imoveis: imoveis.data.count ?? imoveis.data.length,
          inquilinos: inquilinos.data.count ?? inquilinos.data.length,
          contratos: contratos.data.count ?? contratos.data.length,
          pagamentos_atrasados: pagamentos.data.count ?? pagamentos.data.length,
        })
      } catch (e) {
        console.error(e)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">Visão geral do seu portfólio</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Building2} label="Imóveis" value={stats.imoveis} color="bg-blue-500" />
        <StatCard icon={Users} label="Inquilinos" value={stats.inquilinos} color="bg-emerald-500" />
        <StatCard icon={FileText} label="Contratos" value={stats.contratos} color="bg-violet-500" />
        <StatCard icon={AlertCircle} label="Pagamentos atrasados" value={stats.pagamentos_atrasados} color="bg-red-500" />
      </div>
    </div>
  )
}