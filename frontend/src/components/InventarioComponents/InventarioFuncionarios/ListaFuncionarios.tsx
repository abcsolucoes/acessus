import { useNavigate } from "react-router-dom"
import styles from "../../../pages/Inventario/Funcionarios/style.module.css"
import type { EmployeeStatus, Funcionario } from "../../../types"
import { getInitials } from "../../../utils/format";

type Props = {
    funcionarios: Funcionario[];
}

// Mesmos status que EmployeeStatus.isActive() trata como "não ativo" no backend —
// pra esses, não ter aparelho é esperado, não uma pendência
const STATUS_NEUTRO_LABEL: Partial<Record<EmployeeStatus, string>> = {
    DEMITIDO: 'Demitido',
    AFASTADO: 'Afastado',
    FERIAS: 'Férias',
    PENDENTE_REVISAO: 'Pendente de revisão',
}

function statusAparelho(f: Funcionario): { label: string; className: string } {
    const statusNeutro = STATUS_NEUTRO_LABEL[f.status]

    if (f.devices.length > 0) {
        if (statusNeutro) {
            return { label: `Com aparelho / ${f.status}`, className: styles.statusDanger }
        }
        return { label: 'Com aparelho', className: styles.statusSuccess }
    }
    if (f.profile === 'SERVICE_PROVIDER') {
        return { label: 'Prestador de serviço', className: styles.statusNeutral }
    }
    if (statusNeutro) {
        return { label: statusNeutro, className: styles.statusNeutral }
    }
    return { label: 'Sem aparelho', className: styles.statusDanger }
}

export function ListaFuncionarios({ funcionarios }: Props) {
    const navigate = useNavigate()

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.tableScroll}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Funcionário</th>
                            <th>Departamento</th>
                            <th>Cidade/UF</th>
                            <th>Status</th>
                            <th>TAG aparelho</th>
                            <th>ID Pulsus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funcionarios.map(f => {
                            const { label, className } = statusAparelho(f)
                            const device = f.devices.length > 0 ? f.devices[0] : null

                            return (
                                <tr
                                    key={f.id}
                                    className={styles.clickableRow}
                                    onClick={() => navigate(`/inventario/funcionarios/${f.id}`)}
                                >
                                    <td>
                                        <div className={styles.person}>
                                            <span className={styles.avatar}>{getInitials(f.name)}</span>
                                            <div className={styles.personInfo}>
                                                <span className={styles.personName}>{f.name.toLowerCase().replace(/\b\w/g, (letra) => letra.toUpperCase())}</span>
                                                <span className={styles.personRole}>{f.position}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.cell}>{f.department}</td>
                                    <td className={styles.cell}>{f.city}/{f.state}</td>
                                    <td><span className={`${styles.statusBadge} ${className}`}>{label}</span></td>
                                    <td><span className={device ? styles.tag : `${styles.tag} ${styles.tagMuted}`}>{device?.tagDevice ?? '—'}</span></td>
                                    <td className={styles.cell}>{device?.pulsusId ?? '—'}</td>
                                </tr>
                            )
                        })}

                    </tbody>
                </table>
            </div>
        </div>
    )
}