import styles from './RHToolbar.module.css'

const STATUS_FILTERS = [
  { label: 'Todos',      value: 'ALL' },
  { label: 'Pendente',   value: 'PENDING' },
  { label: 'Em análise', value: 'UNDER_ANALYSIS' },
  { label: 'Aprovado',   value: 'APPROVED' },
  { label: 'Rejeitado',  value: 'REJECTED' },
]

type Props = {
  statusFilter: string
  onStatusChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
}

export function RHToolbar({ statusFilter, onStatusChange, search, onSearchChange }: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s.value}
            className={`${styles.filterBtn} ${statusFilter === s.value ? styles.filterBtnActive : ''}`}
            onClick={() => onStatusChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" />
        </svg>
        <input
          className={styles.search}
          placeholder="Buscar candidato…"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
