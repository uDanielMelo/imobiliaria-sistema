import { useState, useEffect } from 'react'
import { Building2, Plus, Search, MapPin, X, Check, Camera, Bed, Bath, Car } from 'lucide-react'
import api from '../services/api'

const STATUS_COLORS = {
  disponivel: 'bg-emerald-100 text-emerald-700',
  alugado: 'bg-blue-100 text-blue-700',
  vendido: 'bg-purple-100 text-purple-700',
  em_manutencao: 'bg-amber-100 text-amber-700',
  inativo: 'bg-slate-100 text-slate-500',
}

const STATUS_LABELS = {
  disponivel: 'Disponível', alugado: 'Alugado', vendido: 'Vendido',
  em_manutencao: 'Em Manutenção', inativo: 'Inativo',
}

const TIPO_LABELS = {
  apartamento: 'Apartamento', casa: 'Casa', comercial: 'Comercial',
  terreno: 'Terreno', outro: 'Outro',
}

const COMODO_LABELS = {
  sala: 'Sala', cozinha: 'Cozinha', quarto: 'Quarto', suite: 'Suíte',
  banheiro: 'Banheiro', area_servico: 'Área de Serviço', varanda: 'Varanda',
  garagem: 'Garagem', fachada: 'Fachada', area_comum: 'Área Comum', outro: 'Outro',
}

const FORM_INICIAL = {
  endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
  tipo: 'apartamento', finalidade: 'aluguel', status: 'disponivel', descricao: '',
  area_m2: '', quartos: '0', suites: '0', banheiros: '0', vagas: '0', andares: '0',
  valor_aluguel: '', valor_venda: '', valor_condominio: '', valor_iptu: '',
  aceita_pets: false, mobiliado: false, tem_piscina: false,
  tem_academia: false, tem_churrasqueira: false, tem_portaria: false,
}

