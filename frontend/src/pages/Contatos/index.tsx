import { useEffect, useState } from "react"
import { apiFetch, authHeaders, decodeToken } from "../../services/api"

import type { Contact } from "../../types"
import { Header } from "../../components/Header"
import { ContactModal } from "./ContactModal"
import styles from './style.module.css'

const SYNC_AUTORIZADOS = [
  'guilherme.lima@solucoesabc.com.br',
  'gabriel.silva@solucoesabc.com.br',
  'gabriel.oliveira@solucoesabc.com.br',
]

function waNumero(telephone: string): string {
  const digits = telephone.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function ContatosPage() {
  const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [modalData, setModalData] = useState<Contact | 'new' | null>(null)
  const [waContact, setWaContact] = useState<Contact | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  useEffect(() => {
    function onScroll() { setShowScrollTop(window.scrollY > 300) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setUser(decodeToken())

    async function load() {
      try {
        const data = await apiFetch<Contact[]>('/contacts', {
          headers: authHeaders(),
        })

        setContacts(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleSync() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const msg = await apiFetch<string>('/contacts/sync-linhas-vivo', {
        method: 'POST',
        headers: authHeaders(),
      })
      setSyncMsg(msg)
      // Recarrega contatos após sync
      const data = await apiFetch<Contact[]>('/contacts', { headers: authHeaders() })
      setContacts(data)
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : 'Erro ao sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  async function handleDelete(resourceName: string) {
    await apiFetch(`/contacts/${resourceName}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    setContacts(prev => prev.filter(c => c.resourceName !== resourceName))
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingScreen}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Carregando Contatos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header moduleName="Contatos" userName={user?.name ?? ''} />

      <main className={styles.main}>

        {/* ── Topo ── */}
        <div className={styles.top}>
          <h1 className={styles.title}>Contatos</h1>
          <div className={styles.topActions}>
            {user && SYNC_AUTORIZADOS.includes(user.sub) && (
              <button
                className={styles.syncBtn}
                onClick={handleSync}
                disabled={syncing}
                title="Sincronizar contatos da planilha Linhas Vivo"
              >
                {syncing ? 'Sincronizando...' : '⟳ Sincronizar Linhas Vivo'}
              </button>
            )}
            <button className={styles.addBtn} onClick={() => setModalData('new')}>
              + Novo contato
            </button>
          </div>
        </div>

        {syncMsg && (
          <p className={styles.syncMsg}>{syncMsg}</p>
        )}

        {/* ── Barra de busca ── */}
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Buscar por nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Lista de contatos ── */}
        {filtered.length === 0 ? (
          <p className={styles.empty}>Nenhum contato encontrado.</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map(c => (
              <div key={c.resourceName} className={styles.card}>

                <div className={styles.avatar}>
                  {c.name.charAt(0).toUpperCase()}
                </div>

                <div className={styles.cardBody}>
                  <span className={styles.cardName}>{c.name}</span>
                  <span className={styles.cardDetail}>{c.telephone}</span>
                  <span className={styles.cardDetail}>{c.email}</span>
                </div>

                <div className={styles.cardActions}>
                  {c.telephone && (
                    <a
                      className={styles.waBtn}
                      href={`https://wa.me/${waNumero(c.telephone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir no WhatsApp"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.42A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.073-1.117l-.292-.173-3.032.865.867-3.003-.19-.307A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8zm4.406-5.932c-.242-.121-1.43-.706-1.652-.786-.22-.08-.382-.12-.543.12-.16.242-.624.786-.765.947-.14.162-.281.182-.523.061-.242-.121-1.02-.376-1.942-1.197-.718-.64-1.202-1.43-1.343-1.671-.14-.242-.015-.373.106-.493.109-.108.242-.282.363-.423.12-.14.16-.242.242-.403.08-.161.04-.302-.02-.423-.061-.12-.543-1.31-.744-1.794-.196-.471-.396-.407-.543-.415l-.463-.008a.888.888 0 00-.644.302c-.221.242-.845.826-.845 2.015s.865 2.337.986 2.498c.12.16 1.702 2.6 4.126 3.646.576.249 1.026.397 1.376.508.578.184 1.105.158 1.521.096.464-.069 1.43-.585 1.631-1.15.2-.564.2-1.047.14-1.148-.06-.1-.221-.161-.463-.282z" />
                      </svg>
                    </a>
                  )}
                  <button className={styles.editBtn} onClick={() => setModalData(c)}>
                    Editar
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(c.resourceName)}>
                    Excluir
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Botão voltar ao topo ── */}
      <button
        className={`${styles.scrollTopBtn} ${showScrollTop ? styles.scrollTopVisible : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Voltar ao topo"
      >
        ↑
      </button>

      {/* ── Modal de criar/editar contato ── */}
      {modalData !== null && (
        <ContactModal
          initial={modalData === 'new' ? null : modalData}
          contacts={contacts}
          onClose={() => setModalData(null)}
          onSuccess={(contact, isEdit) => {
            isEdit
              ? setContacts(prev => prev.map(c => c.resourceName === contact.resourceName ? contact : c))
              : setContacts(prev => [...prev, contact])
            setModalData(null)
            if (!isEdit) setWaContact(contact)
          }}
        />
      )}

      {/* ── Modal WhatsApp pós-criação ── */}
      {waContact && (
        <div className={styles.waOverlay} onClick={() => setWaContact(null)}>
          <div className={styles.waModal} onClick={e => e.stopPropagation()}>

            <div className={styles.waIcon}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="22" fill="#25D366" />
                <path d="M22 8C14.268 8 8 14.268 8 22c0 2.538.686 4.918 1.882 6.962L8 36l7.22-1.854A13.94 13.94 0 0022 36c7.732 0 14-6.268 14-14S29.732 8 22 8zm7.3 19.77c-.32-.16-1.9-.938-2.195-1.044-.295-.107-.51-.16-.724.16-.215.32-.83 1.044-1.018 1.258-.187.215-.375.24-.695.08-.32-.16-1.35-.498-2.572-1.588-.95-.848-1.593-1.895-1.78-2.215-.187-.32-.02-.493.14-.652.145-.143.32-.375.48-.562.16-.188.213-.32.32-.535.107-.214.053-.401-.027-.562-.08-.16-.724-1.742-.991-2.384-.261-.626-.527-.54-.724-.55l-.616-.01a1.18 1.18 0 00-.856.4c-.294.32-1.124 1.099-1.124 2.68s1.151 3.108 1.311 3.322c.16.214 2.266 3.46 5.49 4.851.767.33 1.366.528 1.833.676.77.245 1.47.21 2.024.127.617-.092 1.9-.777 2.168-1.527.267-.75.267-1.393.187-1.527-.08-.133-.294-.214-.615-.374z" fill="white" />
              </svg>
            </div>

            <h3 className={styles.waTitle}>Contato cadastrado!</h3>
            <p className={styles.waMessage}>
              Deseja iniciar uma conversa com <strong>{waContact.name}</strong> no WhatsApp?
            </p>
            {waContact.telephone && (
              <p className={styles.waPhone}>{waContact.telephone}</p>
            )}

            <div className={styles.waFooter}>
              <button className={styles.waSkipBtn} onClick={() => setWaContact(null)}>
                Agora não
              </button>
              {waContact.telephone && (
                <a
                  className={styles.waOpenBtn}
                  href={`https://wa.me/${waNumero(waContact.telephone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWaContact(null)}
                >
                  Abrir no WhatsApp
                </a>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
