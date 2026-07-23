import type { Line } from "../../../types"
import styles from "./LinhaInfo.module.css"

type Props = { linha: Line }

export function LinhaInfo({ linha }: Props) {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Informações</h2>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Número</span>
                    <span className={styles.infoValue}>{linha.number}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Chip (ICCID)</span>
                    <span className={styles.infoValue}>{linha.iccid ?? '—'}</span>
                </div>
            </div>

            {linha.notes && (
                <div className={styles.notesBox}>
                    <span className={styles.notesLabel}>Observações</span>
                    <p className={styles.notesText}>{linha.notes}</p>
                </div>
            )}
        </section>
    )
}
