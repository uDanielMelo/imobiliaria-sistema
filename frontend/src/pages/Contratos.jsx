import { useState, useEffect } from 'react'
import { FileText, Plus, Search, X, Check, Calendar, DollarSign } from 'lucide-react'
import api from '../services/api'

const STATUS_COLORS = {
  ativo: 'bg-emerald-100 text-emerald-700',
  pendente: 'bg-amber-100 text-amber-700',
  encerrado: 'bg-slate-100 text-slate-500',
  cancelado: 'bg-red-100 text-red-600',
}

const STATUS_LABELS = {
  ativo: 'Ativo',
  pendente: 'Pendente',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
}

const FORM_INICIAL = {
  imovel: '', inquilino: '', start_date: '',
  end_date: '', value: '', due_day: '10',
  status: 'ativo', observacoes: '',
}

export default function Contratos() {
  const [contratos, setContratos] = useState([])
  const [imoveis, setImoveis] = useState([])
  const [inquilinos, setInquilinos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const fetchTudo = async () => {
    try {
      const [c, i, inq] = await Promise.all([
        api.get('/contratos/'),
        api.get('/imoveis/'),
        api.get('/inquilinos/'),
      ])
      setContratos(Array.isArray(c.data) ? c.data : c.data.results ?? [])
      setImoveis(Array.isArray(i.data) ? i.data : i.data.results ?? [])
      setInquilinos(Array.isArray(inq.data) ? inq.data : inq.data.results ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTudo() }, [])

  const filtrados = contratos.filter(c =>
    c.imovel_detalhes?.endereco?.toLowerCase().includes(busca.toLowerCase()) ||
    c.inquilino_detalhes?.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      await api.post('/contratos/', form)
      setShowModal(false)
      setForm(FORM_INICIAL)
      fetchTudo()
    } catch (e) {
      const msg = e.response?.data
      setErro(typeof msg === 'object' ? JSON.stringify(msg) : 'Erro ao cadastrar contrato.')
    } finally {
      setSalvando(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const formatData = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'
  const formatValor = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contratos</h1>
          <p className="text-slate-500 text-sm mt-1">{contratos.length} contrato(s) cadastrado(s)</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Novo Contrato
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Buscar por imóvel ou inquilino..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400">Nenhum contrato encontrado.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-primary-600 text-sm hover:underline">
            Cadastrar primeiro contrato
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {c.imovel_detalhes?.endereco}, {c.imovel_detalhes?.numero}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Inquilino: <span className="font-medium text-slate-700">{c.inquilino_detalhes?.nome}</span>
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status]}`}>
                  {STATUS_LABELS[c.status]}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{formatData(c.start_date)} → {formatData(c.end_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <DollarSign size={14} className="text-slate-400" />
                  <span>{formatValor(c.value)}/mês · dia {c.due_day}</span>
                </div>
                <div className="text-sm text-slate-500 text-right">
                  {c.total_pagamentos} parcela(s)
                  {c.pagamentos_atrasados > 0 && (
                    <span className="ml-2 text-red-500 font-medium">{c.pagamentos_atrasados} atrasada(s)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Novo Contrato</h2>
                <p className="text-xs text-slate-400 mt-0.5">Os pagamentos mensais serão gerados automaticamente</p>
              </div>
              <button onClick={() => { setShowModal(false); setErro('') }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Imóvel *</label>
                <select name="imovel" required value={form.imovel} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Selecione o imóvel</option>
                  {imoveis.filter(i => i.status === 'disponivel').map(i => (
                    <option key={i.id} value={i.id}>
                      {i.endereco}, {i.numero} — {i.cidade}/{i.estado}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Inquilino *</label>
                <select name="inquilino" required value={form.inquilino} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Selecione o inquilino</option>
                  {inquilinos.map(i => (
                    <option key={i.id} value={i.id}>{i.nome} — CPF: {i.cpf}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Início *</label>
                  <input name="start_date" type="date" required value={form.start_date} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fim *</label>
                  <input name="end_date" type="date" required value={form.end_date} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Valor mensal (R$) *</label>
                  <input name="value" type="number" required value={form.value} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dia do vencimento *</label>
                  <input name="due_day" type="number" min="1" max="31" required value={form.due_day} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="ativo">Ativo</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Observações do contrato..." />
              </div>
              {erro && <p className="text-red-500 text-sm">{erro}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setErro('') }}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  <Check size={16} />
                  {salvando ? 'Salvando...' : 'Criar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}