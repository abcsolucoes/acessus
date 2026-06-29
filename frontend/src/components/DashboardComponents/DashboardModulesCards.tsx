import { useNavigate } from "react-router-dom"
import styles from "../../pages/Dashboard/style.module.css"

type ActionItem = {
    title: string
    description: string
    icon: 'ticket' | 'search' | 'contact' | 'book'
    path?: string
    action?: 'openTicket' | 'openContatos'
}

const ticketActions: ActionItem[] = [
    { title: 'Abrir novo ticket', description: 'Registre uma nova solicitacao', icon: 'ticket', action: 'openTicket' },
    { title: 'Buscar tickets', description: 'Encontre solicitacoes rapidamente', path: '/tickets', icon: 'search' },
]

const contactActions: ActionItem[] = [
    { title: 'Adicionar contato', description: 'Cadastre um novo contato', icon: 'contact', action: 'openContatos' },
    { title: 'Consultar contatos', description: 'Acesse a agenda corporativa', path: '/contatos', icon: 'book' },
]

function ActionIcon({ type }: { type: ActionItem['icon'] }) {
    if (type === 'search') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 4 4" />
            </svg>
        )
    }

    if (type === 'contact') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 19v-1a4 4 0 0 0-8 0v1" />
                <circle cx="12" cy="8" r="3" />
                <path d="M19 8v6" />
                <path d="M22 11h-6" />
            </svg>
        )
    }

    if (type === 'book') {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Z" />
                <path d="M8 17h10" />
                <path d="M9 8h5" />
                <path d="M9 12h4" />
            </svg>
        )
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3Z" />
            <path d="M9 9h6" />
            <path d="M9 15h6" />
        </svg>
    )
}

type Props = {
    onOpenTicketModal: () => void
    onOpenContatosModal: () => void
}

export function DashboardModulesCards({ onOpenTicketModal, onOpenContatosModal }: Props) {
    const navigate = useNavigate()

    function handleActionClick(action: ActionItem) {
        if (action.action === 'openTicket') {
            onOpenTicketModal()
            return
        }

        if (action.action === 'openContatos') {
            onOpenContatosModal()
            return
        }

        if (action.path) {
            navigate(action.path)
        }
    }

    return (
        <section className={styles.modules} aria-label="Modulos principais">
            <article className={styles.moduleCard}>
                <div className={styles.moduleHeader}>
                    <span className={`${styles.moduleIcon} ${styles.ticketIcon}`}>
                        <ActionIcon type="ticket" />
                    </span>
                    <span className={styles.moduleText}>
                        <strong>Tickets</strong>
                        <small>Abra, acompanhe e resolva solicitacoes de forma rapida e organizada.</small>
                        <button type="button" className={styles.moduleLink} onClick={() => navigate('/tickets')}>
                            Acessar modulo
                        </button>
                    </span>
                </div>

                <div className={styles.moduleActions}>
                    {ticketActions.map((action) => (
                        <button
                            key={action.title}
                            type="button"
                            className={styles.moduleAction}
                            onClick={() => handleActionClick(action)}
                        >
                            <span className={styles.actionIcon}>
                                <ActionIcon type={action.icon} />
                            </span>
                            <span>
                                <strong>{action.title}</strong>
                                <small>{action.description}</small>
                            </span>
                            <svg className={styles.rowArrow} viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    ))}
                </div>
            </article>

            <article className={styles.moduleCard}>
                <div className={styles.moduleHeader}>
                    <span className={`${styles.moduleIcon} ${styles.contactIcon}`}>
                        <ActionIcon type="contact" />
                    </span>
                    <span className={styles.moduleText}>
                        <strong>Contatos</strong>
                        <small>Visualize e gerencie os contatos da empresa em um so lugar.</small>
                        <button type="button" className={styles.moduleLink} onClick={() => navigate('/contatos')}>
                            Acessar modulo
                        </button>
                    </span>
                </div>

                <div className={styles.moduleActions}>
                    {contactActions.map((action) => (
                        <button
                            key={action.title}
                            type="button"
                            className={styles.moduleAction}
                            onClick={() => handleActionClick(action)}
                        >
                            <span className={styles.actionIcon}>
                                <ActionIcon type={action.icon} />
                            </span>
                            <span>
                                <strong>{action.title}</strong>
                                <small>{action.description}</small>
                            </span>
                            <svg className={styles.rowArrow} viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    ))}
                </div>
            </article>
        </section>
    )
}
