import styles from "../../../pages/Inventario/Movimentacoes/style.module.css"
import type { DeviceHistory } from "../../../types"

type Props = { historico: DeviceHistory[] }

export function ListaMovimentacoes({ historico }: Props) {
    return (
        <div className={styles.tableWrapper}>
            <div className={styles.tableScroll}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Data / Hora</th>
                            <th>Ação</th>
                            <th>Funcionário</th>
                            <th>Aparelho</th>
                        </tr>
                    </thead>
                    {historico.map((h) => {
                        const [data, hora] = h.createdAt.split("T")
                        const [ano, mes, dia] = data.split("-")
                        const iniciais = h.employee.name.split(" ").map(n => n[0]).slice(0, 2).join("")

                        return (
                            <tr key={h.id}>
                                <td className={styles.dateCell}>
                                    <span className={styles.date}>{`${dia}/${mes}/${ano}`}</span>
                                    <span className={styles.time}>{hora.slice(0, 5)}</span>
                                </td>

                                <td>
                                    <span className={`${styles.actionBadge} ${h.actionType === "ALLOCATION" ? styles.actionAlocacao : styles.actionDevolucao}`}>
                                        {h.actionType === "ALLOCATION" ? <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg> : <svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>}
                                        {h.actionType === "ALLOCATION" ? "Alocação" : "Devolução"}
                                    </span>
                                </td>

                                <td>
                                    <div className={styles.person}>
                                        <span className={styles.avatar}>{iniciais}</span>
                                        <div className={styles.personInfo}>
                                            <span className={styles.personName}>{h.employee.name}</span>
                                            <span className={styles.personMeta}>{h.employee.department}</span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div className={styles.device}>
                                        <span className={styles.deviceIcon}>
                                            <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                                        </span>
                                        <div className={styles.deviceInfo}>
                                            <span className={styles.deviceModel}>{h.device.model}</span>
                                            <span className={styles.deviceMeta}>{h.device.tagDevice}</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </table>
            </div>
        </div>
    )
}
