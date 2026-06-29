import type { Ticket } from "../../types"
import styles from "../../pages/Tickets/style.module.css"

type Props = {
  allTickets: Ticket[];
  onStatusClick: (status: string) => void;
  selectedStatus: string | null
}


export function TicketCards({ onStatusClick, selectedStatus, allTickets }: Props) {
  return (
    <div className={styles.statsGrid}>

      <div
        className={`${styles.statCard} ${styles.statCardOpen} ${selectedStatus === 'OPEN' ? styles.statCardSelected : ''}`}
        data-status="OPEN"
        onClick={() => onStatusClick('OPEN')}
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
          <span className={styles.statValue}>{allTickets.filter(ticket => ticket.status === "OPEN").length}</span>
          <span className={styles.statLabel}>Abertos</span>
        </div>
        <div className={styles.statAccent} />
      </div>

      <div
        className={`${styles.statCard} ${styles.statCardInProgress} ${selectedStatus === 'IN_PROGRESS' ? styles.statCardSelected : ''}`}
        onClick={() => onStatusClick('IN_PROGRESS')}
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
        onClick={() => onStatusClick('RESOLVED')}

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
        onClick={() => onStatusClick('CLOSED')}
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
  )
}
