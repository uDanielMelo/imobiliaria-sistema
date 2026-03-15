import { useState, useEffect } from 'react'
import { CreditCard, Search, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import api from '../services/api'

const STATUS_COLORS = {
  pago: 'bg-emerald-100 text-emerald-700',
  pendente: 'bg-amber-100 text-amber-700',
  atrasado: 'bg-red-100 text-red-600',
  cancelado: 'bg-slate-100 text-slate-500',
}

const STATUS_ICONS = {
  pago: CheckCircle,
  pendente: Clock,
  atrasado: AlertCircle,
  cancelado: XCircle,
}

const STATUS_LABELS = {
  pago: 'Pago',
  pendente: 'Pendente',
  atrasado: 'Atrasado',
  cancelado: 'Cancelado',
}

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [atualizando, setAtualizando] = useState(null)

  const fetchPagamentos = async () => {
    try {
      const { data } = await api.get('/pagamentos/')
      setPagamentos(Array.isArray(data) ? data : data.results ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPagamentos() }, [])

  const marcarComoPago = async (id) => {
    setAtualizando(id)
    try {
      await api.patch(`/pagamentos/${id}/`, {
        status: 'pago',
        payment_date: new Date().toISOString().split('T')[0]
      })
      fetchPagamentos()
    } catch (e) {
      console.error(e)
    } finally {
      setAtualizando(null)
    }
  }

  const filtrados = pagamentos.filter(p => {
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus
    const matchBusca = busca === '' ||
      p.due_date?.includes(busca) ||
      String(p.value)?.includes(busca)
    return matchStatus && matchBusca
  })

  const totais = {
    pago: pagamentos.filter(p => p.status === 'pago').length,
    pendente: pagamentos.filter(p => p.status === 'pendente').length,
    atrasado: pagamentos.filter(p => p.status === 'atrasado').length,
  }

  const formatData = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'
  const formatValor = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pagamentos</h1>
        <p className="text-slate-500 text-sm mt-1">{pagamentos.length} pagamento(s) no total</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
          <div className="bg-emerald-100 p-2.5 rounded-lg">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Pagos</p>
            <p className="text-2xl font-bold text-slate-800">{totais.pago}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
          <div className="bg-amber-100 p-2.5 rounded-lg">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Pendentes</p>
            <p className="text-2xl font-bold text-slate-800">{totais.pendente}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
          <div className="bg-red-100 p-2.5 rounded-lg">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Atrasados</p>
            <p className="text-2xl font-bold text-red-500">{totais.atrasado}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar por valor ou data..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['todos', 'pendente', 'atrasado', 'pago'].map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroStatus === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {s === 'todos' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20">
          <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400">Nenhum pagamento encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Vencimento</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Valor</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Pago em</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p, i) => {
                const Icon = STATUS_ICONS[p.status]
                return (
                  <tr key={p.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{formatData(p.due_date)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{formatValor(p.value)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>
                        <Icon size={11} />
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatData(p.payment_date)}</td>
                    <td className="px-6 py-4">
                      {p.status !== 'pago' && p.status !== 'cancelado' && (
                        <button
                          onClick={() => marcarComoPago(p.id)}
                          disabled={atualizando === p.id}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                          {atualizando === p.id ? 'Salvando...' : 'Marcar como pago'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}