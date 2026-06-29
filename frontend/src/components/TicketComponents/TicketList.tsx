import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import type { Ticket } from "../../types"
import styles from "../../pages/Tickets/style.module.css"

type Props = {
    loadingList: boolean;
    visibleTickets: Ticket[];
    totalPages: number;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
}

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

export function TicketList({ loadingList, visibleTickets, totalPages, page, setPage }: Props) {
    const navigate = useNavigate()

    return (
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
    )
}
