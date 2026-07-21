import styles from "../../../pages/Inventario/Funcionarios/style.module.css"

type Props = {
    statusFilter: string
    setStatusFilter: (status: string) => void
    search: string
    setSearch: (search: string) => void
    afastadosCount: number | undefined
}

export function Filtro({ statusFilter, setStatusFilter, search, setSearch, afastadosCount }: Props) {
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
                        placeholder="Nome ou CPF..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.pillGroup}>
                <button
                    className={`${styles.pillBtn} ${statusFilter === 'ALL' ? styles.pillBtnActive : ''}`}
                    onClick={() => setStatusFilter('ALL')}
                >
                    Todos
                </button>
                <button
                    className={`${styles.pillBtn} ${statusFilter === 'COM_APARELHO' ? styles.pillBtnActive : ''}`}
                    onClick={() => setStatusFilter('COM_APARELHO')}
                >
                    Com aparelho
                </button>
                <button
                    className={`${styles.pillBtn} ${statusFilter === 'SEM_APARELHO' ? styles.pillBtnActive : ''}`}
                    onClick={() => setStatusFilter('SEM_APARELHO')}
                >
                    Sem aparelho
                </button>
                <button className={styles.pillBtn} disabled title="Depende do módulo de Aparelhos, ainda não implementado">Ajuda de custo</button>
            </div>

            <button
                className={`${styles.afastadosBtn} ${statusFilter === 'AFASTADO' ? styles.pillBtnActive : ''}`}
                onClick={() => setStatusFilter('AFASTADO')}
            >
                <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" /></svg>
                Afastados ({afastadosCount ?? '-'})
            </button>
        </div>
    )
}