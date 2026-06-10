import { useState } from "react"
import { apiFetch, authHeaders } from "../../../services/api"
import type { Contact } from "../../../types"
import styles from './style.module.css'

type Props = {
  initial: Contact | null   // null = novo | Contact = edição
  contacts: Contact[]       // lista existente para verificação de duplicatas
  onClose: () => void
  onSuccess: (contact: Contact, isEdit: boolean) => void
}

const EQUIPES = Array.from({ length: 25 }, (_, i) => String.fromCharCode(65 + i)) // A–Y
const SETORES = ['DP', 'RH', 'Operação', 'TI', 'Comercial', 'Financeiro']
const MARCAS  = ['Vilma', 'Porto Alegre', 'Cogran', 'Cimed', 'Inproveter', 'Lindoya']

// ── Normalização de telefone ──────────────────────────────────
// Resultado: 015 + DDD (2 dígitos) + 9 + número (8 dígitos) = 14 dígitos
function normalizarTelefone(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  // Já está normalizado
  if (digits.startsWith('015') && digits.length === 14) return raw

  // Remove +55 se presente
  let num = digits.startsWith('55') && digits.length >= 12
    ? digits.slice(2)
    : digits

  // 10 dígitos (DDD + 8): adiciona o 9 após o DDD
  if (num.length === 10) {
    num = num.slice(0, 2) + '9' + num.slice(2)
  }

  return '015' + num
}

// ── Helpers de formatação de nome ────────────────────────────
const PARTICULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'dos', 'e'])

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function palavrasSignificativas(nomeRaw: string): string[] {
  return nomeRaw.trim().split(/\s+/).filter(p => p && !PARTICULAS.has(p.toLowerCase()))
}

function primeiroUltimo(nomeRaw: string): string {
  const palavras = palavrasSignificativas(nomeRaw)
  if (palavras.length === 0) return ''
  if (palavras.length === 1) return capitalize(palavras[0])
  return `${capitalize(palavras[0])} ${capitalize(palavras[palavras.length - 1])}`
}

// Retorna "Nome P. Sobrenome" usando a inicial do penúltimo nome significativo
function abreviarNome(nomeRaw: string): string {
  const palavras = palavrasSignificativas(nomeRaw)
  if (palavras.length < 3) return primeiroUltimo(nomeRaw) // não tem nome do meio para abreviar
  const primeiro   = capitalize(palavras[0])
  const ultimo     = capitalize(palavras[palavras.length - 1])
  const penultimo  = palavras[palavras.length - 2]
  return `${primeiro} ${penultimo.charAt(0).toUpperCase()}. ${ultimo}`
}

// ─────────────────────────────────────────────────────────────

