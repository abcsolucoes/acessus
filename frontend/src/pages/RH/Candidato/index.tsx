import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch, authHeaders, decodeToken, API_URL } from "../../../services/api"
import type { Candidate, Field } from "../../../types"
import { FieldModal } from "../FieldModal"
import { Header } from "../../../components/Header"
import { Toast } from "../../../components/Toast"
import { DysrupConfirmModal } from "../../../components/DysrupConfirmModal"
import { formatCpf, formatPhone, formatDate } from "../../../utils/format"
import styles from './style.module.css'

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return digits.slice(0, 5) + '-' + digits.slice(5)
  return digits
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  UNDER_ANALYSIS: 'Em análise',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}

export function RHCandidatoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
  const [loading, setLoading] = useState(false)  // para ações (mudar status, etc.)
  const [fields, setFields] = useState<Field[]>([])
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketModalError, setTicketModalError] = useState('')
  const [ticketLoading, setTicketLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [actionsPos, setActionsPos] = useState({ top: 0, right: 0 })
  const [showDysrupModal, setShowDysrupModal] = useState(false)
  const [dysrupLoading, setDysrupLoading] = useState(false)
  const [dysrupError, setDysrupError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({
    name: '', email: '', cpf: '', telephone: '', position: '', admissionDate: '',
    birthDate: '', zipcode: '', addressNumber: '', complement: '', routeName: '', teamName: '',
  })
  const [editRoutePhoto, setEditRoutePhoto] = useState<File | null>(null)
  const [editCepLoading, setEditCepLoading] = useState(false)
  const [editCepError, setEditCepError] = useState('')
  const [itineraries, setItineraries] = useState<{ itinerary_id: number; itinerary_description: string }[]>([])

  useEffect(() => {
    async function load() {
      setUser(decodeToken())

      try {
        const data = await apiFetch<Candidate>(`/candidates/${id}`, {
          headers: authHeaders(),
        })
        setCandidate(data)
        setEditForm({
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          telephone: data.telephone,
          position: data.position,
          admissionDate: data.admissionDate,
          birthDate: data.birthDate ?? '',
          zipcode: data.zipcode ?? '',
          addressNumber: data.addressNumber ?? '',
          complement: data.complement ?? '',
          routeName: data.routeName ?? '',
          teamName: data.teamName ?? '',
        })

        const fieldsData = await apiFetch<Field[]>(`/field/${id}`, { headers: authHeaders() })
        setFields(fieldsData.filter(f => f.scope === 'CANDIDATE'))

      } catch {
        navigate('/rh')
      }
    }

    load()
  }, [])

  useEffect(() => {
    apiFetch<{ itinerary_id: number; itinerary_description: string }[]>('/dysrup/itineraries', {
      headers: authHeaders(),
    }).then(setItineraries).catch(() => {})
  }, [])

  const [editAddress, setEditAddress] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editAddressState, setEditAddressState] = useState('')

  useEffect(() => {
    const digits = editForm.zipcode.replace(/\D/g, '')
    if (digits.length !== 8) return
    setEditCepLoading(true)
    setEditCepError('')
    apiFetch<Record<string, string>>(`/dysrup/cep?cep=${digits}`, { headers: authHeaders() })
      .then(data => {
        setEditAddress(data.logradouro || '')
        setEditDistrict(data.bairro || '')
        setEditCity(data.localidade || '')
        setEditAddressState(data.uf || '')
      })
      .catch(() => setEditCepError('CEP não encontrado'))
      .finally(() => setEditCepLoading(false))
  }, [editForm.zipcode])

  async function handleDownload(endpoint: string, filename: string) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditLoading(true)
    setEditError('')

    if (!editForm.birthDate) { setEditError('Informe a data de nascimento'); setEditLoading(false); return }
    if (editForm.zipcode.replace(/\D/g, '').length !== 8) { setEditError('Informe o CEP'); setEditLoading(false); return }
    if (!editForm.addressNumber.trim()) { setEditError('Informe o número do endereço'); setEditLoading(false); return }

    try {
      const data = {
        name: editForm.name,
        email: editForm.email,
        cpf: editForm.cpf.replace(/\D/g, ''),
        telephone: editForm.telephone.replace(/\D/g, ''),
        position: editForm.position,
        admissionDate: editForm.admissionDate,
        birthDate: editForm.birthDate || null,
        zipcode: editForm.zipcode.replace(/\D/g, '') || null,
        addressNumber: editForm.addressNumber || null,
        complement: editForm.complement || null,
        routeName: editForm.routeName || null,
        teamName: editForm.teamName || null,
      }
      const formData = new FormData()
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
      if (editRoutePhoto) formData.append('routePhoto', editRoutePhoto)

      const updated = await apiFetch<Candidate>(`/candidates/${id}`, {
        method: 'PUT',
        headers: { ...authHeaders() },
        body: formData,
      })
      setCandidate(updated)
      setShowEditModal(false)
      setEditRoutePhoto(null)
      setToast('Candidato atualizado com sucesso!')
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Erro ao atualizar.')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await apiFetch(`/candidates/delete/${id}`, { method: 'DELETE', headers: authHeaders() })
      navigate('/rh')
    } catch {
      setDeleteLoading(false)
    }
  }

  async function handleResendForm() {
    try {
      await apiFetch(`/candidates/${id}/resend-form`, { method: 'POST', headers: authHeaders() })
      setToast('Formulário reenviado!')
    } catch {
      setToast('Erro ao reenviar formulário.')
    }
  }

  async function handleOpenForm() {
    try {
      const url = await apiFetch<string>(`/candidates/formCandidate/${id}`, {
        headers: authHeaders(),
      })
      // Backend agora retorna: {baseUrl}/formulario/{token}
      window.open(url, '_blank')
    } catch (err) {
      console.error('Erro ao abrir formulário:', err)
    }
  }

  async function handleChangeStatus(status: string) {
    setLoading(true)
    try {
      const data = await apiFetch<Candidate>(`/candidates/changeStatus/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(status),   // ← o backend espera o enum direto no body
      })
      setCandidate(data)   // atualiza o candidato com o novo status
    } catch {
      // erro silencioso por ora
    } finally {
      setLoading(false)
    }

    if (status === "APPROVED") {
      setTimeout(() => setShowTicketModal(true), 400)
    }
  }

  async function handleOpenTicket() {
    setTicketModalError('')
    setTicketLoading(true)
    try {
      await apiFetch('/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          title: `Aparelho para ${candidate?.name}`,
          description: `Gentileza providenciar a configuração de um aparelho para o(a) colaborador(a) ${candidate?.name}, referente à sua admissão em ${candidate?.admissionDate}.`,
          department: "TI"
        }),
      })
      setShowTicketModal(false)
      setToast('Chamado aberto para o T.I com sucesso!')
    } catch (e) {
      setTicketModalError(e instanceof Error ? e.message : 'Erro ao abrir chamado.')
    } finally {
      setTicketLoading(false)
    }
  }

  function handleRegisterDysrup() {
    setDysrupError(null)
    setShowDysrupModal(true)
  }

  async function handleDysrupConfirm() {
    setDysrupLoading(true)
    try {
      await apiFetch(`/dysrup/registrar-candidato/${id}`, { method: 'POST', headers: authHeaders() })
      setShowDysrupModal(false)
      setToast('Candidato cadastrado na Dysrup com sucesso!')
    } catch (e) {
      const message = e instanceof Error ? e.message : ''
      if (message.toLowerCase().includes('cpf') || message.toLowerCase().includes('existe') || message.toLowerCase().includes('conflict')) {
        setDysrupError(message)
      } else {
        setShowDysrupModal(false)
        setToast(message || 'Erro ao cadastrar na Dysrup.')
      }
    } finally {
      setDysrupLoading(false)
    }
  }

  async function handleSendWelcome() {
    setActionsOpen(false)
    try {
      await apiFetch(`/candidates/${id}/send-welcome`, { method: 'POST', headers: authHeaders() })
      setToast('Mensagem de boas-vindas enviada!')
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Erro ao enviar mensagem.')
    }
  }

  async function handleSendRoute() {
    setActionsOpen(false)
    try {
      await apiFetch(`/candidates/${id}/send-route`, { method: 'POST', headers: authHeaders() })
      setToast('Notificação de rota enviada!')
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Erro ao enviar notificação.')
    }
  }

  const initials = (candidate?.name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  return (
    <>
      <Header moduleName="RH" userName={user?.name ?? ''} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <main className={styles.main}>

        {/* ── Breadcrumb ── */}
        <div className={styles.breadcrumb}>
          <button className={styles.backBtn} onClick={() => navigate('/rh')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Candidatos
          </button>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{candidate?.name ?? '...'}</span>
        </div>

        {/* ── Hero card ── */}
        <div className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />

          <div className={styles.heroLeft}>
            <div className={styles.avatar}>{initials || '?'}</div>
            <div className={styles.heroInfo}>
              <h1 className={styles.heroName}>{candidate?.name ?? '...'}</h1>
              <span className={styles.heroPosition}>{candidate?.position ?? ''}</span>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroBadgeRow}>
              <span className={`${styles.badge} ${styles[`badge_${candidate?.candidateStatus}`]}`}>
                {STATUS_LABEL[candidate?.candidateStatus ?? '']}
              </span>
              <button
                className={styles.dysrupBtn}
                onClick={handleRegisterDysrup}
                disabled={loading}
                title="Cadastrar na Dysrup"
              >
                <img src="/dysrup_logo.png" alt="Dysrup" height="18" style={{ display: 'block' }} />
                <span style={{ width: 6 }} />
                <p>Cadastrar na Dysrup</p>
              </button>
            </div>

            <div className={styles.heroActions}>
              <div className={styles.actionsWrap}>
                <button
                  className={styles.actionsToggle}
                  onClick={e => {
                    const r = e.currentTarget.getBoundingClientRect()
                    setActionsPos({ top: r.bottom + 6, right: window.innerWidth - r.right })
                    setActionsOpen(o => !o)
                  }}
                >
                  Ações
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {actionsOpen && (
                  <>
                    <div className={styles.actionsBackdrop} onClick={() => setActionsOpen(false)} />
                    <div className={styles.actionsMenu} style={{ top: actionsPos.top, right: actionsPos.right }}>
                      <p className={styles.actionsGroup}>Formulário</p>
                      <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); handleOpenForm() }} disabled={!candidate?.formEnabled}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Ver formulário
                      </button>
                      <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); handleResendForm() }} disabled={!candidate?.formEnabled}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                        </svg>
                        Reenviar formulário
                      </button>

                      <p className={styles.actionsGroup}>WhatsApp</p>
                      <button className={styles.actionsItem} onClick={handleSendWelcome}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Enviar boas-vindas
                      </button>
                      <button className={styles.actionsItem} onClick={handleSendRoute}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 8 12 12 14 14" />
                        </svg>
                        Enviar dados da rota
                      </button>

                      <div className={styles.actionsDivider} />
                      <button className={`${styles.actionsItem} ${styles.actionsItemEdit}`} onClick={() => { setActionsOpen(false); setShowEditModal(true) }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar
                      </button>
                      <button className={`${styles.actionsItem} ${styles.actionsItemDelete}`} onClick={() => { setActionsOpen(false); setShowDeleteModal(true) }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Grid principal ── */}
        <div className={styles.grid}>

          {/* ── Coluna esquerda ── */}
          <div className={styles.col}>

            {/* Informações */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Informações</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>E-mail</span>
                  <span className={styles.infoValue}>{candidate?.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>CPF</span>
                  <span className={styles.infoValue}>{formatCpf(candidate?.cpf ?? '')}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Telefone</span>
                  <span className={styles.infoValue}>{formatPhone(candidate?.telephone ?? '')}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Cargo</span>
                  <span className={styles.infoValue}>{candidate?.position}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Data de admissão</span>
                  <span className={styles.infoValue}>{formatDate(candidate?.admissionDate)}</span>
                </div>
              </div>
            </section>

            {/* Campos personalizados */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Campos personalizados</h2>
                <button className={styles.addFieldBtn} onClick={() => setShowFieldModal(true)}>
                  + Adicionar campo
                </button>
              </div>
              {fields.length === 0 ? (
                <p className={styles.emptyValue}>Nenhum campo personalizado.</p>
              ) : (
                <div className={styles.fieldList}>
                  {fields.map(f => (
                    <div key={f.id} className={styles.fieldItem}>
                      <span className={styles.fieldName}>{f.fieldName}</span>
                      <span className={styles.infoLabel}>{f.fieldType}</span>
                      <button
                        className={styles.deleteFieldBtn}
                        onClick={() => {
                          apiFetch(`/field/${f.id}?candidateId=${id}`, {
                            method: 'DELETE',
                            headers: authHeaders(),
                          }).then(() => setFields(prev => prev.filter(x => x.id !== f.id)))
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* ── Coluna direita ── */}
          <div className={styles.col}>

            {/* Status */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Status</h2>
              <div className={styles.statusBtns}>
                {(['PENDING', 'UNDER_ANALYSIS', 'APPROVED', 'REJECTED'] as const).map(s => (
                  <button
                    key={s}
                    className={`${styles.statusBtn} ${candidate?.candidateStatus === s ? styles[`statusBtnActive_${s}`] : ''}`}
                    onClick={() => handleChangeStatus(s)}
                    disabled={loading || candidate?.candidateStatus === s}
                  >
                    <span className={styles.statusDot} data-status={s} />
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </section>

            {/* Downloads */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Downloads</h2>
              <div className={styles.downloadCards}>
                <button
                  className={styles.downloadCard}
                  onClick={() => handleDownload(`/candidates/${id}/report`, `relatorio_${candidate?.name ?? id}.docx`)}
                >
                  <span className={styles.downloadIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </span>
                  <span className={styles.downloadInfo}>
                    <strong>Relatório</strong>
                    <small>.docx</small>
                  </span>
                  <svg className={styles.downloadArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </button>
                <button
                  className={styles.downloadCard}
                  onClick={() => handleDownload(`/candidates/${id}/files/zip`, `documentos_${candidate?.name ?? id}.zip`)}
                >
                  <span className={styles.downloadIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </span>
                  <span className={styles.downloadInfo}>
                    <strong>Documentos</strong>
                    <small>.zip</small>
                  </span>
                  <svg className={styles.downloadArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </button>
              </div>
            </section>

          </div>
        </div>

        {showFieldModal && (
          <FieldModal
            candidateId={Number(id)}
            onClose={() => setShowFieldModal(false)}
            onSuccess={field => setFields(prev => [...prev, field])}
          />
        )}

      </main>

      {showEditModal && (
        <div className={styles.overlay}>
          <div className={styles.modalWide}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar candidato</h2>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form className={styles.editForm} onSubmit={handleEdit}>

              <p className={styles.editSectionTitle}>Dados pessoais</p>

              <div className={styles.editFullWidth}>
                <label>Nome completo</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
              </div>

              <div className={styles.editGrid2}>
                <div>
                  <label>E-mail</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label>CPF</label>
                  <input
                    value={formatCpf(editForm.cpf)}
                    onChange={e => setEditForm(f => ({ ...f, cpf: e.target.value.replace(/\D/g, '') }))}
                    maxLength={14} required
                  />
                </div>
              </div>

              <div className={styles.editGrid2}>
                <div>
                  <label>Telefone</label>
                  <input
                    value={formatPhone(editForm.telephone)}
                    onChange={e => setEditForm(f => ({ ...f, telephone: e.target.value.replace(/\D/g, '') }))}
                    maxLength={15} required
                  />
                </div>
                <div>
                  <label>Data de nascimento</label>
                  <input type="date" value={editForm.birthDate} onChange={e => setEditForm(f => ({ ...f, birthDate: e.target.value }))} />
                </div>
              </div>

              <p className={styles.editSectionTitle}>Endereço</p>

              <div className={styles.editGrid2}>
                <div>
                  <label>
                    CEP{editCepLoading && <span className={styles.editCepSpinner}> buscando…</span>}
                  </label>
                  <input
                    placeholder="00000-000"
                    value={formatCep(editForm.zipcode)}
                    onChange={e => setEditForm(f => ({ ...f, zipcode: e.target.value.replace(/\D/g, '') }))}
                    maxLength={9}
                  />
                  {editCepError && <span className={styles.editFieldError}>{editCepError}</span>}
                </div>
                <div>
                  <label>Estado</label>
                  <input value={editAddressState} onChange={e => setEditAddressState(e.target.value)} maxLength={2} placeholder="UF" />
                </div>
              </div>

              <div className={styles.editFullWidth}>
                <label>Logradouro</label>
                <input value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Preenchido automaticamente pelo CEP" />
              </div>

              <div className={styles.editGrid2}>
                <div>
                  <label>Número</label>
                  <input value={editForm.addressNumber} onChange={e => setEditForm(f => ({ ...f, addressNumber: e.target.value }))} placeholder="Ex: 950" />
                </div>
                <div>
                  <label>Complemento <span className={styles.editOptional}>(opcional)</span></label>
                  <input value={editForm.complement} onChange={e => setEditForm(f => ({ ...f, complement: e.target.value }))} placeholder="Apto, bloco..." />
                </div>
              </div>

              <div className={styles.editGrid2}>
                <div>
                  <label>Bairro</label>
                  <input value={editDistrict} onChange={e => setEditDistrict(e.target.value)} placeholder="Bairro" />
                </div>
                <div>
                  <label>Cidade</label>
                  <input value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="Cidade" />
                </div>
              </div>

              <p className={styles.editSectionTitle}>Cargo e equipe</p>

              <div className={styles.editGrid2}>
                <div>
                  <label>Cargo</label>
                  <input value={editForm.position} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} required />
                </div>
                <div>
                  <label>Data de admissão</label>
                  <input type="date" value={editForm.admissionDate} onChange={e => setEditForm(f => ({ ...f, admissionDate: e.target.value }))} required />
                </div>
              </div>

              <div className={styles.editGrid2}>
                <div>
                  <label>Equipe</label>
                  <select value={editForm.teamName} onChange={e => setEditForm(f => ({ ...f, teamName: e.target.value }))}>
                    <option value="">Selecione uma equipe</option>
                    {itineraries.map(i => (
                      <option key={i.itinerary_id} value={i.itinerary_description}>{i.itinerary_description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Rota</label>
                  <input value={editForm.routeName} onChange={e => setEditForm(f => ({ ...f, routeName: e.target.value }))} placeholder="Ex: M - 020" />
                </div>
              </div>

              <p className={styles.editSectionTitle}>Foto da rota</p>

              <div className={styles.editFullWidth}>
                {editRoutePhoto ? (
                  <div className={styles.editUploadedFile}>
                    <span>📄</span>
                    <span className={styles.editUploadedName}>{editRoutePhoto.name}</span>
                    <button type="button" className={styles.editUploadedRemove} onClick={() => setEditRoutePhoto(null)}>✕</button>
                  </div>
                ) : (
                  <label className={styles.editUploadArea}>
                    <span>↑</span>
                    <span className={styles.editUploadTitle}>Selecionar nova foto (substitui a atual)</span>
                    <span className={styles.editUploadHint}>JPG, PNG ou WebP</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => setEditRoutePhoto(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>

              {editError && <p className={styles.error}>{editError}</p>}

              <div className={styles.footer}>
                <button type="button" className={styles.cancelBtn} onClick={() => { setShowEditModal(false); setEditRoutePhoto(null) }} disabled={editLoading}>Cancelar</button>
                <button type="submit" className={styles.submitBtn} disabled={editLoading}>{editLoading ? 'Salvando…' : 'Salvar'}</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Excluir candidato</h2>
              <button className={styles.closeBtn} onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <form className={styles.form}>
              <div className={styles.sectionLabel}>Tem certeza que deseja excluir <strong>{candidate?.name}</strong>? Esta ação não pode ser desfeita.</div>
              <div className={styles.footer}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancelar</button>
                <button type="button" className={styles.deleteBtnModal} onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Excluindo…' : 'Excluir'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTicketModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>

            {/* <!-- Header --> */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Abrir chamado</h2>
              <button className={styles.closeBtn} onClick={() => setShowTicketModal(false)}>✕</button>
            </div>

            <form className={styles.form}>

              {/* <!-- Dados do contato --> */}
              <div className={styles.sectionLabel}>Deseja abrir um chamado de solicitação de aparelho automaticamente para o T.I?</div>

              {ticketModalError && (
                <p className={styles.error}>{ticketModalError}</p>
              )}

              {/* <!-- Footer --> */}
              <div className={styles.footer}>
                <button type="button" className={styles.cancelBtn}
                  onClick={() => { setShowTicketModal(false); setTicketModalError('') }}
                  disabled={ticketLoading}>
                  Cancelar
                </button>

                <button type="button" className={styles.submitBtn}
                  onClick={handleOpenTicket}
                  disabled={ticketLoading}>
                  {ticketLoading ? 'Abrindo…' : 'Abrir chamado'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {showDysrupModal && candidate && (
        <DysrupConfirmModal
          candidateName={candidate.name}
          onConfirm={handleDysrupConfirm}
          onSkip={() => { setShowDysrupModal(false); setDysrupError(null) }}
          error={dysrupError}
          loading={dysrupLoading}
        />
      )}
    </>
  )
}