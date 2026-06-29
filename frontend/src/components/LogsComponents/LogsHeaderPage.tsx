import styles from "../../pages/Logs/Logs.module.css"

type Props = {
    totalElements: number
}

export function LogsHeaderPage({totalElements}: Props) {
    return (
        <div className={styles.top}>
            <div className={styles.titleGroup}>
                <h1 className={styles.title}>Logs de Auditoria</h1>
                {totalElements > 0 && (
                    <span className={styles.badge}>{totalElements} registros</span>
                )}
            </div>
        </div>
    )
}