import type { Dispatch, SetStateAction } from "react"
import { Link } from "react-router-dom"
import type { DeviceHistory } from "../../../types"
import { formatDateTime } from "../../../utils/format"
import styles from "./AparelhoHistorico.module.css"

function IconeAlocacao() {
    return <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
}
function IconeDevolucao() {
    return <svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
}

const ACTION_TYPE: Record<string, string> = {
    ALLOCATION: 'Alocação',
    DEALLOCATION: 'Devolução',
}

type Props = {
    historico: DeviceHistory[]
    page: number
    totalPages: number
    setPage: Dispatch<SetStateAction<number>>
}

export function AparelhoHistorico({ historico, page, totalPages, setPage }: Props) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Histórico de movimentações</h2>
                <span className={styles.count}>{historico.length} registro{historico.length !== 1 ? 's' : ''}</span>
            </div>

            {historico.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>Nenhuma movimentação registrada ainda.</p>
                </div>
            ) : (
                <ol className={styles.timeline}>
                    {historico.map((h) => {
                        const isAlocacao = h.actionType === 'ALLOCATION'
                        return (
                            <li className={styles.item} key={h.id}>
                                <span className={`${styles.marker} ${isAlocacao ? styles.markerAlocacao : styles.markerDevolucao}`}>
                                    {isAlocacao ? <IconeAlocacao /> : <IconeDevolucao />}
                                </span>
                                <div className={styles.itemBody}>
                                    <div className={styles.itemHeader}>
                                        <span className={styles.itemAction}>{ACTION_TYPE[h.actionType]}</span>
                                        <span className={styles.itemDate}>{formatDateTime(h.createdAt)}</span>
                                    </div>
                                    <p className={styles.itemDesc}>
                                        {isAlocacao ? 'Vinculado a' : 'Devolvido por'} <span className={styles.employeeName}>{h.employee.name}</span> · {h.employee.department ?? '—'}
                                    </p>
                                    <div className={styles.deviceLinks}>
                                        <Link className={styles.deviceLink} to={`/inventario/funcionarios/${h.employee.id}`}>
                                            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
                                            Ver colaborador
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            )}

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(page - 1)}>← Anterior</button>
                    <span className={styles.pageInfo}>Página {page + 1} de {totalPages}</span>
                    <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Próxima →</button>
                </div>
            )}
        </section>
    )
}
