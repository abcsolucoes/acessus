import { useEffect, useRef, useState } from "react"
import { Header } from "../../components/Header"
import styles from './style.module.css'
import { apiFetch, authHeaders, decodeToken } from "../../services/api"
import type { User, Department } from "../../types"

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  RH: 'RH',
  OPERACIONAL: 'Operacional',
  DP: 'DP',
}

const ROLE_MAP: Record<string, string> = {
  ADMIN: 'roleAdmin',
  RH: 'roleRh',
  OPERACIONAL: 'roleOperacional',
  DP: 'roleDp',
}

// ── Tipos de modal ────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'none' }
  | { type: 'invite' }
  | { type: 'edit'; user: User }
  | { type: 'role'; user: User }
  | { type: 'delete'; user: User }

// ── Componente ────────────────────────────────────────────────────────────────

export function ConfiguracoesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; sub: string } | null>(null)
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [openMenu, setOpenMenu] = useState<number | null>(null) // id do card com menu aberto
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Campos do modal de convite
  const [inviteName, setInviteName]           = useState('')
  const [inviteEmail, setInviteEmail]         = useState('')
  const [inviteRole, setInviteRole]           = useState('')
  const [inviteDepartment, setInviteDepartment] = useState<Department | ''>('')

  // Campos do modal de edição
  const [editName, setEditName]               = useState('')
  const [editEmail, setEditEmail]             = useState('')
  const [editDepartment, setEditDepartment]   = useState<Department | ''>('')

  // Campo do modal de alterar role
  const [newRole, setNewRole] = useState('')

  const menuRef = useRef<HTMLDivElement>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  // ── Auth + carga inicial ──────────────────────────────────────────────────
  useEffect(() => {
    setCurrentUser(decodeToken())
    loadUsers()
  }, [])

  // Fecha menu ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function loadUsers() {
    try {
      const data = await apiFetch<User[]>('/users', { headers: authHeaders() })
      setUsers(data)
    } catch {
      // apiFetch já redireciona em caso de 401
    }
  }

  // ── Abrir modais ──────────────────────────────────────────────────────────
  function openEdit(u: User) {
    setEditName(u.name)
    setEditEmail(u.email)
    setEditDepartment(u.department ?? '')
    setError('')
    setModal({ type: 'edit', user: u })
    setOpenMenu(null)
  }

  function openRole(u: User) {
    setNewRole(u.role)
    setError('')
    setModal({ type: 'role', user: u })
    setOpenMenu(null)
  }

  function openDelete(u: User) {
    setError('')
    setModal({ type: 'delete', user: u })
    setOpenMenu(null)
  }

  function openInvite() {
    setInviteName(''); setInviteEmail(''); setInviteRole(''); setInviteDepartment('')
    setError('')
    setModal({ type: 'invite' })
  }

  function closeModal() {
    setModal({ type: 'none' })
    setError('')
    setLoading(false)
  }

  // ── Ações ─────────────────────────────────────────────────────────────────
  async function handleInvite() {
    if (!inviteName.trim()) { setError('Informe o nome completo'); return }
    if (!inviteEmail.trim()) { setError('Informe o e-mail'); return }
    if (!inviteRole) { setError('Selecione um perfil de acesso'); return }

    setError(''); setLoading(true)
    try {
      await apiFetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole, department: inviteDepartment || null }),
      })
      closeModal()
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar convite')
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit() {
    if (modal.type !== 'edit') return
    if (!editName.trim()) { setError('Informe o nome'); return }
    if (!editEmail.trim()) { setError('Informe o e-mail'); return }

    setError(''); setLoading(true)
    try {
      const updated = await apiFetch<User>(`/users/${modal.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: editName, email: editEmail, department: editDepartment || null }),
      })
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar usuário')
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange() {
    if (modal.type !== 'role') return

    setError(''); setLoading(true)
    try {
      const updated = await apiFetch<User>(`/users/${modal.user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ role: newRole }),
      })
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar perfil')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (modal.type !== 'delete') return

    setError(''); setLoading(true)
    try {
      await apiFetch<void>(`/users/${modal.user.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      setUsers(prev => prev.filter(u => u.id !== modal.user.id))
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(u: User) {
    setOpenMenu(null)
    try {
      const updated = await apiFetch<User>(`/users/${u.id}/toggle`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x))
      showToast(updated.enabled ? 'Usuário ativado' : 'Usuário desativado')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao alterar status', 'error')
    }
  }

  async function handleResendInvite(u: User) {
    setOpenMenu(null)
    try {
      await apiFetch<void>(`/users/${u.id}/resend-invite`, {
        method: 'POST',
        headers: authHeaders(),
      })
      showToast(`Convite reenviado para ${u.email}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao reenviar convite', 'error')
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header moduleName="Configurações" userName={currentUser?.name ?? ''} />

      <main className={styles.main}>

        {/* Topo */}
        <div className={styles.top}>
          <h1 className={styles.title}>Usuários</h1>
          {isAdmin && (
            <button onClick={openInvite} className={styles.inviteBtn}>
              + Convidar usuário
            </button>
          )}
        </div>

        {/* Lista */}
        <div className={styles.list} ref={menuRef}>
          {users.map(u => (
            <div key={u.id} className={styles.card}>

              {/* Avatar */}
              <div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div>

              {/* Info */}
              <div className={styles.cardBody}>
                <span className={styles.cardName}>{u.name}</span>
                <span className={styles.cardEmail}>{u.email}</span>
              </div>

              {/* Role */}
              <span className={`${styles.roleBadge} ${styles[ROLE_MAP[u.role] ?? '']}`}>
                {ROLE_LABEL[u.role] ?? u.role}
              </span>

              {/* Status */}
              <span className={`${styles.statusBadge} ${u.enabled ? styles.statusAtivo : styles.statusPendente}`}>
                {u.enabled ? 'Ativo' : 'Pendente'}
              </span>

              {/* Menu de ações — só para ADMIN */}
              {isAdmin && (
                <div className={styles.actionWrapper}>
                  <button
                    className={styles.menuBtn}
                    onClick={() => setOpenMenu(prev => prev === u.id ? null : u.id)}
                    aria-label="Ações"
                  >
                    ···
                  </button>

                  {openMenu === u.id && (
                    <div className={styles.dropdownMenu}>

                      <button className={styles.dropdownItem} onClick={() => openEdit(u)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar dados
                      </button>

                      <button className={styles.dropdownItem} onClick={() => openRole(u)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                        Alterar perfil
                      </button>

                      <button className={styles.dropdownItem} onClick={() => handleToggle(u)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="5" width="22" height="14" rx="7" />
                          <circle cx={u.enabled ? 17 : 7} cy="12" r="3" fill="currentColor" />
                        </svg>
                        {u.enabled ? 'Desativar' : 'Ativar'}
                      </button>

                      {!u.enabled && (
                        <button className={styles.dropdownItem} onClick={() => handleResendInvite(u)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                          </svg>
                          Reenviar convite
                        </button>
                      )}

                      {/* Não pode excluir a si mesmo */}
                      {String(u.id) !== currentUser?.sub && (
                        <>
                          <div className={styles.dropdownDivider} />
                          <button
                            className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                            onClick={() => openDelete(u)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                            Excluir
                          </button>
                        </>
                      )}

                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>

      </main>

      {/* ── Modal de convite ────────────────────────────────────────────────── */}
      {modal.type === 'invite' && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Convidar usuário</h2>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nome completo</label>
                <input className={styles.input} type="text" placeholder="Ex: João Silva"
                  value={inviteName} onChange={e => setInviteName(e.target.value)} disabled={loading} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>E-mail</label>
                <input className={styles.input} type="email" placeholder="joao@empresa.com"
                  value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} disabled={loading} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Perfil de acesso</label>
                <select className={styles.select} value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)} disabled={loading}>
                  <option value="">Selecione...</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="RH">RH</option>
                  <option value="OPERACIONAL">Operacional</option>
                  <option value="DP">DP</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Departamento</label>
                <select className={styles.select} value={inviteDepartment}
                  onChange={e => setInviteDepartment(e.target.value as Department | '')} disabled={loading}>
                  <option value="">Selecione...</option>
                  <option value="TI">TI</option>
                  <option value="RH">RH</option>
                  <option value="DP">DP</option>
                  <option value="OPERACAO">Operação</option>
                </select>
              </div>
              <p className={styles.hint}>Um e-mail de ativação será enviado para o usuário definir sua senha.</p>
              {error && <p className={styles.formError}>{error}</p>}
              <div className={styles.footer}>
                <button className={styles.cancelBtn} onClick={closeModal} disabled={loading}>Cancelar</button>
                <button className={styles.submitBtn} onClick={handleInvite} disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar convite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de edição ─────────────────────────────────────────────────── */}
      {modal.type === 'edit' && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar usuário</h2>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nome completo</label>
                <input className={styles.input} type="text" placeholder="Nome"
                  value={editName} onChange={e => setEditName(e.target.value)} disabled={loading} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>E-mail</label>
                <input className={styles.input} type="email" placeholder="email@empresa.com"
                  value={editEmail} onChange={e => setEditEmail(e.target.value)} disabled={loading} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Departamento</label>
                <select className={styles.select} value={editDepartment}
                  onChange={e => setEditDepartment(e.target.value as Department | '')} disabled={loading}>
                  <option value="">Sem departamento</option>
                  <option value="TI">TI</option>
                  <option value="RH">RH</option>
                  <option value="DP">DP</option>
                  <option value="OPERACAO">Operação</option>
                </select>
              </div>
              {error && <p className={styles.formError}>{error}</p>}
              <div className={styles.footer}>
                <button className={styles.cancelBtn} onClick={closeModal} disabled={loading}>Cancelar</button>
                <button className={styles.submitBtn} onClick={handleEdit} disabled={loading}>
                  {loading ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de alterar perfil ──────────────────────────────────────────── */}
      {modal.type === 'role' && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Alterar perfil</h2>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Usuário</label>
                <input className={styles.input} type="text" value={modal.user.name} disabled />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Novo perfil</label>
                <select className={styles.select} value={newRole}
                  onChange={e => setNewRole(e.target.value)} disabled={loading}>
                  <option value="ADMIN">Administrador</option>
                  <option value="RH">RH</option>
                  <option value="OPERACIONAL">Operacional</option>
                  <option value="DP">DP</option>
                </select>
              </div>
              {error && <p className={styles.formError}>{error}</p>}
              <div className={styles.footer}>
                <button className={styles.cancelBtn} onClick={closeModal} disabled={loading}>Cancelar</button>
                <button className={styles.submitBtn} onClick={handleRoleChange} disabled={loading}>
                  {loading ? 'Salvando…' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de confirmação de exclusão ────────────────────────────────── */}
      {modal.type === 'delete' && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Excluir usuário</h2>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.form}>
              <p className={styles.confirmText}>
                Tem certeza que deseja excluir <strong>{modal.user.name}</strong>?
                <br />Esta ação não pode ser desfeita.
              </p>
              {error && <p className={styles.formError}>{error}</p>}
              <div className={styles.footer}>
                <button className={styles.cancelBtn} onClick={closeModal} disabled={loading}>Cancelar</button>
                <button className={styles.dangerBtn} onClick={handleDelete} disabled={loading}>
                  {loading ? 'Excluindo…' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}

    </>
  )
}
