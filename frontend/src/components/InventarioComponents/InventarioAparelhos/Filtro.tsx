import styles from "../../../pages/Inventario/Funcionarios/style.module.css"

type Props = {
    situacaoFilter: string
    setSituacaoFilter: (situacao: string) => void
    search: string
    setSearch: (search: string) => void
}

const OPCOES = [
    { value: 'ALL', label: 'Todos' },
    { value: 'EM_USO', label: 'Em uso' },
    { value: 'DISPONIVEL', label: 'Disponível' },
    { value: 'MANUTENCAO', label: 'Em manutenção' },
    { value: 'SEM_USUARIO_IDENTIFICADO', label: 'Sem usuário' },
]

export function Filtro({ situacaoFilter, setSituacaoFilter, search, setSearch }: Props) {
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
                        placeholder="Serial, TAG ou ID Pulsus..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.pillGroup}>
                {OPCOES.map(o => (
                    <button
                        key={o.value}
                        className={`${styles.pillBtn} ${situacaoFilter === o.value ? styles.pillBtnActive : ''}`}
                        onClick={() => setSituacaoFilter(o.value)}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
        </div>
    )
}