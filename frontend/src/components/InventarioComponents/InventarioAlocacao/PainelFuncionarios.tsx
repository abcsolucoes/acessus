import styles from "../../../pages/Inventario/Alocacao/style.module.css"
import type { Funcionario } from "../../../types"
import { getInitials } from "../../../utils/format"

type Props = {
    funcionarios: Funcionario[]
    pendentes: number
    search: string
    setSearch: (value: string) => void
    page: number
    totalPages: number
    setPage: (page: number) => void
    selectedId: number | null
    onSelect: (funcionario: Funcionario) => void
}

export function PainelFuncionarios({ funcionarios, pendentes, search, setSearch, page, totalPages, setPage, selectedId, onSelect }: Props) {
    const isFirstPage = page === 0
    const isLastPage = page >= totalPages - 1
    const semAparelho = funcionarios.filter(f => f.devices.length === 0)

    return (
        <div className={styles.column}>
            <div className={styles.columnHead}>
                <span className={styles.columnTitle}>1. Selecione um funcionário</span>
                <span className={styles.columnBadge}>{pendentes} pendentes</span>
            </div>

            <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </span>
                <input
                    className={styles.searchInput}
                    placeholder="Buscar por nome ou e-mail"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className={styles.list}>
                {semAparelho.length === 0 && (
                    <div className={styles.emptyState}>Nenhum funcionário encontrado.</div>
                )}

                {semAparelho.map(f => (
                    <button
                        key={f.id}
                        type="button"
                        className={`${styles.listItem} ${selectedId === f.id ? styles.listItemSelected : ''}`}
                        onClick={() => onSelect(f)}
                    >
                        <span className={styles.avatar}>{getInitials(f.name)}</span>
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{f.name}</span>
                            <span className={styles.itemMeta}>{f.department ?? '—'} · {f.position ?? '—'}</span>
                        </div>
                        <span className={styles.statusPill}>Sem aparelho</span>
                        <span className={`${styles.radio} ${selectedId === f.id ? styles.radioChecked : ''}`} />
                    </button>
                ))}
            </div>

            <div className={styles.columnPagination}>
                <button
                    type="button"
                    className={styles.columnPageBtn}
                    disabled={isFirstPage}
                    onClick={() => setPage(page - 1)}
                >
                    ← Anterior
                </button>
                <span className={styles.columnPageInfo}>
                    Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
                </span>
                <button
                    type="button"
                    className={styles.columnPageBtn}
                    disabled={isLastPage}
                    onClick={() => setPage(page + 1)}
                >
                    Próxima →
                </button>
            </div>
        </div>
    )
}
