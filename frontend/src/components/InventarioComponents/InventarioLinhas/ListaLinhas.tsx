import { useNavigate } from "react-router-dom"
import type { Line, LineStatus } from "../../../types"
import styles from "../../../pages/Inventario/Linhas/style.module.css"

const STATUS_LABEL: Record<LineStatus, string> = {
    IN_USE: 'Em uso',
    AVAILABLE: 'Disponível',
    REACTIVATE: 'Reativar',
    UNAVAILABLE: 'Indisponível',
}

const STATUS_CLASSE: Record<LineStatus, string> = {
    IN_USE: styles.statusSuccess,
    AVAILABLE: styles.statusNeutral,
    REACTIVATE: styles.statusWarning,
    UNAVAILABLE: styles.statusDanger,
}

type Props = {
    linhas: Line[]
}

export function ListaLinhas({ linhas }: Props) {
    const navigate = useNavigate()

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.tableScroll}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Linha</th>
                            <th>Chip (ICCID)</th>
                            <th>Funcionário</th>
                            <th>Status</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.emptyRow}>Nenhuma linha encontrada.</td>
                            </tr>
                        )}

                        {linhas.map(l => (
                            <tr
                                key={l.id}
                                className={styles.clickableRow}
                                onClick={() => navigate(`/inventario/linhas/${l.id}`)}
                            >
                                <td>
                                    <span className={styles.lineNumber}>{l.number}</span>
                                </td>
                                <td>
                                    <span className={l.iccid || l.type === 'ESIM' ? styles.chip : `${styles.chip} ${styles.chipMuted}`}>
                                        {l.type === 'ESIM' ? 'eSIM' : (l.iccid ?? '—')}
                                    </span>
                                </td>
                                <td className={l.employeeName ? styles.cell : styles.cellMuted}>{l.employeeName ?? '—'}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${STATUS_CLASSE[l.status]}`}>
                                        {STATUS_LABEL[l.status]}
                                    </span>
                                </td>
                                <td className={styles.notesCell} title={l.notes ?? undefined}>{l.notes ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
