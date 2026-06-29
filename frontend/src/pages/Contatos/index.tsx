import { useState } from "react"

import type { Contact } from "../../types"
import { Header } from "../../components/Header"
import { ContactModal } from "./ContactModal"
import styles from './style.module.css'
import { ContatosHeaderPage } from "../../components/ContatosComponents/ContatosHeaderPage"
import { ContatosSearchBar } from "../../components/ContatosComponents/ContatosSearchBar"
import { ContatosList } from "../../components/ContatosComponents/ContatosList"
import { ContatosWaModal } from "../../components/ContatosComponents/ContatosWaModal"
import { useContatosPage } from "../../hooks/ContatosHooks/useContatosPage"

export function ContatosPage() {
  const [search, setSearch] = useState('')
  const [modalData, setModalData] = useState<Contact | 'new' | null>(null)
  const [waContact, setWaContact] = useState<Contact | null>(null)

  const {
    handleDelete,
    user,
    contacts,
    showScrollTop,
    loading,
    setContacts
  } = useContatosPage();

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
        <ContatosHeaderPage
          setModalData={setModalData}
        />

        {/* ── Barra de busca ── */}
        <ContatosSearchBar
          search={search}
          setSearch={setSearch}
        />

        {/* ── Lista de contatos ── */}
        <ContatosList
          filtered={filtered}
          setModalData={setModalData}
          onDelete={handleDelete}
        />
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
      <ContatosWaModal
        setWaContact={setWaContact}
        waContact={waContact}
      />
    </>
  )
}
