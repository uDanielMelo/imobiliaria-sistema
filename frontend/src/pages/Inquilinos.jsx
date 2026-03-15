import { useState, useEffect } from 'react'
import { Users, Plus, Search, X, Check, Phone, Mail } from 'lucide-react'
import api from '../services/api'

const FORM_INICIAL = {
  nome: '', cpf: '', rg: '', telefone: '',
  email: '', data_nascimento: '', profissao: '', renda_mensal: '',
}

export default function Inquilinos() {
  const [inquilinos, setInquilinos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const fetchInquilinos = async () => {
    try {
      const { data } = await api.get('/inquilinos/')
      setInquilinos(Array.isArray(data) ? data : data.results ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInquilinos() }, [])

  const filtrados = inquilinos.filter(i =>
    i.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    i.cpf?.includes(busca) ||
    i.email?.toLowerCase().includes(busca.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      await api.post('/inquilinos/', form)
      setShowModal(false)
      setForm(FORM_INICIAL)
      fetchInquilinos()
    } catch {
      setErro('Erro ao cadastrar inquilino. Verifique os campos.')
    } finally {
      setSalvando(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inquilinos</h1>
          <p className="text-slate-500 text-sm mt-1">{inquilinos.length} inquilino(s) cadastrado(s)</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Novo Inquilino
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Buscar por nome, CPF ou email..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400">Nenhum inquilino encontrado.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-primary-600 text-sm hover:underline">
            Cadastrar primeiro inquilino
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">CPF</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Contato</th>
                <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Profissão</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((inq, i) => (
                <tr key={inq.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                        {inq.nome?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 text-sm">{inq.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{inq.cpf}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {inq.telefone && <span className="text-xs text-slate-500 flex items-center gap-1"><Phone size={11} />{inq.telefone}</span>}
                      {inq.email && <span className="text-xs text-slate-500 flex items-center gap-1"><Mail size={11} />{inq.email}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{inq.profissao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Novo Inquilino</h2>
              <button onClick={() => { setShowModal(false); setErro('') }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nome completo *</label>
                <input name="nome" required value={form.nome} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CPF *</label>
                  <input name="cpf" required value={form.cpf} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">RG</label>
                  <input name="rg" value={form.rg} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="00.000.000-0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Telefone</label>
                  <input name="telefone" value={form.telefone} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="(11) 99999-0000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="email@exemplo.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Data de nascimento</label>
                  <input name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Profissão</label>
                  <input name="profissao" value={form.profissao} onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Profissão" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Renda mensal (R$)</label>
                <input name="renda_mensal" type="number" value={form.renda_mensal} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00" />
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
                  {salvando ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}