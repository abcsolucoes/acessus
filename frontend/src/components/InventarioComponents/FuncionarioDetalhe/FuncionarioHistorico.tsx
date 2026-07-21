import type { Dispatch, SetStateAction } from "react"
import { Link } from "react-router-dom"
import type { DeviceHistory } from "../../../types"
import styles from "./FuncionarioHistorico.module.css"
import { formatDateTime } from "../../../utils/format"

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

export function FuncionarioHistorico({ historico, page, totalPages, setPage }: Props) {
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
                                        <span className={styles.deviceModel}>{h.device.model}</span> · {h.device.manufacturer} · Serial {h.device.serialNumber}
                                    </p>

                                    <div className={styles.deviceChips}>
                                        <span className={styles.chip}>Pulsus {h.device.pulsusId}</span>
                                        <span className={styles.chip}>{h.device.tagDevice ?? '—'}</span>
                                    </div>

                                    <div className={styles.deviceLinks}>
                                        <a
                                            className={styles.deviceLink}
                                            href={`https://app.pulsus.mobi/devices/${h.device.pulsusId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                            Pulsus
                                        </a>
                                        <Link
                                            className={styles.deviceLink}
                                            to={`/inventario/aparelhos/${h.device.id}`}
                                        >
                                            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                            Detalhes
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
