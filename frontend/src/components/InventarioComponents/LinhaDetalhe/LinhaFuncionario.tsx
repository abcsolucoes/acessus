import { useState } from "react"
import { Link } from "react-router-dom"
import type { Line } from "../../../types"
import { getInitials } from "../../../utils/format"
import { desvincularLinha } from "../../../services/LinhaService/linhaApi"
import { DesvincularLinhaModal } from "./DesvincularLinhaModal"
import { VincularLinhaModal } from "./VincularLinhaModal"
import styles from "./LinhaFuncionario.module.css"

type Props = {
    linha: Line
    onAlterado: () => void
}

export function LinhaFuncionario({ linha, onAlterado }: Props) {
    const [showDesvincular, setShowDesvincular] = useState(false)
    const [showVincular, setShowVincular] = useState(false)

    async function handleDesvincular() {
        await desvincularLinha(linha.id)
        onAlterado()
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Funcionário vinculado
            </h2>

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
                    <button type="button" className={styles.unlinkBtn} onClick={() => setShowDesvincular(true)}>
                        <svg viewBox="0 0 24 24"><path d="M18.36 5.64a5 5 0 0 0-7.07 0L9 7.93M5.64 18.36a5 5 0 0 0 7.07 0L15 16.07" /><line x1="8" y1="16" x2="16" y2="8" /></svg>
                        Desvincular
                    </button>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>Nenhum funcionário vinculado a esta linha.</p>
                    <button type="button" className={styles.emptyCta} onClick={() => setShowVincular(true)}>Vincular funcionário</button>
                </div>
            )}

            {showDesvincular && linha.employeeName && (
                <DesvincularLinhaModal
                    numero={linha.number}
                    employeeName={linha.employeeName}
                    onClose={() => setShowDesvincular(false)}
                    onConfirm={handleDesvincular}
                />
            )}

            {showVincular && (
                <VincularLinhaModal
                    lineId={linha.id}
                    onClose={() => setShowVincular(false)}
                    onSuccess={onAlterado}
                />
            )}
        </section>
    )
}
