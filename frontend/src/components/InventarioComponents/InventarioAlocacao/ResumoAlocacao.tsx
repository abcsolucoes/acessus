import styles from "../../../pages/Inventario/Alocacao/style.module.css"

type Props = {
    semAparelho: number
    disponiveis: number
}

export function ResumoAlocacao({ semAparelho, disponiveis }: Props) {
    return (
        <div className={styles.summaryRow}>
            <div className={`${styles.summaryCard} ${styles.summaryWarning}`}>
                <span className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </span>
                <div>
                    <div className={styles.summaryValue}>{semAparelho}</div>
                    <div className={styles.summaryLabel}>funcionários sem aparelho</div>
                </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.summarySuccess}`}>
                <span className={styles.summaryIcon}>
                    <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                </span>
                <div>
                    <div className={styles.summaryValue}>{disponiveis}</div>
                    <div className={styles.summaryLabel}>aparelhos disponíveis</div>
                </div>
            </div>
        </div>
    )
}
