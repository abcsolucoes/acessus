import { useState } from "react"
import { createPortal } from "react-dom"
import styles from "./DesvincularModal.module.css"

type Props = {
    deviceModel: string
    employeeName: string
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function DesvincularModal({ deviceModel, employeeName, onClose, onConfirm }: Props) {
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleConfirm() {
        setConfirming(true)
        setError(null)
        try {
            await onConfirm()
            onClose()
        } catch {
            setError('Erro ao desvincular o aparelho. Tente novamente.')
            setConfirming(false)
        }
    }

    return createPortal(
        <div className={styles.overlay} onClick={confirming ? undefined : onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>Desvincular aparelho</span>
                    <button className={styles.closeBtn} onClick={onClose} disabled={confirming}>✕</button>
                </div>

                <div className={styles.body}>
                    <p className={styles.message}>
                        Isso vai desvincular <strong>{deviceModel}</strong> de <strong>{employeeName}</strong>.
                        O aparelho fica disponível para alocação novamente, e a devolução é registrada no histórico de movimentações.
                    </p>
                    {error && <p className={styles.error}>{error}</p>}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={confirming}>Cancelar</button>
                    <button className={styles.confirmBtn} onClick={handleConfirm} disabled={confirming}>
                        {confirming ? 'Desvinculando…' : 'Desvincular'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
