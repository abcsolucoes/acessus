import { Link } from 'react-router-dom'
import styles from '../../pages/Dashboard/style.module.css'

export function DashboardTipCard() {
    return (
        <Link to="/ajuda" className={styles.tipCard}>
            <div className={styles.tipCardGlow} aria-hidden="true" />

            <div className={styles.tipCardIconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                </svg>
            </div>

            <div className={styles.tipCardBody}>
                <span className={styles.tipCardEyebrow}>Central de ajuda</span>
                <h3 className={styles.tipCardTitle}>Informativos &amp; Dicas</h3>
                <p className={styles.tipCardDesc}>
                    Guias, tutoriais e novidades do sistema para turbinar seu dia a dia.
                </p>
            </div>

            <div className={styles.tipCardArrow} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            </div>
        </Link>
    )
}
