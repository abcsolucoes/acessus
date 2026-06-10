import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiFetch, authHeaders, decodeToken, API_URL } from "../../../services/api"
import type { Candidate, Field } from "../../../types"
import { FieldModal } from "../FieldModal"
import { Header } from "../../../components/Header"
import { Toast } from "../../../components/Toast"
import { formatCpf, formatPhone, formatDate } from "../../../utils/format"
import styles from './style.module.css'

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

  useEffect(() => {
    async function load() {
      setUser(decodeToken())

      try {
        const data = await apiFetch<Candidate>(`/candidates/${id}`, {
          headers: authHeaders(),
        })
        setCandidate(data)

        const fieldsData = await apiFetch<Field[]>(`/field/${id}`, { headers: authHeaders() })
        setFields(fieldsData.filter(f => f.scope === 'CANDIDATE'))

      } catch {
        navigate('/rh')
      }
    }

    load()
  }, [])

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

  return (
    <>
      <Header moduleName="RH" userName={user?.name ?? ''} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <main className={styles.main}>

        {/* ── Topo: voltar + nome + status ── */}
        <div className={styles.top}>
          <button className={styles.backBtn} onClick={() => navigate('/rh')}>
            ← Voltar
          </button>
          <h1 className={styles.title}>{candidate?.name ?? '...'}</h1>
          <button
            className={styles.formBtn}
            onClick={handleOpenForm}
            disabled={!candidate?.formEnabled}
            title={candidate?.formEnabled ? 'Abrir formulário do candidato' : 'Formulário bloqueado (status não é Pendente)'}
          >
            Ver formulário ↗
          </button>
          <span className={`${styles.badge} ${styles[`badge_${candidate?.candidateStatus}`]}`}>
            {STATUS_LABEL[candidate?.candidateStatus ?? '']}
          </span>
        </div>

        {/* ── Informações do candidato ── */}
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

        {/* ── Ações ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Status</h2>
          <div className={styles.statusBtns}>
            {(['PENDING', 'UNDER_ANALYSIS', 'APPROVED', 'REJECTED'] as const).map(s => (
              <button
                key={s}
                className={`${styles.statusBtn} ${candidate?.candidateStatus === s ? styles.statusBtnActive : ''}`}
                onClick={() => handleChangeStatus(s)}
                disabled={loading || candidate?.candidateStatus === s}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </section>

        {/* ── Downloads ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Downloads</h2>
          <div className={styles.downloadBtns}>
            <button
              className={styles.downloadBtn}
              onClick={() => handleDownload(
                `/candidates/${id}/report`,
                `relatorio_${candidate?.name ?? id}.docx`
              )}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Relatório (.docx)
            </button>
            <button
              className={styles.downloadBtn}
              onClick={() => handleDownload(
                `/candidates/${id}/files/zip`,
                `documentos_${candidate?.name ?? id}.zip`
              )}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Documentos (.zip)
            </button>
          </div>
        </section>

        {/* ── Campos personalizados ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Campos personalizados</h2>
            <button
              className={styles.addFieldBtn}
              onClick={() => setShowFieldModal(true)}
            >
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

        {showFieldModal && (
          <FieldModal
            candidateId={Number(id)}
            onClose={() => setShowFieldModal(false)}
            onSuccess={field => setFields(prev => [...prev, field])}
          />
        )}

      </main>

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
    </>
  )
}