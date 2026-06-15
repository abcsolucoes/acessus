import { useEffect, useState } from "react"
import { Header } from "../../components/Header"
import { Toast } from "../../components/Toast"
import styles from './style.module.css'
import { apiFetch, authHeaders, decodeToken } from "../../services/api";
import type { Page, Ticket, User } from "../../types";
import { useNavigate } from "react-router-dom";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const PAGE_SIZE = 20

// ── Componente ────────────────────────────────────────────────────────────────

export function TicketsPage() {
  const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])

  // ── Listagem ──
  type Filter = 'mine' | 'sector' | 'created' | 'all'
  const [filter, setFilter] = useState<Filter>('mine')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [loadingList, setLoadingList] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const visibleTickets = selectedStatus ? allTickets.filter(t => t.status === selectedStatus) : tickets

  // ── Modal novo ticket ──
  const [openModal, setOpenModal] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [pessoa, setPessoa] = useState('')
  const [solicitante, setSolicitante] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])  // arquivos aguardando upload
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [toast, setToast] = useState('')

  const navigate = useNavigate()

  // ── Carrega usuário e lista de usuários uma vez ──
  useEffect(() => {
    setUser(decodeToken())
    apiFetch<User[]>('/users/assignable', { headers: authHeaders() }).then(setAllUsers)
  }, [])

  // ── Busca tickets sempre que a página ou o filtro mudarem ──
  useEffect(() => {
    fetchTickets(page, filter)
  }, [page, filter])

  function changeFilter(f: Filter) {
    setFilter(f)
    setSelectedStatus(null)
    setPage(0)
  }

  async function fetchTickets(p: number, f: Filter) {
    setLoadingList(true)
    try {
      const data = await apiFetch<Page<Ticket>>(
        `/tickets?filter=${f}&page=${p}&size=${PAGE_SIZE}`,
        { headers: authHeaders() }
      )
      setTickets(data.content)
      setAllTickets(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingList(false)
    }
  }

  // ── Criar ticket ──
  async function handleSendForm() {
    setModalError('')
    if (!titulo.trim()) { setModalError('Informe um título.'); return }
    if (!descricao.trim()) { setModalError('Informe uma descrição.'); return }
    if (!departamento && !pessoa) { setModalError('Selecione um departamento ou uma pessoa.'); return }

    setSaving(true)
    try {
      // 1 — Cria o ticket e recebe o id de volta
      let created;

      if (user?.role === "ADMIN") {
        created = await apiFetch<Ticket>('/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({
            title: titulo,
            description: descricao,
            department: departamento || null,
            assignedToId: pessoa ? Number(pessoa) : null,
            applicantId: solicitante ? Number(solicitante) : null
          }),
        })
      } else {
        created = await apiFetch<Ticket>('/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({
            title: titulo,
            description: descricao,
            department: departamento || null,
            assignedToId: pessoa ? Number(pessoa) : null,
          }),
        })
      }

      // 2 — Envia cada arquivo usando o id do ticket recém criado
      // FormData é necessário para envio de arquivos (multipart/form-data)
      // Sem o Content-Type no header — o browser define automaticamente com o boundary correto
      for (const file of pendingFiles) {
        const formData = new FormData()
        formData.append('file', file)
        await apiFetch(`/tickets/${created.id}/attachments`, {
          method: 'POST',
          headers: authHeaders(),
          body: formData,
        })
      }

      // Volta para a primeira página e recarrega
      setPage(0)
      await fetchTickets(0, filter)
      closeModal()
      setToast('Ticket aberto com sucesso!')
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Erro ao abrir ticket.')
    } finally {
      setSaving(false)
    }
  }

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return
    setPendingFiles(prev => [...prev, ...Array.from(newFiles)])
  }

  function removeFile(index: number) {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  function closeModal() {
    setOpenModal(false)
    setTitulo('')
    setDescricao('')
    setDepartamento('')
    setPessoa('')
    setPendingFiles([])
    setModalError('')
    setSolicitante('')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  console.log(tickets)


  return (
    <>
      <Header moduleName="Tickets" userName={user?.name ?? ""} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <main className={styles.main}>

        {/* ── Topo ── */}
        <div className={styles.top}>
          <h1 className={styles.title}>Tickets</h1>
          <button onClick={() => setOpenModal(true)} className={styles.newBtn}>+ Novo ticket</button>
        </div>

        {/* ── Cards de indicadores ── */}
        <div className={styles.statsGrid}>

          <div
            className={`${styles.statCard} ${styles.statCardOpen} ${selectedStatus === 'OPEN' ? styles.statCardSelected : ''}`}
            data-status="OPEN"
            onClick={() => setSelectedStatus(prev => prev === 'OPEN' ? null : 'OPEN')}
          >
            <div className={styles.statIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M8 6h.01M11 6h.01M14 6h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M7 14h10M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{tickets.filter(ticket => ticket.status === "OPEN").length}</span>
              <span className={styles.statLabel}>Abertos</span>
            </div>
            <div className={styles.statAccent} />
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardInProgress} ${selectedStatus === 'IN_PROGRESS' ? styles.statCardSelected : ''}`}
            onClick={() => setSelectedStatus(prev => prev === 'IN_PROGRESS' ? null : 'IN_PROGRESS')}
          >
            <div className={styles.statIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 3.5c.5.3 1 .65 1.43 1.05" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{allTickets.filter(t => t.status === 'IN_PROGRESS').length}</span>
              <span className={styles.statLabel}>Em andamento</span>
            </div>
            <div className={styles.statAccent} />
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardResolved} ${selectedStatus === 'RESOLVED' ? styles.statCardSelected : ''}`}
            onClick={() => setSelectedStatus(prev => prev === 'RESOLVED' ? null : 'RESOLVED')}
          >
            <div className={styles.statIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{allTickets.filter(t => t.status === 'RESOLVED').length}</span>
              <span className={styles.statLabel}>Resolvidos</span>
            </div>
            <div className={styles.statAccent} />
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardClosed} ${selectedStatus === 'CLOSED' ? styles.statCardSelected : ''}`}
            onClick={() => setSelectedStatus(prev => prev === 'CLOSED' ? null : 'CLOSED')}
          >
            <div className={styles.statIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div className={styles.statBody}>
              <span className={styles.statValue}>{allTickets.filter(t => t.status === 'CLOSED').length}</span>
              <span className={styles.statLabel}>Encerrados</span>
            </div>
            <div className={styles.statAccent} />
          </div>

        </div>

        {/* ── Abas ── */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${filter === 'mine' ? styles.tabActive : ''}`} onClick={() => changeFilter('mine')}>Para mim</button>
          <button className={`${styles.tab} ${filter === 'sector' ? styles.tabActive : ''}`} onClick={() => changeFilter('sector')}>Meu setor</button>
          <button className={`${styles.tab} ${filter === 'created' ? styles.tabActive : ''}`} onClick={() => changeFilter('created')}>Abertos por mim</button>
          {user?.role === 'ADMIN' && (
            <button className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`} onClick={() => changeFilter('all')}>Todos</button>
          )}
        </div>

        {/* ── Lista de tickets ── */}
        <div className={styles.tabContent}>

          {loadingList ? (
            <p className={styles.emptyMsg}>Carregando tickets…</p>
          ) : visibleTickets.length === 0 ? (
            <p className={styles.emptyMsg}>Nenhum ticket encontrado.</p>
          ) : (
            <>
              <p className={styles.countMsg}>{visibleTickets.length} ticket{visibleTickets.length !== 1 ? 's' : ''} encontrado{visibleTickets.length !== 1 ? 's' : ''}</p>

              <ul className={styles.list}>
                {visibleTickets.map(ticket => (
                  <li key={ticket.id} className={styles.card} onClick={() => navigate(`/tickets/ticketDetail/${ticket.id}`)}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardTitle}>{ticket.title}</span>
                      <span className={`${styles.statusBadge} ${STATUS_CLASS[ticket.status]}`}>
                        {STATUS_LABEL[ticket.status]}
                      </span>
                    </div>

                    <p className={styles.cardDesc}>{ticket.description}</p>

                    <div className={styles.cardMeta}>
                      <span>Por <strong>{ticket.createdBy.name}</strong></span>
                      {ticket.department && <span>→ {ticket.department}</span>}
                      {ticket.assignedTo && <span>→ {ticket.assignedTo.name}</span>}
                      <span className={styles.cardDate}>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* ── Paginação ── */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 0}
                  >
                    ← Anterior
                  </button>

                  <span className={styles.pageInfo}>
                    Página {page + 1} de {totalPages}
                  </span>

                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </main>

      {/* ── Modal novo ticket ── */}
      {openModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Novo ticket</h2>
              <button onClick={closeModal} className={styles.closeBtn} disabled={saving}>✕</button>
            </div>

            <div className={styles.form}>

              <div className={styles.field}>
                <label className={styles.label}>Título <span className={styles.required}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Resumo do problema ou solicitação"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Descrição <span className={styles.required}>*</span></label>
                <textarea
                  className={styles.textarea}
                  placeholder="Descreva com detalhes o que precisa ser resolvido..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Departamento</label>
                <select
                  value={departamento}
                  onChange={e => setDepartamento(e.target.value)}
                  className={styles.select}
                  disabled={saving}
                >
                  <option value="">Selecione um departamento...</option>
                  <option value="TI">TI</option>
                  <option value="RH">RH</option>
                  <option value="DP">DP</option>
                  <option value="OPERACAO">Operação</option>
                </select>
              </div>

              <div className={styles.divider}>ou direcionar para uma pessoa</div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Pessoa <span className={styles.optional}>(opcional)</span>
                </label>
                <select
                  value={pessoa}
                  onChange={e => setPessoa(e.target.value)}
                  className={styles.select}
                  disabled={saving}
                >
                  <option value="">Selecione uma pessoa...</option>
                  {allUsers
                    .filter(u => u.email !== user?.sub)
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))
                  }
                </select>
              </div>

              {user?.role === "ADMIN" && (
                <>
                  <div className={styles.divider}>Representando outro usuário</div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Solicitante <span className={styles.optional}>(opcional)</span>
                    </label>
                    <select
                      value={solicitante}
                      onChange={e => setSolicitante(e.target.value)}
                      className={styles.select}
                      disabled={saving}
                    >
                      <option value="">Selecione uma pessoa...</option>
                      {allUsers
                        .filter(u => u.email !== user?.sub)
                        .map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </>
              )}

              <p className={styles.hint}>
                Informe ao menos um destino — departamento, pessoa, ou ambos.
              </p>

              {/* ── Anexos ── */}
              <div className={styles.field}>
                <label className={styles.label}>Anexos <span className={styles.optional}>(opcional)</span></label>

                <div className={styles.uploadOptions}>
                  {/* Selecionar arquivo */}
                  <label className={styles.uploadOption}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={styles.uploadOptionTitle}>Selecionar arquivo</span>
                    <input type="file" className={styles.fileInput} multiple
                      onChange={e => addFiles(e.target.files)} disabled={saving} />
                  </label>

                  <div className={styles.uploadDivider} />

                  {/* Câmera */}
                  <label className={styles.uploadOption}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span className={styles.uploadOptionTitle}>Tirar foto</span>
                    <input type="file" className={styles.fileInput} accept="image/*" capture="environment"
                      onChange={e => addFiles(e.target.files)} disabled={saving} />
                  </label>
                </div>

                {/* Lista de arquivos selecionados */}
                {pendingFiles.length > 0 && (
                  <ul className={styles.fileList}>
                    {pendingFiles.map((file, i) => (
                      <li key={i} className={styles.fileItem}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.fileName}>{file.name}</span>
                        <button type="button" className={styles.fileRemove}
                          onClick={() => removeFile(i)} disabled={saving}>✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {modalError && <p className={styles.errorMsg}>{modalError}</p>}

              <div className={styles.footer}>
                <button onClick={closeModal} className={styles.cancelBtn} disabled={saving}>Cancelar</button>
                <button onClick={handleSendForm} className={styles.submitBtn} disabled={saving}>
                  {saving ? 'Abrindo…' : 'Abrir ticket'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
