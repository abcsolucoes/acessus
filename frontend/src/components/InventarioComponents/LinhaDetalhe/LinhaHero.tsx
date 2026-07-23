import type { Line, LineStatus } from "../../../types"
import styles from "./LinhaHero.module.css"

const STATUS_LABEL: Record<LineStatus, string> = {
    IN_USE: 'Em uso',
    AVAILABLE: 'Disponível',
    REACTIVATE: 'Reativar',
    UNAVAILABLE: 'Indisponível',
}

const STATUS_CLASS: Record<LineStatus, string> = {
    IN_USE: styles.badgeSuccess,
    AVAILABLE: styles.badgeNeutral,
    REACTIVATE: styles.badgeWarning,
    UNAVAILABLE: styles.badgeDanger,
}

function LineIcon() {
    return <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
}

type Props = { linha: Line }

export function LinhaHero({ linha }: Props) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroLeft}>
                <span className={styles.avatar}><LineIcon /></span>
                <div className={styles.heroInfo}>
                    <h1 className={styles.name}>{linha.number}</h1>
                    <span className={styles.roleLine}>Linha corporativa</span>
                    <div className={styles.badgeRow}>
                        <span className={`${styles.badge} ${STATUS_CLASS[linha.status]}`}>{STATUS_LABEL[linha.status]}</span>
                        {linha.iccid && <span className={styles.companyMeta}>Chip {linha.iccid}</span>}
                    </div>
                </div>
            </div>
        </section>
    )
}
