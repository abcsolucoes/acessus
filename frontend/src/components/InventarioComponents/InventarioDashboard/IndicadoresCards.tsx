import styles from "../../../pages/Inventario/style.module.css"
import type { FuncionariosIndicadores } from "../../../types"

type Props = {
    indicadores: FuncionariosIndicadores | undefined
}

export function IndicadoresCards({indicadores}:Props) {
    return (
        <div className={styles.bento}>
            <div className={styles.kpiTile}>
                <div className={styles.kpiTop}>
                    <span className={`${styles.kpiIcon} ${styles.kpiIconDefault}`}>
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </span>
                    <span className={`${styles.kpiDelta} ${styles.kpiDeltaUp}`}>
                        <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        4
                    </span>
                </div>
                <span className={styles.kpiValue}>{indicadores?.ativos}</span>
                <span className={styles.kpiLabel}>Funcionários ativos</span>
            </div>

            <div className={styles.kpiTile}>
                <div className={styles.kpiTop}>
                    <span className={`${styles.kpiIcon} ${styles.kpiIconDefault}`}>
                        <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                    </span>
                    <span className={`${styles.kpiDelta} ${styles.kpiDeltaUp}`}>
                        <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        9
                    </span>
                </div>
                <span className={styles.kpiValue}>154</span>
                <span className={styles.kpiLabel}>Aparelhos cadastrados</span>
            </div>

            <div className={styles.kpiTile}>
                <div className={styles.kpiTop}>
                    <span className={`${styles.kpiIcon} ${styles.kpiIconDanger}`}>
                        <svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="4" y1="4" x2="20" y2="20" /></svg>
                    </span>
                    <span className={`${styles.kpiDelta} ${styles.kpiDeltaDown}`}>
                        <svg viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
                        2
                    </span>
                </div>
                <span className={styles.kpiValue}>6</span>
                <span className={styles.kpiLabel}>Sem aparelho</span>
            </div>

            <div className={styles.kpiTile}>
                <div className={styles.kpiTop}>
                    <span className={`${styles.kpiIcon} ${styles.kpiIconSuccess}`}>
                        <svg viewBox="0 0 24 24"><path d="M16.5 9.4 7.5 4.2" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                    </span>
                    <span className={`${styles.kpiDelta} ${styles.kpiDeltaUp}`}>
                        <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        3
                    </span>
                </div>
                <span className={styles.kpiValue}>12</span>
                <span className={styles.kpiLabel}>Disponíveis p/ alocação</span>
            </div>

            <div className={styles.kpiTile}>
                <div className={styles.kpiTop}>
                    <span className={`${styles.kpiIcon} ${styles.kpiIconWarning}`}>
                        <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" /></svg>
                    </span>
                    <span className={`${styles.kpiDelta} ${styles.kpiDeltaFlatWarning}`}>
                        <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        1
                    </span>
                </div>
                <span className={styles.kpiValue}>{indicadores?.afastados}</span>
                <span className={styles.kpiLabel}>Afastados</span>
            </div>

            <div className={styles.kpiTile}>
                <div className={styles.kpiTop}>
                    <span className={`${styles.kpiIcon} ${styles.kpiIconDanger}`}>
                        <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                    </span>
                    <span className={`${styles.kpiDelta} ${styles.kpiDeltaUp}`}>
                        <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        1
                    </span>
                </div>
                <span className={styles.kpiValue}>2</span>
                <span className={styles.kpiLabel}>Demitidos c/ device</span>
            </div>

            <div className={styles.kpiTile}>
                <div className={styles.kpiTop}>
                    <span className={`${styles.kpiIcon} ${styles.kpiIconWarning}`}>
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </span>
                    <span className={`${styles.kpiDelta} ${styles.kpiDeltaFlatWarning}`}>
                        <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        2
                    </span>
                </div>
                <span className={styles.kpiValue}>3</span>
                <span className={styles.kpiLabel}>Em aviso c/ device</span>
            </div>

            <div className={styles.kpiTile}>
                <div className={styles.kpiTop}>
                    <span className={`${styles.kpiIcon} ${styles.kpiIconWarning}`}>
                        <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                    </span>
                    <span className={`${styles.kpiDelta} ${styles.kpiDeltaUp}`}>
                        <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        5
                    </span>
                </div>
                <span className={styles.kpiValue}>5</span>
                <span className={styles.kpiLabel}>Admitidos pendentes</span>
            </div>
        </div>
    )
}