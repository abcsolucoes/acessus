import styles from "../../../pages/Inventario/Linhas/style.module.css"

type Props = {
    emUso: number
    disponiveis: number
}

export function ResumoLinhas({ emUso, disponiveis }: Props) {
    return (
        <div className={styles.summaryRow}>
            <div className={`${styles.summaryCard} ${styles.summarySuccess}`}>
                <span className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </span>
                <div>
                    <div className={styles.summaryValue}>{emUso}</div>
                    <div className={styles.summaryLabel}>linhas em uso</div>
                </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.summaryNeutral}`}>
                <span className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24"><line x1="4" y1="20" x2="4" y2="16" /><line x1="10" y1="20" x2="10" y2="12" /><line x1="16" y1="20" x2="16" y2="8" /><line x1="22" y1="20" x2="22" y2="4" /></svg>
                </span>
                <div>
                    <div className={styles.summaryValue}>{disponiveis}</div>
                    <div className={styles.summaryLabel}>linhas disponíveis</div>
                </div>
            </div>
        </div>
    )
}
