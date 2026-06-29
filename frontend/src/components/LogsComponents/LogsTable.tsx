import styles from "../../pages/Logs/Logs.module.css"
import type { Logs } from "../../types"
import { formatDateTime } from "../../utils/format";

type Props = {
    logs: Logs[]
    getInitials: (name: string) => string
}

export function LogsTable({ logs, getInitials }: Props) {
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Ação</th>
                        <th style={{ textAlign: "right" }}>Data / Hora</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={3}>
                                <div className={styles.emptyState}>
                                    <span className={styles.emptyIcon}>📋</span>
                                    <p className={styles.emptyText}>Nenhum log encontrado</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        logs.map(l => (
                            <tr key={l.id}>
                                <td>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {getInitials(l.userName)}
                                        </div>
                                        <span className={styles.userName}>{l.userName}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.description}>{l.description}</span>
                                </td>
                                <td className={styles.dateCell}>
                                    <span className={styles.date}>{formatDateTime(l.createdAt)}</span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}