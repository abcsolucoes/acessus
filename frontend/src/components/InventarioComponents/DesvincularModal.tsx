import styles from "./DesvincularModal.module.css"

type Props = {
    deviceModel: string
    employeeName: string
    onClose: () => void
    onConfirm: () => void
}

export function DesvincularModal({ deviceModel, employeeName, onClose, onConfirm }: Props) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>Desvincular aparelho</span>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.body}>
                    <p className={styles.message}>
                        Isso vai desvincular <strong>{deviceModel}</strong> de <strong>{employeeName}</strong>.
                        O aparelho fica disponível para alocação novamente, e a devolução é registrada no histórico de movimentações.
                    </p>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>Desvincular</button>
                </div>
            </div>
        </div>
    )
}
