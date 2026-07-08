import styles from "../../../pages/Inventario/Funcionarios/style.module.css"
import type { Funcionario } from "../../../types"
import { getInitials } from "../../../utils/format";

type Props = {
    funcionarios: Funcionario[];
}

export function ListaFuncionarios({ funcionarios }: Props) {
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
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* <tr>
                            <td>
                                <div className={styles.person}>
                                    <span className={styles.avatar}>MS</span>
                                    <div className={styles.personInfo}>
                                        <span className={styles.personName}>Marina Souza</span>
                                        <span className={styles.personRole}>Vendedora</span>
                                    </div>
                                </div>
                            </td>
                            <td className={styles.cell}>Operação</td>
                            <td className={styles.cell}>Recife/PE</td>
                            <td><span className={`${styles.statusBadge} ${styles.statusSuccess}`}>Com aparelho</span></td>
                            <td><span className={styles.tag}>A442</span></td>
                            <td>
                                <button className={styles.historyBtn}>
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    Histórico
                                </button>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <div className={styles.person}>
                                    <span className={styles.avatar}>RC</span>
                                    <div className={styles.personInfo}>
                                        <span className={styles.personName}>Rafael Costa</span>
                                        <span className={styles.personRole}>Motorista</span>
                                    </div>
                                </div>
                            </td>
                            <td className={styles.cell}>Operação</td>
                            <td className={styles.cell}>Curitiba/PR</td>
                            <td><span className={`${styles.statusBadge} ${styles.statusDanger}`}>Sem aparelho</span></td>
                            <td><span className={`${styles.tag} ${styles.tagMuted}`}>—</span></td>
                            <td>
                                <button className={styles.historyBtn}>
                                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    Histórico
                                </button>
                            </td>
                        </tr> */}

                        {funcionarios.map(f => (
                            <tr key={f.id}>
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
                                <td><span className={`${styles.statusBadge} ${styles.statusDanger}`}>Sem aparelho</span></td>
                                <td><span className={`${styles.tag} ${styles.tagMuted}`}>—</span></td>
                                <td>
                                    <button className={styles.historyBtn}>
                                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        Histórico
                                    </button>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}