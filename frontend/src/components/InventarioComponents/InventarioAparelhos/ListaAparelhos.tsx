import { Link } from "react-router-dom"
import styles from "../../../pages/Inventario/Aparelhos/style.module.css"
import type { Device, DeviceSituacao } from "../../../types"

type Props = {
    aparelhos: Device[];
}

const SITUACAO_LABEL: Record<DeviceSituacao, string> = {
    EM_USO: 'Em uso',
    DISPONIVEL: 'Disponível',
    MANUTENCAO: 'Em manutenção',
    SEM_USUARIO_IDENTIFICADO: 'Sem usuário identificado',
}

const SITUACAO_CLASSE: Record<DeviceSituacao, string> = {
    EM_USO: styles.statusSuccess,
    DISPONIVEL: styles.statusNeutral,
    MANUTENCAO: styles.statusWarning,
    SEM_USUARIO_IDENTIFICADO: styles.statusDanger,
}

export function ListaAparelhos({ aparelhos }: Props) {
    return (
        <div className={styles.tableWrapper}>
            <div className={styles.tableScroll}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Aparelho</th>
                            <th>Serial</th>
                            <th>Grupo</th>
                            <th>Funcionário</th>
                            <th>TAG</th>
                            <th>Status</th>
                            <th>ID Pulsus</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {aparelhos.map(d => (
                            <tr key={d.id}>
                                <td>
                                    <div className={styles.deviceInfo}>
                                        <span className={styles.deviceModel}>{d.model ?? '—'}</span>
                                        <span className={styles.deviceManufacturer}>{d.manufacturer ?? '—'}</span>
                                    </div>
                                </td>
                                <td className={styles.cell}>{d.serialNumber ?? '—'}</td>
                                <td className={styles.cell}>{d.group ?? '—'}</td>
                                <td className={styles.cell}>{d.employeeName ?? '—'}</td>
                                <td>
                                    <span className={d.tagDevice ? styles.tag : `${styles.tag} ${styles.tagMuted}`}>
                                        {d.tagDevice ?? '—'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${SITUACAO_CLASSE[d.situacao]}`}>
                                        {SITUACAO_LABEL[d.situacao]}
                                    </span>
                                </td>
                                <td className={styles.cell}>{d.pulsusId}</td>
                                <td>
                                    <Link to={`/inventario/aparelhos/${d.id}`} className={styles.detailsBtn}>
                                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                                        Detalhes
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
