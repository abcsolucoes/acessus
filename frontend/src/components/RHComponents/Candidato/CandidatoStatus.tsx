import styles from './CandidatoStatus.module.css'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  UNDER_ANALYSIS: 'Em análise',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}

type Props = {
  candidateStatus: string | undefined
  loading: boolean
  onChangeStatus: (status: string) => void
}

export function CandidatoStatus({ candidateStatus, loading, onChangeStatus }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Status</h2>
      <div className={styles.statusBtns}>
        {(['PENDING', 'UNDER_ANALYSIS', 'APPROVED', 'REJECTED'] as const).map(s => (
          <button
            key={s}
            className={`${styles.statusBtn} ${candidateStatus === s ? styles[`statusBtnActive_${s}`] : ''}`}
            onClick={() => onChangeStatus(s)}
            disabled={loading || candidateStatus === s}
          >
            <span className={styles.statusDot} data-status={s} />
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
    </section>
  )
}
