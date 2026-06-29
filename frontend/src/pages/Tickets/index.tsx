import { useState } from "react"
import { Header } from "../../components/Header"
import { Toast } from "../../components/Toast"
import styles from './style.module.css'
import { TicketCards } from "../../components/TicketComponents/TicketCards"
import { TicketTabs } from "../../components/TicketComponents/TicketTabs"
import { TicketHeaderPage } from "../../components/TicketComponents/TicketHeaderPage"
import { TicketList } from "../../components/TicketComponents/TicketList"
import { TicketModal } from "../../components/TicketComponents/TicketModal"
import { useTicketsPage } from "../../hooks/TicketHooks/useTicketsPage"

export function TicketsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  const {
    user,
    allUsers,
    filter,
    changeFilter,
    allTickets,
    visibleTickets,
    totalPages,
    page,
    setPage,
    loadingList,
    selectedStatus,
    toggleStatus,
    fetchTickets,
  } = useTicketsPage()

  async function handleTicketCreated() {
    setPage(0)
    await fetchTickets(0, filter)
    setToast('Ticket aberto com sucesso!')
  }

  return (
    <>
      <Header moduleName="Tickets" userName={user?.name ?? ""} />

      {toast && (
        <Toast message={toast} onClose={() => setToast('')} />
      )}

      <main className={styles.main}>
        <TicketHeaderPage onNewTicketClick={() => setModalOpen(true)} />

        <TicketCards
          allTickets={allTickets}
          onStatusClick={toggleStatus}
          selectedStatus={selectedStatus}
        />

        <TicketTabs
          filter={filter}
          onFilterChange={changeFilter}
          isAdmin={user?.role === 'ADMIN'}
        />

        <TicketList
          loadingList={loadingList}
          visibleTickets={visibleTickets}
          totalPages={totalPages}
          page={page}
          setPage={setPage}
        />
      </main>

      <TicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleTicketCreated}
        allUsers={allUsers}
        user={user}
      />
    </>
  )
}
