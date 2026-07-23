import { useEffect, useRef, useState } from 'react'
import styles from './RHToolbar.module.css'

const STATUS_FILTERS = [
  { label: 'Todos',      value: 'ALL' },
  { label: 'Pendente',   value: 'PENDING' },
  { label: 'Em análise', value: 'UNDER_ANALYSIS' },
  { label: 'Aprovado',   value: 'APPROVED' },
  { label: 'Rejeitado',  value: 'REJECTED' },
]

const SORT_OPTIONS = [
  { label: 'Mais recentes',    value: 'id,desc' },
  { label: 'Nome (A-Z)',       value: 'name,asc' },
  { label: 'Data de admissão', value: 'admissionDate,desc' },
]

type Props = {
  statusFilter: string
  onStatusChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
}

export function RHToolbar({ statusFilter, onStatusChange, search, onSearchChange, sort, onSortChange }: Props) {
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const currentSort = SORT_OPTIONS.find(s => s.value === sort) ?? SORT_OPTIONS[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

      <div className={styles.rightGroup}>
        <div className={styles.sortDropdown} ref={sortRef}>
          <button
            type="button"
            className={styles.sortBtn}
            onClick={() => setSortOpen(prev => !prev)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            {currentSort.label}
            <svg
              className={`${styles.chevron} ${sortOpen ? styles.chevronOpen : ''}`}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {sortOpen && (
            <div className={styles.sortMenu} role="listbox">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  role="option"
                  aria-selected={sort === s.value}
                  className={`${styles.sortItem} ${sort === s.value ? styles.sortItemActive : ''}`}
                  onClick={() => { onSortChange(s.value); setSortOpen(false) }}
                >
                  {s.label}
                  {sort === s.value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
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
    </div>
  )
}
