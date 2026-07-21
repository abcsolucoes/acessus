import { useState } from "react"
import { Link } from "react-router-dom"
import type { Device } from "../../../types"
import { getInitials } from "../../../utils/format"
import { desvincularAparelho } from "../../../services/AparelhoService/aparelhoApi"
import { DesvincularModal } from "../DesvincularModal"
import styles from "./AparelhoFuncionario.module.css"

type Props = {
    aparelho: Device
    onDesvinculado: () => void
}

export function AparelhoFuncionario({ aparelho, onDesvinculado }: Props) {
    const [showDesvincular, setShowDesvincular] = useState(false)

    async function handleDesvincular() {
        await desvincularAparelho(aparelho.id)
        onDesvinculado()
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Funcionário vinculado</h2>

            {aparelho.employeeId && aparelho.employeeName ? (
                <div className={styles.employeeCard}>
                    <Link to={`/inventario/funcionarios/${aparelho.employeeId}`} className={styles.employeeLink}>
                        <span className={styles.avatar}>{getInitials(aparelho.employeeName)}</span>
                        <div className={styles.employeeInfo}>
                            <span className={styles.employeeName}>{aparelho.employeeName}</span>
                            <span className={styles.employeeMeta}>Ver perfil do colaborador</span>
                        </div>
                        <svg className={styles.chevron} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                    <button className={styles.unlinkBtn} onClick={() => setShowDesvincular(true)}>
                        <svg viewBox="0 0 24 24"><path d="M18.36 5.64a5 5 0 0 0-7.07 0L9 7.93M5.64 18.36a5 5 0 0 0 7.07 0L15 16.07" /><line x1="8" y1="16" x2="16" y2="8" /></svg>
                        Desvincular
                    </button>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>Nenhum funcionário vinculado a este aparelho.</p>
                    <Link to="/inventario/alocacao" className={styles.emptyCta}>Vincular funcionário</Link>
                </div>
            )}

            {showDesvincular && aparelho.employeeName && (
                <DesvincularModal
                    deviceModel={aparelho.model ?? 'este aparelho'}
                    employeeName={aparelho.employeeName}
                    onClose={() => setShowDesvincular(false)}
                    onConfirm={handleDesvincular}
                />
            )}
        </section>
    )
}
