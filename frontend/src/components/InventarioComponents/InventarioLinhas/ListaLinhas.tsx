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

const LINHAS_MOCK: Line[] = [
    { id: 1, number: '(31) 99876-5432', iccid: '8955 0140 2211', status: 'IN_USE', notes: null, employeeName: 'Adriano Rezende Lima', employeeId: 101 },
    { id: 2, number: '(31) 96995-8830', iccid: '8955 2355 1690', status: 'IN_USE', notes: 'Aviso até 18/06/2026', employeeName: 'Anderson Franco Cardoso', employeeId: 102 },
    { id: 3, number: '(31) 97654-8899', iccid: '8955 0399 5541', status: 'IN_USE', notes: null, employeeName: 'Alexandre Rodrigues Silva', employeeId: 103 },
    { id: 4, number: '(31) 96543-2210', iccid: '8955 0140 3392', status: 'AVAILABLE', notes: null, employeeName: null, employeeId: null },
    { id: 5, number: '(31) 95432-7765', iccid: '8955 0243 1145', status: 'AVAILABLE', notes: null, employeeName: null, employeeId: null },
    { id: 6, number: '(31) 97157-4299', iccid: '8955 1097 1719', status: 'REACTIVATE', notes: null, employeeName: null, employeeId: null },
    { id: 7, number: '(31) 99993-7494', iccid: null, status: 'UNAVAILABLE', notes: 'MARIA LUIZA DYSRUP', employeeName: null, employeeId: null },
    { id: 8, number: '(31) 99914-5284', iccid: '8955 2355 1690', status: 'UNAVAILABLE', notes: 'SUPORTE DYSRUP', employeeName: null, employeeId: null },
]

export function ListaLinhas() {
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
                        {LINHAS_MOCK.map(l => (
                            <tr
                                key={l.id}
                                className={styles.clickableRow}
                                onClick={() => navigate(`/inventario/linhas/${l.id}`)}
                            >
                                <td>
                                    <span className={styles.lineNumber}>{l.number}</span>
                                </td>
                                <td>
                                    <span className={l.iccid ? styles.chip : `${styles.chip} ${styles.chipMuted}`}>
                                        {l.iccid ?? '—'}
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
