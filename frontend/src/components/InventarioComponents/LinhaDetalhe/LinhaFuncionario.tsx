import { Link } from "react-router-dom"
import type { Line } from "../../../types"
import { getInitials } from "../../../utils/format"
import styles from "./LinhaFuncionario.module.css"

type Props = { linha: Line }

export function LinhaFuncionario({ linha }: Props) {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Funcionário vinculado</h2>

            {linha.employeeId && linha.employeeName ? (
                <div className={styles.employeeCard}>
                    <Link to={`/inventario/funcionarios/${linha.employeeId}`} className={styles.employeeLink}>
                        <span className={styles.avatar}>{getInitials(linha.employeeName)}</span>
                        <div className={styles.employeeInfo}>
                            <span className={styles.employeeName}>{linha.employeeName}</span>
                            <span className={styles.employeeMeta}>Ver perfil do colaborador</span>
                        </div>
                        <svg className={styles.chevron} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                    <button type="button" className={styles.unlinkBtn}>
                        <svg viewBox="0 0 24 24"><path d="M18.36 5.64a5 5 0 0 0-7.07 0L9 7.93M5.64 18.36a5 5 0 0 0 7.07 0L15 16.07" /><line x1="8" y1="16" x2="16" y2="8" /></svg>
                        Desvincular
                    </button>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>Nenhum funcionário vinculado a esta linha.</p>
                    <button type="button" className={styles.emptyCta}>Vincular funcionário</button>
                </div>
            )}
        </section>
    )
}
