import styles from "../../../pages/Inventario/Alocacao/style.module.css"
import type { Funcionario } from "../../../types"
import { getInitials } from "../../../utils/format"

type Props = {
    funcionarios: Funcionario[]
    pendentes: number
    somenteSemAparelho: boolean
    onToggleSomenteSemAparelho: (value: boolean) => void
    search: string
    setSearch: (value: string) => void
    page: number
    totalPages: number
    setPage: (page: number) => void
    selectedId: number | null
    onSelect: (funcionario: Funcionario) => void
}

function labelAparelho(funcionario: Funcionario) {
    if (funcionario.devices.length === 0) return null
    if (funcionario.devices.length === 1) return `Já possui: ${funcionario.devices[0].model ?? 'aparelho'}`
    return `Já possui ${funcionario.devices.length} aparelhos`
}

export function PainelFuncionarios({ funcionarios, pendentes, somenteSemAparelho, onToggleSomenteSemAparelho, search, setSearch, page, totalPages, setPage, selectedId, onSelect }: Props) {
    const isFirstPage = page === 0
    const isLastPage = page >= totalPages - 1

    return (
        <div className={styles.column}>
            <div className={styles.columnHead}>
                <span className={styles.columnTitle}>1. Selecione um funcionário</span>
                <span className={styles.columnBadge}>{pendentes} {somenteSemAparelho ? 'pendentes' : 'encontrados'}</span>
            </div>

            <label className={styles.toggleRow}>
                <span className={styles.toggleSwitch}>
                    <input
                        type="checkbox"
                        checked={somenteSemAparelho}
                        onChange={e => onToggleSomenteSemAparelho(e.target.checked)}
                    />
                    <span className={styles.toggleTrack}>
                        <span className={styles.toggleThumb} />
                    </span>
                </span>
                Somente sem aparelho
            </label>

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
                {funcionarios.length === 0 && (
                    <div className={styles.emptyState}>Nenhum funcionário encontrado.</div>
                )}

                {funcionarios.map(f => {
                    const aparelhoLabel = labelAparelho(f)
                    return (
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
                            {aparelhoLabel ? (
                                <span className={styles.statusPillInfo} title={f.devices.map(d => d.model ?? 'Aparelho').join(', ')}>
                                    {aparelhoLabel}
                                </span>
                            ) : (
                                <span className={styles.statusPill}>Sem aparelho</span>
                            )}
                            <span className={`${styles.radio} ${selectedId === f.id ? styles.radioChecked : ''}`} />
                        </button>
                    )
                })}
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
