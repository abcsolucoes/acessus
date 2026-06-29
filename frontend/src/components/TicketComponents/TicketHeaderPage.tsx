import styles from "../../pages/Tickets/style.module.css"

type Props = {
  onNewTicketClick: () => void
}


export function TicketHeaderPage({ onNewTicketClick }: Props) {
  return (
    <div className={styles.top}>
      <h1 className={styles.title}>Tickets</h1>
      <button onClick={onNewTicketClick} className={styles.newBtn}>+ Novo ticket</button>
    </div>
  )
}