const formatarParaExibicao = (valor) => {
  if (!valor) return ''
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function CarrosselFotos({ imovelId }) {
  const [fotos, setFotos] = useState([])
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    api.get(`/imoveis/${imovelId}/`).then(({ data }) => {
      setFotos(data.fotos ?? [])
      setAtual(0)
    }).catch(() => {})
  }, [imovelId])

  if (fotos.length === 0) {
    return (
      <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
        <Building2 size={32} className="text-slate-300" />
      </div>
    )
  }

  return (
    <div className="relative mb-2">
      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100">
        <img src={fotos[atual].arquivo} alt={fotos[atual].descricao || ''}
          className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
          <p className="text-white text-xs font-medium">{COMODO_LABELS[fotos[atual].comodo] || fotos[atual].comodo}</p>
          {fotos[atual].descricao && <p className="text-white/80 text-xs">{fotos[atual].descricao}</p>}
        </div>
        {fotos.length > 1 && (
          <>
            <button onClick={() => setAtual(a => (a - 1 + fotos.length) % fotos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
              ‹
            </button>
            <button onClick={() => setAtual(a => (a + 1) % fotos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
              ›
            </button>
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {fotos.map((_, i) => (
            <button key={i} onClick={() => setAtual(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === atual ? 'bg-primary-600' : 'bg-slate-300'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

function Toggle({ label, name, value, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button type="button" onClick={() => onChange(name, !value)}
        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${value ? 'bg-primary-600' : 'bg-slate-200'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
      <span className="text-xs text-slate-600">{label}</span>
    </label>
  )
}

export default function Imoveis() {
  const [imoveis, setImoveis] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [fotos, setFotos] = useState([])
  const [fotoDescricoes, setFotoDescricoes] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [step, setStep] = useState(1)
  const [imovelSelecionado, setImovelSelecionado] = useState(null)
  const [deletando, setDeletando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)

  const fetchImoveis = async () => {
    try {
      const { data } = await api.get('/imoveis/')
      setImoveis(Array.isArray(data) ? data : data.results ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchImoveis() }, [])

  const imoveisFiltrados = imoveis.filter(i =>
    i.endereco?.toLowerCase().includes(busca.toLowerCase()) ||
    i.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
    i.bairro?.toLowerCase().includes(busca.toLowerCase())
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const formatarCEP = (valor) => {
    const nums = valor.replace(/\D/g, '').slice(0, 8)
    return nums.length > 5 ? `${nums.slice(0, 5)}-${nums.slice(5)}` : nums
  }

  const formatarMoeda = (valor) => {
    const nums = valor.replace(/\D/g, '')
    if (!nums) return ''
    const numero = (parseInt(nums) / 100).toFixed(2)
    return numero.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const limparMoeda = (valor) => {
    if (!valor && valor !== 0) return ''
    const str = String(valor)
    if (/^\d+(\.\d+)?$/.test(str)) return str
    return str.replace(/\./g, '').replace(',', '.')
  }

  const handleCEP = async (e) => {
    const cep = formatarCEP(e.target.value)
    setForm(prev => ({ ...prev, cep }))
    const nums = cep.replace(/\D/g, '')
    if (nums.length === 8) {
      try {
        const data = await fetch(`https://viacep.com.br/ws/${nums}/json/`).then(r => r.json())
        if (!data.erro) {
          setForm(prev => ({
            ...prev, cep,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
          }))
        }
      } catch { }
    }
  }

  const handleMoeda = (campo) => (e) => {
    setForm(prev => ({ ...prev, [campo]: formatarMoeda(e.target.value) }))
  }

  const handleFotos = (e) => {
    const files = Array.from(e.target.files)
    setFotos(prev => [...prev, ...files])
    setFotoDescricoes(prev => [...prev, ...files.map(() => ({ comodo: 'outro', descricao: '' }))])
  }

  const removerFoto = (i) => {
    setFotos(prev => prev.filter((_, idx) => idx !== i))
    setFotoDescricoes(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      const payload = {
        ...form,
        valor_aluguel: limparMoeda(form.valor_aluguel),
        valor_venda: limparMoeda(form.valor_venda),
        valor_condominio: limparMoeda(form.valor_condominio),
        valor_iptu: limparMoeda(form.valor_iptu),
      }
      let imovelId = editandoId
      if (editandoId) {
        await api.patch(`/imoveis/${editandoId}/`, payload)
      } else {
        const { data: imovel } = await api.post('/imoveis/', payload)
        imovelId = imovel.id
      }
      for (let i = 0; i < fotos.length; i++) {
        const fd = new FormData()
        fd.append('arquivo', fotos[i])
        fd.append('comodo', fotoDescricoes[i].comodo)
        fd.append('descricao', fotoDescricoes[i].descricao)
        fd.append('capa', i === 0 ? 'true' : 'false')
        fd.append('ordem', i)
        await api.post(`/imoveis/${imovelId}/fotos/`, fd)
      }
      fecharModal()
      fetchImoveis()
    } catch (e) {
      const erros = e.response?.data
      if (erros && typeof erros === 'object') {
        const msgs = Object.entries(erros)
          .map(([campo, msg]) => `${campo}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
          .join('\n')
        setErro(msgs)
      } else {
        setErro('Erro ao salvar imóvel. Verifique os campos.')
      }
    } finally { setSalvando(false) }
  }

  const handleDeletar = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este imóvel?')) return
    setDeletando(true)
    try {
      await api.delete(`/imoveis/${imovelSelecionado.id}/`)
      setImovelSelecionado(null)
      fetchImoveis()
    } catch {
      alert('Erro ao excluir imóvel.')
    } finally { setDeletando(false) }
  }

  const fecharModal = () => {
    setShowModal(false)
    setErro('')
    setStep(1)
    setFotos([])
    setFotoDescricoes([])
    setForm(FORM_INICIAL)
    setEditandoId(null)
    setFotosExistentes([])
  }

 const [fotosExistentes, setFotosExistentes] = useState([])

 const abrirEdicao = async () => {
    setEditandoId(imovelSelecionado.id)
    setForm({
        ...FORM_INICIAL,
        ...imovelSelecionado,
        cep: formatarCEP(imovelSelecionado.cep ?? ''),
        area_m2: imovelSelecionado.area_m2 ?? '',
        andares: imovelSelecionado.andares ?? '0',
        valor_aluguel: formatarParaExibicao(imovelSelecionado.valor_aluguel),
        valor_venda: formatarParaExibicao(imovelSelecionado.valor_venda),
        valor_condominio: formatarParaExibicao(imovelSelecionado.valor_condominio),
        valor_iptu: formatarParaExibicao(imovelSelecionado.valor_iptu),
    })
    try {
        const { data } = await api.get(`/imoveis/${imovelSelecionado.id}/`)
        setFotosExistentes(data.fotos ?? [])
    } catch { setFotosExistentes([]) }
    setImovelSelecionado(null)
    setShowModal(true)
    setStep(1)
 }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Imóveis</h1>
          <p className="text-slate-500 text-sm mt-1">{imoveis.length} imóvel(is) cadastrado(s)</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Novo Imóvel
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Buscar por endereço, bairro ou cidade..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

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
            <div key={imovel.id} onClick={() => setImovelSelecionado(imovel)}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
              {imovel.foto_capa ? (
                <img src={imovel.foto_capa} alt={imovel.endereco} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
                  <Building2 size={32} className="text-slate-300" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {imovel.endereco}, {imovel.numero}
                    {imovel.complemento && ` - ${imovel.complemento}`}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-2 shrink-0 ${STATUS_COLORS[imovel.status]}`}>
                    {STATUS_LABELS[imovel.status]}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                  <MapPin size={11} />
                  <span>{imovel.bairro} · {imovel.cidade}/{imovel.estado}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  {imovel.quartos > 0 && <span className="flex items-center gap-1"><Bed size={12} />{imovel.quartos}</span>}
                  {imovel.banheiros > 0 && <span className="flex items-center gap-1"><Bath size={12} />{imovel.banheiros}</span>}
                  {imovel.vagas > 0 && <span className="flex items-center gap-1"><Car size={12} />{imovel.vagas}</span>}
                  {imovel.area_m2 && <span>{imovel.area_m2}m²</span>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className="text-xs text-slate-500">{TIPO_LABELS[imovel.tipo]}</span>
                  <div className="text-right">
                    {imovel.valor_aluguel && (
                      <div className="text-sm font-semibold text-slate-700">
                        {Number(imovel.valor_aluguel).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
                      </div>
                    )}
                    {imovel.valor_venda && (
                      <div className="text-xs text-slate-500">
                        Venda: {Number(imovel.valor_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editandoId ? 'Editar Imóvel' : 'Novo Imóvel'}
                </h2>
                <div className="flex gap-2 mt-2">
                  {['Endereço', 'Características', 'Fotos'].map((s, i) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${step === i + 1 ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {i + 1}. {s}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={fecharModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Finalidade *</label>
                      <select name="finalidade" value={form.finalidade} onChange={handleChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="aluguel">Aluguel</option>
                        <option value="venda">Venda</option>
                        <option value="ambos">Aluguel e Venda</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
                      <select name="tipo" value={form.tipo} onChange={handleChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
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
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Cidade *</label>
                      <input name="cidade" required value={form.cidade} onChange={handleChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Estado *</label>
                      <input name="estado" required value={form.estado} onChange={handleChange} maxLength={2}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="SP" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">CEP *</label>
                      <input name="cep" required value={form.cep} onChange={handleCEP}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="00000-000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Descrição</label>
                    <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Descreva o imóvel para os interessados..." />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={() => setStep(2)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Próximo →
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {[['quartos', 'Quartos'], ['suites', 'Suítes'], ['banheiros', 'Banheiros'], ['vagas', 'Vagas']].map(([n, l]) => (
                      <div key={n}>
                        <label className="block text-xs font-medium text-slate-600 mb-1">{l}</label>
                        <input name={n} type="number" min="0" value={form[n]} onChange={handleChange}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Área (m²)</label>
                      <input name="area_m2" type="number" value={form.area_m2} onChange={handleChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Andares</label>
                      <input name="andares" type="number" min="0" value={form.andares} onChange={handleChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0 = Térreo" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(form.finalidade === 'aluguel' || form.finalidade === 'ambos') && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Valor Aluguel (R$)</label>
                        <input name="valor_aluguel" value={form.valor_aluguel} onChange={handleMoeda('valor_aluguel')}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    )}
                    {(form.finalidade === 'venda' || form.finalidade === 'ambos') && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Valor Venda (R$)</label>
                        <input name="valor_venda" value={form.valor_venda} onChange={handleMoeda('valor_venda')}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Condomínio (R$)</label>
                      <input name="valor_condominio" value={form.valor_condominio} onChange={handleMoeda('valor_condominio')}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">IPTU (R$/ano)</label>
                      <input name="valor_iptu" value={form.valor_iptu} onChange={handleMoeda('valor_iptu')}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-3">Comodidades</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Toggle label="Aceita pets" name="aceita_pets" value={form.aceita_pets} onChange={handleToggle} />
                      <Toggle label="Mobiliado" name="mobiliado" value={form.mobiliado} onChange={handleToggle} />
                      <Toggle label="Piscina" name="tem_piscina" value={form.tem_piscina} onChange={handleToggle} />
                      <Toggle label="Academia" name="tem_academia" value={form.tem_academia} onChange={handleToggle} />
                      <Toggle label="Churrasqueira" name="tem_churrasqueira" value={form.tem_churrasqueira} onChange={handleToggle} />
                      <Toggle label="Portaria" name="tem_portaria" value={form.tem_portaria} onChange={handleToggle} />
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setStep(1)}
                      className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                      ← Voltar
                    </button>
                    <button type="button" onClick={() => setStep(3)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      Próximo →
                    </button>
                  </div>
                </div>
              )}

                {step === 3 && (
                <div className="space-y-4">
                    <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                        Fotos do imóvel <span className="text-slate-400">(a primeira será a capa)</span>
                    </label>

                    {/* Fotos existentes */}
                    {fotosExistentes.length > 0 && (
                        <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-2">Fotos cadastradas:</p>
                        <div className="space-y-2">
                            {fotosExistentes.map((foto, i) => (
                            <div key={foto.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <img src={foto.arquivo} alt="" className="w-16 h-12 object-cover rounded-lg" />
                                <div className="flex-1">
                                <p className="text-xs font-medium text-slate-700">{COMODO_LABELS[foto.comodo] || foto.comodo}</p>
                                {foto.descricao && <p className="text-xs text-slate-400">{foto.descricao}</p>}
                                {i === 0 && <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">Capa</span>}
                                </div>
                                <button type="button"
                                onClick={async () => {
                                    if (!window.confirm('Excluir esta foto?')) return
                                    try {
                                    await api.delete(`/imoveis/${editandoId}/fotos/${foto.id}/`)
                                    setFotosExistentes(prev => prev.filter(f => f.id !== foto.id))
                                    } catch { alert('Erro ao excluir foto.') }
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={16} />
                                </button>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}

                    {/* Adicionar novas fotos */}
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                        <Camera size={22} className="text-slate-300 mb-1" />
                        <span className="text-sm text-slate-400">Adicionar mais fotos</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFotos} />
                    </label>
                    </div>

                    {/* Novas fotos a adicionar */}
                    {fotos.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-slate-500">Novas fotos:</p>
                        {fotos.map((foto, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <img src={URL.createObjectURL(foto)} alt="" className="w-16 h-12 object-cover rounded-lg" />
                            <div className="flex-1 grid grid-cols-2 gap-2">
                            <select value={fotoDescricoes[i]?.comodo} onChange={(e) => {
                                const novo = [...fotoDescricoes]
                                novo[i] = { ...novo[i], comodo: e.target.value }
                                setFotoDescricoes(novo)
                            }} className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500">
                                {Object.entries(COMODO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <input placeholder="Descrição (opcional)" value={fotoDescricoes[i]?.descricao}
                                onChange={(e) => {
                                const novo = [...fotoDescricoes]
                                novo[i] = { ...novo[i], descricao: e.target.value }
                                setFotoDescricoes(novo)
                                }}
                                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            {i === 0 && fotosExistentes.length === 0 && (
                            <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">Capa</span>
                            )}
                            <button type="button" onClick={() => removerFoto(i)} className="text-slate-400 hover:text-red-500">
                            <X size={16} />
                            </button>
                        </div>
                        ))}
                    </div>
                    )}

                    {erro && <p className="text-red-500 text-sm whitespace-pre-line bg-red-50 p-3 rounded-lg">{erro}</p>}

                    <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setStep(2)}
                        className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                        ← Voltar
                    </button>
                    <button type="submit" disabled={salvando}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                        <Check size={16} />
                        {salvando ? 'Salvando...' : editandoId ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
                    </button>
                    </div>
                </div>
                )}
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhe */}
        {imovelSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Detalhes do Imóvel</h2>
                <button onClick={() => setImovelSelecionado(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
                </button>
            </div>
            <div className="p-6 space-y-3">

                {/* Carrossel de fotos */}
                <CarrosselFotos imovelId={imovelSelecionado.id} />

                <h3 className="font-semibold text-slate-800">
                {imovelSelecionado.endereco}, {imovelSelecionado.numero}
                {imovelSelecionado.complemento && ` - ${imovelSelecionado.complemento}`}
                </h3>
                <p className="text-sm text-slate-500">
                {imovelSelecionado.bairro} · {imovelSelecionado.cidade}/{imovelSelecionado.estado}
                </p>
                <div className="flex items-center gap-3 text-sm text-slate-600 py-2">
                {imovelSelecionado.quartos > 0 && <span className="flex items-center gap-1"><Bed size={14} />{imovelSelecionado.quartos} quartos</span>}
                {imovelSelecionado.banheiros > 0 && <span className="flex items-center gap-1"><Bath size={14} />{imovelSelecionado.banheiros} banheiros</span>}
                {imovelSelecionado.vagas > 0 && <span className="flex items-center gap-1"><Car size={14} />{imovelSelecionado.vagas} vagas</span>}
                </div>
                {imovelSelecionado.descricao && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{imovelSelecionado.descricao}</p>
                )}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button onClick={handleDeletar} disabled={deletando}
                    className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {deletando ? 'Excluindo...' : 'Excluir imóvel'}
                </button>
                <button onClick={abrirEdicao}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Editar imóvel
                </button>
                </div>
            </div>
            </div>
        </div>
        )}

    </div>
  )
}