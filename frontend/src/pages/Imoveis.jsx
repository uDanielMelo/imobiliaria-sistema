import { useState, useEffect } from 'react'
import { Building2, Plus, Search, MapPin, Home, DollarSign, X, Check } from 'lucide-react'
import api from '../services/api'

const STATUS_COLORS = {
  disponivel: 'bg-emerald-100 text-emerald-700',
  alugado: 'bg-blue-100 text-blue-700',
  em_manutencao: 'bg-amber-100 text-amber-700',
  inativo: 'bg-slate-100 text-slate-500',
}

const STATUS_LABELS = {
  disponivel: 'Disponível',
  alugado: 'Alugado',
  em_manutencao: 'Em Manutenção',
  inativo: 'Inativo',
}

const TIPO_LABELS = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  comercial: 'Comercial',
  terreno: 'Terreno',
  outro: 'Outro',
}

const FORM_INICIAL = {
  endereco: '', numero: '', complemento: '', bairro: '',
  cidade: '', estado: '', cep: '', tipo: 'apartamento',
  descricao: '', area_m2: '', valor_aluguel: '', status: 'disponivel',
}

export default function Imoveis() {
  const [imoveis, setImoveis] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const fetchImoveis = async () => {
    try {
      const { data } = await api.get('/imoveis/')
      setImoveis(Array.isArray(data) ? data : data.results ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImoveis() }, [])

  const imoveisFiltrados = imoveis.filter(i =>
    i.endereco?.toLowerCase().includes(busca.toLowerCase()) ||
    i.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
    i.bairro?.toLowerCase().includes(busca.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      await api.post('/imoveis/', form)
      setShowModal(false)
      setForm(FORM_INICIAL)
      fetchImoveis()
    } catch (e) {
      setErro('Erro ao cadastrar imóvel. Verifique os campos.')
    } finally {
      setSalvando(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Imóveis</h1>
          <p className="text-slate-500 text-sm mt-1">{imoveis.length} imóvel(is) cadastrado(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Novo Imóvel
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por endereço, bairro ou cidade..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando...</div>
      ) : imoveisFiltrados.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400">Nenhum imóvel encontrado.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-primary-600 text-sm hover:underline">
            Cadastrar primeiro imóvel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imoveisFiltrados.map((imovel) => (
            <div key={imovel.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Building2 size={20} className="text-slate-600" />
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[imovel.status]}`}>
                  {STATUS_LABELS[imovel.status]}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">
                {imovel.endereco}, {imovel.numero}
                {imovel.complemento && ` - ${imovel.complemento}`}
              </h3>
              <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
                <MapPin size={13} />
                <span>{imovel.bairro} · {imovel.cidade}/{imovel.estado}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-50">
                <span className="text-slate-500 flex items-center gap-1">
                  <Home size={13} /> {TIPO_LABELS[imovel.tipo]}
                  {imovel.area_m2 && ` · ${imovel.area_m2}m²`}
                </span>
                {imovel.valor_aluguel && (
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <DollarSign size={13} />
                    {Number(imovel.valor_aluguel).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                )}
              </div>
              {imovel.total_contratos > 0 && (
                <div className="mt-2 text-xs text-slate-400">{imovel.total_contratos} contrato(s) no histórico</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Novo Imóvel</h2>
              <button onClick={() => { setShowModal(false); setErro('') }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Endereço */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Endereço *</label>
                  <input name="endereco" required value={form.endereco} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Rua, Avenida..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Número *</label>
                  <input name="numero" required value={form.numero} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="123" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Complemento</label>
                  <input name="complemento" value={form.complemento} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Apto, Bloco..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Bairro *</label>
                  <input name="bairro" required value={form.bairro} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Bairro" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cidade *</label>
                  <input name="cidade" required value={form.cidade} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Cidade" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Estado *</label>
                  <input name="estado" required value={form.estado} onChange={handleChange} maxLength={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="SP" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CEP *</label>
                  <input name="cep" required value={form.cep} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="00000-000" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Área (m²)</label>
                  <input name="area_m2" type="number" value={form.area_m2} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Valor Aluguel (R$)</label>
                  <input name="valor_aluguel" type="number" value={form.valor_aluguel} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Descrição</label>
                <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Descreva o imóvel..." />
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
                  {salvando ? 'Salvando...' : 'Cadastrar Imóvel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}