import { useState } from "react"
import { createPortal } from "react-dom"
import styles from "./DesvincularLinhaModal.module.css"

type Props = {
    numero: string
    employeeName: string
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function DesvincularLinhaModal({ numero, employeeName, onClose, onConfirm }: Props) {
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleConfirm() {
        setConfirming(true)
        setError(null)
        try {
            await onConfirm()
            onClose()
        } catch {
            setError('Erro ao desvincular a linha. Tente novamente.')
            setConfirming(false)
        }
    }

    return createPortal(
        <div className={styles.overlay} onClick={confirming ? undefined : onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>Desvincular linha</span>
                    <button className={styles.closeBtn} onClick={onClose} disabled={confirming}>✕</button>
                </div>

                <div className={styles.body}>
                    <p className={styles.message}>
                        Isso vai desvincular a linha <strong>{numero}</strong> de <strong>{employeeName}</strong>.
                        A linha fica disponível pra vínculo novamente.
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
