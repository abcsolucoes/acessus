import styles from "../../../pages/Inventario/Linhas/style.module.css"

type Props = {
    statusFilter: string
    setStatusFilter: (status: string) => void
    search: string
    setSearch: (search: string) => void
}

const OPCOES = [
    { value: 'ALL', label: 'Todas' },
    { value: 'IN_USE', label: 'Em uso' },
    { value: 'AVAILABLE', label: 'Disponível' },
    { value: 'REACTIVATE', label: 'Reativar' },
    { value: 'UNAVAILABLE', label: 'Indisponível' },
]

export function FiltroLinhas({ statusFilter, setStatusFilter, search, setSearch }: Props) {
    return (
        <div className={styles.filters}>
            <div className={styles.filterField}>
                <span className={styles.filterLabel}>Buscar</span>
                <div className={styles.searchWrap}>
                    <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className={styles.filterInput}
                        placeholder="Número ou chip (ICCID)..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.pillGroup}>
                {OPCOES.map(o => (
                    <button
                        key={o.value}
                        type="button"
                        className={`${styles.pillBtn} ${statusFilter === o.value ? styles.pillBtnActive : ''}`}
                        onClick={() => setStatusFilter(o.value)}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
