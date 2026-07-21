import type { Device } from "../../../types"
import styles from "./AparelhoInfo.module.css"

type Props = { aparelho: Device }

export function AparelhoInfo({ aparelho }: Props) {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Informações</h2>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>ID Pulsus</span>
                    <span className={styles.infoValue}>{aparelho.pulsusId}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>TAG</span>
                    <span className={styles.infoValue}>{aparelho.tagDevice ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Serial</span>
                    <span className={styles.infoValue}>{aparelho.serialNumber ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Grupo</span>
                    <span className={styles.infoValue}>{aparelho.group ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>IMEI 1</span>
                    <span className={styles.infoValue}>{aparelho.imei1 ?? '—'}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>IMEI 2</span>
                    <span className={styles.infoValue}>{aparelho.imei2 ?? '—'}</span>
                </div>
            </div>
        </section>
    )
}
