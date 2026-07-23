import styles from "./NovaLinhaModal.module.css"

type Props = {
    onClose: () => void
}

export function NovaLinhaModal({ onClose }: Props) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Nova linha</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <form className={styles.form}>
                    <div className={styles.field}>
                        <label>Número <span className={styles.required}>*</span></label>
                        <input placeholder="(31) 99999-9999" />
                    </div>

                    <div className={styles.field}>
                        <label>Chip (ICCID) <span className={styles.optional}>(opcional)</span></label>
                        <input placeholder="8955 0000 0000 0000" />
                    </div>

                    <div className={styles.field}>
                        <label>Observações <span className={styles.optional}>(opcional)</span></label>
                        <textarea placeholder="Alguma observação sobre essa linha..." rows={3} />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="button" className={styles.submitBtn}>
                            Cadastrar linha
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
