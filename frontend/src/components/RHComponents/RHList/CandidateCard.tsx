import { getInitials } from '../../../utils/format'
import type { Candidate } from '../../../types'
import styles from './CandidateCard.module.css'

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING:        { label: 'Pendente',    color: '#F59E0B' },
  UNDER_ANALYSIS: { label: 'Em análise', color: '#3B82F6' },
  APPROVED:       { label: 'Aprovado',   color: '#22C55E' },
  REJECTED:       { label: 'Rejeitado',  color: '#EF4444' },
}

type Props = {
  candidate: Candidate
  onClick: () => void
  animationDelay: number
}

export function CandidateCard({ candidate, onClick, animationDelay }: Props) {
  const meta = STATUS_META[candidate.candidateStatus]

  return (
    <div
      className={styles.card}
      onClick={onClick}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={styles.cardAvatar}>
        {getInitials(candidate.name)}
      </div>
      <div className={styles.cardMain}>
        <span className={styles.cardName}>{candidate.name}</span>
        <span className={styles.cardEmail}>{candidate.email}</span>
      </div>
      <span className={styles.cardPosition}>{candidate.position}</span>
      {meta && (
        <span
          className={styles.cardBadge}
          style={{ color: meta.color, borderColor: `${meta.color}44`, background: `${meta.color}14` }}
        >
          {meta.label}
        </span>
      )}
      <svg className={styles.cardArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  )
}
