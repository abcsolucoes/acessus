import { useEffect, useRef, useState } from "react";
import styles from "./style.module.css";
import type { Ticket, TicketAttachment } from "../../../types";
import { apiFetch, authHeaders, API_URL } from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { formatDateTime } from "../../../utils/format";

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvido',
  CLOSED: 'Encerrado',
}

const STATUS_CLASS: Record<string, string> = {
  OPEN: styles.statusOpen,
  IN_PROGRESS: styles.statusInProgress,
  RESOLVED: styles.statusResolved,
  CLOSED: styles.statusClosed,
}

const DOT_CLASS: Record<string, string> = {
  OPEN: styles.dotOpen,
  IN_PROGRESS: styles.dotInProgress,
  RESOLVED: styles.dotResolved,
  CLOSED: styles.dotClosed,
}

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("OPEN")

  const [loading, setLoading] = useState(false)

  // ── Anexos ──
  const [uploading, setUploading] = useState(false)
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await apiFetch<Ticket>(`/tickets/${id}`, { headers: authHeaders() })
    setTicket(data)
    setSelectedStatus(data.status)
  }

  async function handleChangeStatus() {
    setLoading(true);
    try {
      const updated = await apiFetch<Ticket>(`/tickets/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(selectedStatus),
      })
      setTicket(updated)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Upload imediato ao selecionar — igual ao formulário do candidato
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        await apiFetch<TicketAttachment>(`/tickets/${id}/attachments`, {
          method: 'POST',
          headers: authHeaders(),
          body: formData,
        })
      }
      // Recarrega o ticket para exibir os novos anexos
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
      // Limpa o input para permitir enviar o mesmo arquivo novamente
      if (fileInputRef.current)  fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  async function handleDeleteAttachment(attachmentId: number) {
    try {
      await apiFetch(`/tickets/${id}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      // Remove da lista local sem precisar recarregar tudo
      setTicket(prev => prev ? {
        ...prev,
        attachments: prev.attachments.filter(a => a.id !== attachmentId)
      } : prev)
    } catch (e) {
      console.error(e)
    }
  }

  // Abre o arquivo numa nova aba — o browser decide se exibe ou baixa
  function openAttachment(attachmentId: number) {
    const token = localStorage.getItem('token')
    // Não dá para usar apiFetch aqui pois precisamos de uma URL para o <a> ou window.open
    // Solução: abre a URL com o token no header via fetch e cria um blob URL temporário
    fetch(`${API_URL}/tickets/${id}/attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        // Libera a memória após 60s
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      })
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <button type="button" className={styles.backBtn} onClick={() => navigate("/tickets")}>
          ← Voltar
        </button>
        <span className={styles.ticketId}># {ticket?.id}</span>
      </header>

      <main className={styles.main}>
        {/* Coluna principal */}
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{ticket?.title}</h1>
            {ticket && (
              <span className={`${styles.statusBadge} ${STATUS_CLASS[ticket.status]}`}>
                {STATUS_LABEL[ticket.status]}
              </span>
            )}
          </div>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Aberto por</span>
              <span className={styles.metaValue}>{ticket?.createdBy.name}</span>
            </span>
            <span className={styles.metaSep}>·</span>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Em</span>
              <span className={styles.metaValue}>{formatDateTime(ticket?.createdAt)}</span>
            </span>
            <span className={styles.metaSep}>·</span>
            {ticket?.department && (
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Para</span>
                <span className={styles.metaValue}>{ticket.department}</span>
              </span>
            )}
            {ticket?.assignedTo && (
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Para</span>
                <span className={styles.metaValue}>{ticket.assignedTo.name}</span>
              </span>
            )}
          </div>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Descrição</h2>
            <p className={styles.description}>{ticket?.description}</p>
          </section>

          <hr className={styles.divider} />

          {/* ── Anexos ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Anexos</h2>

            {/* Lista de anexos existentes */}
            {ticket && ticket.attachments.length > 0 && (
              <ul className={styles.attachmentList}>
                {ticket.attachments.map(a => (
                  <li key={a.id} className={styles.attachmentItem}>
                    <button
                      type="button"
                      className={styles.attachmentName}
                      onClick={() => openAttachment(a.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      {a.fileName}
                    </button>
                    <button
                      type="button"
                      className={styles.attachmentRemove}
                      onClick={() => handleDeleteAttachment(a.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Botões de upload */}
            <div className={styles.uploadOptions}>
              <label className={`${styles.uploadOption} ${uploading ? styles.uploadDisabled : ''}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={styles.uploadOptionTitle}>
                  {uploading ? 'Enviando…' : 'Selecionar arquivo'}
                </span>
                <input ref={fileInputRef} type="file" multiple className={styles.fileInput}
                  onChange={handleFileChange} disabled={uploading} />
              </label>

              <div className={styles.uploadDivider} />

              <label className={`${styles.uploadOption} ${uploading ? styles.uploadDisabled : ''}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className={styles.uploadOptionTitle}>Tirar foto</span>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
                  className={styles.fileInput} onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
          </section>
        </div>

        {/* Coluna lateral */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Status</h3>
            <div className={styles.statusList}>
              {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(s => (
                <label key={s} className={styles.statusOption}>
                  <input type="radio" name="status" value={s}
                    checked={selectedStatus === s}
                    onChange={e => setSelectedStatus(e.target.value)} />
                  <span className={`${styles.statusDot} ${DOT_CLASS[s]}`} />
                  {STATUS_LABEL[s]}
                </label>
              ))}
            </div>
            <button type="button" className={styles.saveStatusBtn} onClick={handleChangeStatus} disabled={loading}>
              {loading ? "Salvando..." : "Salvar status"}
            </button>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Detalhes</h3>
            <ul className={styles.detailList}>
              {ticket?.department && (
                <li className={styles.detailItem}>
                  <span className={styles.detailLabel}>Departamento</span>
                  <span className={styles.detailValue}>{ticket.department}</span>
                </li>
              )}
              {ticket?.assignedTo && (
                <li className={styles.detailItem}>
                  <span className={styles.detailLabel}>Atribuído a</span>
                  <span className={styles.detailValue}>{ticket.assignedTo.name}</span>
                </li>
              )}
              <li className={styles.detailItem}>
                <span className={styles.detailLabel}>Criado em</span>
                <span className={styles.detailValue}>{formatDateTime(ticket?.createdAt)}</span>
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </>
  )
}
