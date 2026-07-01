import styles from '../../RHComponents/Candidato/CandidatoDeleteModal.module.css'

type Props = {
  candidateName: string
  deleteLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CandidatoDeleteModal({ candidateName, deleteLoading, onClose, onConfirm }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Excluir candidato</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <p className={styles.message}>
            Tem certeza que deseja excluir <strong>{candidateName}</strong>? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={deleteLoading}>
            Cancelar
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm} disabled={deleteLoading}>
            {deleteLoading ? 'Excluindo…' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
