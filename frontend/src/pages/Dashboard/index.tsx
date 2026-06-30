import { DashboardModuleNav } from '../../components/DashboardModuleNav'
import type { UserRole } from '../../components/DashboardModuleNav'
import { Header } from '../../components/Header'
import styles from './style.module.css'
import { DashboardHeaderPage } from '../../components/DashboardComponents/DashboardHeaderPage'
import { DashboardBanner } from '../../components/DashboardComponents/DashboardBanner'
import { DashboardModulesCards } from '../../components/DashboardComponents/DashboardModulesCards'
import { DashboardRecentActions } from '../../components/DashboardComponents/DashboardRecentActions'
import { DashboardTipCard } from '../../components/DashboardComponents/DashboardTipCard'
import { TicketModal } from '../../components/TicketComponents/TicketModal'
import { useState } from 'react'
import { useTicketsPage } from '../../hooks/TicketHooks/useTicketsPage'
import { Toast } from '../../components/Toast'
import { ContactModal } from '../Contatos/ContactModal'
import { useDashboardPage } from '../../hooks/DashboardHooks/useDashboardPage'

export function DashboardPage() {
  const {
    user,
    allUsers,
    filter,
    setPage,
    fetchTickets,
  } = useTicketsPage()


  const { logs } = useDashboardPage();
  console.log(logs)

  const userName = user?.name ?? 'Usuario'
  const firstName = userName.split(' ')[0] || 'Usuario'
  const role = (user?.role ?? 'OPERACIONAL') as UserRole
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [contatoModalOpen, setContatoModalOpen] = useState(false)


  async function handleTicketCreated() {
    setPage(0)
    await fetchTickets(0, filter)
    setToast('Ticket aberto com sucesso!')
  }

  return (
    <>
      <Header moduleName="Dashboard" userName={userName} />

      {toast && (
        <Toast message={toast} onClose={() => setToast('')} />
      )}

      <main className={styles.page}>
        <div className={styles.shell}>
          <DashboardModuleNav role={role} />

          <div className={styles.content}>
            <DashboardHeaderPage
              firstName={firstName}
            />

            <DashboardBanner />

            <DashboardModulesCards
              onOpenTicketModal={() => setModalOpen(true)}
              onOpenContatosModal={() => setContatoModalOpen(true)}
            />

            <div className={styles.bottomRow}>
              <DashboardRecentActions />
              <DashboardTipCard />
            </div>
          </div>
        </div>
      </main>

      <TicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleTicketCreated}
        allUsers={allUsers}
        user={user}
      />


      {contatoModalOpen && (
        <ContactModal
          initial={null}
          contacts={[]}
          onClose={() => setContatoModalOpen(false)}
          onSuccess={() => setContatoModalOpen(false)}
        />
      )}
    </>
  )
}
