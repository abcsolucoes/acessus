import styles from "../../../pages/Inventario/style.module.css"

export function Alertas() {
    return (
        <div className={styles.alerts}>
            <div className={`${styles.alertBanner} ${styles.alertDanger}`}>
                <span className={styles.alertIcon}>
                    <svg viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </span>
                <div className={styles.alertText}>
                    <span className={styles.alertTitle}>6 funcionários sem aparelho alocado</span>
                    <span className={styles.alertDesc}>Acesse <strong>Alocação</strong> para associar um aparelho disponível.</span>
                </div>
            </div>

            <div className={`${styles.alertBanner} ${styles.alertWarning}`}>
                <span className={styles.alertIcon}>
                    <svg viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </span>
                <div className={styles.alertText}>
                    <span className={styles.alertTitle}>5 dispositivos a recolher de colaboradores desligados</span>
                    <span className={styles.alertDesc}>Acesse <strong>Funcionários</strong> para ver os alertas de recolhimento.</span>
                </div>
            </div>
        </div>
    )
}