export function ContactModal({ initial, contacts, onClose, onSuccess }: Props) {
  const isEdit = initial !== null

  // Campos base
  const [rawName, setRawName] = useState(initial?.name ?? '')
  const [telephone, setTelephone] = useState(initial?.telephone ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')

  // Classificação
  const [tipo, setTipo] = useState('')
  const [promotorTipo, setPromotorTipo] = useState('')   // 'corporativo' | 'particular'
  const [equipe, setEquipe] = useState('')
  const [setor, setSetor] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [marca, setMarca] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Verifica duplicata e retorna o nome correto (normal ou abreviado)
  function resolverNome(nomeFormatadoBase: string): string {
    const jaExiste = contacts.some(c =>
      c.name === nomeFormatadoBase &&
      c.resourceName !== initial?.resourceName // ignora o próprio contato na edição
    )
    if (!jaExiste) return primeiroUltimo(rawName)
    return abreviarNome(rawName)
  }

  // ── Nome formatado (computed) ────────────────────────────
  function montarNomeFormatado(): string | null {
    if (!tipo || !rawName.trim()) return null

    // Monta uma versão provisória com nome simples para checar duplicata
    const nomeSimples = primeiroUltimo(rawName)
    const tipoLabel   = promotorTipo === 'corporativo' ? 'ABC' : 'Particular'

    let candidato: string | null = null
    switch (tipo) {
      case 'promotor':
        if (!promotorTipo || !equipe) return null
        candidato = `${nomeSimples} (${tipoLabel}) - Equipe ${equipe}`
        break
      case 'freelancer':
        if (!promotorTipo || !equipe) return null
        candidato = `${nomeSimples} (${tipoLabel}) - Freelancer Equipe ${equipe}`
        break
      case 'supervisor':
        candidato = `${nomeSimples} (ABC) - Supervisor`
        break
      case 'escritorio':
        if (!setor) return null
        candidato = `${nomeSimples} (ABC) - ${setor}`
        break
      case 'cliente':
        if (!empresa) return null
        candidato = `${nomeSimples} (Cliente) - ${empresa}`
        break
      case 'vendedor':
        if (!promotorTipo) return null
        candidato = `${nomeSimples} (${tipoLabel}) - Vendedor`
        break
      case 'exclusivo':
        if (!promotorTipo || !marca) return null
        candidato = `${nomeSimples} (${tipoLabel}) - Exclusivo ${marca}`
        break
      case 'externo':
        candidato = `${nomeSimples} - Externo`
        break
      default:
        return null
    }

    if (!candidato) return null

    // Substitui o nome simples pelo resolvido (normal ou abreviado)
    const nomeResolvido = resolverNome(candidato)
    return candidato.replace(nomeSimples, nomeResolvido)
  }

  const nomeFormatado = montarNomeFormatado()

  // ── Máscara de telefone ──────────────────────────────────
  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, '')
    v = v.replace(/^(\d{2})(\d)/, '($1) $2')
    v = v.replace(/(\d{5})(\d)/, '$1-$2')
    setTelephone(v)
  }

  // ── Submit ───────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!rawName.trim()) { setError('Informe o nome.'); return }
    if (!telephone.trim()) { setError('Informe o telefone.'); return }

    let finalName: string

    if (!isEdit) {
      // criação: tipo obrigatório
      if (!tipo) { setError('Selecione o tipo de contato.'); return }

      if (['promotor', 'freelancer', 'supervisor', 'escritorio', 'vendedor', 'exclusivo'].includes(tipo)) {
        const palavras = rawName.trim().split(/\s+/).filter(Boolean)
        if (palavras.length < 2) { setError('Informe nome e sobrenome para este tipo.'); return }
      }

      const formatted = montarNomeFormatado()
      if (!formatted) { setError('Preencha todos os campos de classificação.'); return }
      finalName = formatted

    } else {
      // edição: tipo opcional — se preenchido, reformata; senão usa o nome digitado
      if (tipo) {
        if (['promotor', 'freelancer', 'supervisor', 'escritorio', 'vendedor', 'exclusivo'].includes(tipo)) {
          const palavras = rawName.trim().split(/\s+/).filter(Boolean)
          if (palavras.length < 2) { setError('Informe nome e sobrenome para este tipo.'); return }
        }
        const formatted = montarNomeFormatado()
        if (!formatted) { setError('Preencha todos os campos de classificação.'); return }
        finalName = formatted
      } else {
        finalName = rawName.trim()
      }
    }

    setLoading(true)
    try {
      let data: Contact
      if (isEdit) {
        data = await apiFetch<Contact>(`/contacts/${initial!.resourceName}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ name: finalName, telephone: normalizarTelefone(telephone.trim()), email: email.trim() }),
        })
      } else {
        data = await apiFetch<Contact>('/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ name: finalName, telephone: normalizarTelefone(telephone.trim()), email: email.trim() }),
        })
      }
      onSuccess(data, isEdit)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar contato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? 'Editar contato' : 'Novo contato'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={loading}>✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>

          {/* ── Seção: dados base ── */}
          <div className={styles.sectionLabel}>Dados do contato</div>

          <div className={styles.field}>
            <label className={styles.label}>Nome completo <span className={styles.required}>*</span></label>
            <input
              className={styles.input}
              placeholder="Ex: Rafael Mendes"
              value={rawName}
              onChange={e => setRawName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Telefone <span className={styles.required}>*</span></label>
              <input
                className={styles.input}
                placeholder="(00) 00000-0000"
                value={telephone}
                onChange={handlePhoneChange}
                maxLength={15}
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>E-mail <span className={styles.optional}>(opcional)</span></label>
              <input
                className={styles.input}
                type="email"
                placeholder="contato@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* ── Seção: classificação ── */}
          <div className={styles.sectionLabel}>
            Classificação {isEdit && <span className={styles.optional}>(opcional na edição)</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Tipo de contato {!isEdit && <span className={styles.required}>*</span>}
            </label>
            <select
              className={styles.select}
              value={tipo}
              onChange={e => { setTipo(e.target.value); setPromotorTipo(''); setEquipe(''); setSetor(''); setEmpresa(''); setMarca('') }}
              disabled={loading}
            >
              <option value="">Selecione...</option>
              <option value="promotor">Promotor</option>
              <option value="freelancer">Freelancer</option>
              <option value="vendedor">Vendedor</option>
              <option value="supervisor">Supervisor</option>
              <option value="escritorio">Escritório</option>
              <option value="exclusivo">Exclusivo</option>
              <option value="cliente">Cliente</option>
              <option value="externo">Externo / Outros</option>
            </select>
          </div>

          {/* Promotor / Freelancer: subtipo + equipe */}
          {(tipo === 'promotor' || tipo === 'freelancer') && (
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>Salvar como <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={promotorTipo}
                  onChange={e => setPromotorTipo(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  <option value="corporativo">Corporativo (ABC)</option>
                  <option value="particular">Particular</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Equipe <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={equipe}
                  onChange={e => setEquipe(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  {EQUIPES.map(eq => (
                    <option key={eq} value={eq}>Equipe {eq}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Vendedor: subtipo (corporativo / particular), sem equipe */}
          {tipo === 'vendedor' && (
            <div className={styles.field}>
              <label className={styles.label}>Salvar como <span className={styles.required}>*</span></label>
              <select
                className={styles.select}
                value={promotorTipo}
                onChange={e => setPromotorTipo(e.target.value)}
                disabled={loading}
              >
                <option value="">Selecione...</option>
                <option value="corporativo">Corporativo (ABC)</option>
                <option value="particular">Particular</option>
              </select>
            </div>
          )}

          {/* Exclusivo: subtipo + marca */}
          {tipo === 'exclusivo' && (
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>Salvar como <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={promotorTipo}
                  onChange={e => setPromotorTipo(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  <option value="corporativo">Corporativo (ABC)</option>
                  <option value="particular">Particular</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Marca <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={marca}
                  onChange={e => setMarca(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  {MARCAS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Escritório: setor */}
          {tipo === 'escritorio' && (
            <div className={styles.field}>
              <label className={styles.label}>Setor <span className={styles.required}>*</span></label>
              <select
                className={styles.select}
                value={setor}
                onChange={e => setSetor(e.target.value)}
                disabled={loading}
              >
                <option value="">Selecione...</option>
                {SETORES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Cliente: empresa */}
          {tipo === 'cliente' && (
            <div className={styles.field}>
              <label className={styles.label}>Empresa <span className={styles.required}>*</span></label>
              <input
                className={styles.input}
                placeholder="Ex: Supermercado Central"
                value={empresa}
                onChange={e => setEmpresa(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* Preview do nome formatado */}
          {tipo && (
            <div className={styles.preview}>
              <span className={styles.previewLabel}>Como será salvo</span>
              <span className={`${styles.previewValue} ${!nomeFormatado ? styles.previewEmpty : ''}`}>
                {nomeFormatado ?? '—'}
              </span>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar contato'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
