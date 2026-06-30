import { useDashboardPage } from "../../hooks/DashboardHooks/useDashboardPage"
import styles from "../../pages/Dashboard/style.module.css"

function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000 / 60)
    if (diff < 1) return 'agora'
    if (diff < 60) return `${diff}min atrás`
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`
    return `${Math.floor(diff / 1440)}d atrás`
}

export function DashboardRecentActions() {
    const { logs } = useDashboardPage();

    return (
        <section className={`${styles.cardPanel} ${styles.recentPanel}`}>
            <div className={styles.panelHeader}>
                <span className={styles.sectionIcon}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 8v4l3 3" />
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                </span>
                <h2>Últimas ações</h2>
            </div>

            {logs.length === 0 ? (
                <p>Nenhuma ação realizada</p>
            ) : (
                <ul className={styles.recentList}>
                    {logs.map(log => (
                        <li key={log.id} className={styles.recentItem}>
                            <div className={styles.recentContent}>
                                <span className={styles.recentDescription}>
                                    {log.description}
                                </span>
                                <span className={styles.recentTime}>
                                    {timeAgo(log.createdAt)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
