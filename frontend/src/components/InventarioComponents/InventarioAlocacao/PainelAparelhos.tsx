import styles from "../../../pages/Inventario/Alocacao/style.module.css"
import type { Device } from "../../../types"

type Props = {
    aparelhos: Device[]
    disponiveis: number
    search: string
    setSearch: (value: string) => void
    page: number
    totalPages: number
    setPage: (page: number) => void
    selectedId: number | null
    onSelect: (aparelho: Device) => void
}

function DeviceIcon() {
    return (
        <span className={styles.deviceIcon}>
            <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
        </span>
    )
}

export function PainelAparelhos({ aparelhos, disponiveis, search, setSearch, page, totalPages, setPage, selectedId, onSelect }: Props) {
    const isFirstPage = page === 0
    const isLastPage = page >= totalPages - 1
    const disponiveisFiltrados = aparelhos.filter(d => d.situacao === 'DISPONIVEL')

    return (
        <div className={styles.column}>
            <div className={styles.columnHead}>
                <span className={styles.columnTitle}>2. Selecione um aparelho</span>
                <span className={styles.columnBadge}>{disponiveis} disponíveis</span>
            </div>

            <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </span>
                <input
                    className={styles.searchInput}
                    placeholder="Buscar modelo, serial ou TAG"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className={styles.list}>
                {disponiveisFiltrados.length === 0 && (
                    <div className={styles.emptyState}>Nenhum aparelho encontrado.</div>
                )}

                {disponiveisFiltrados.map(d => (
                    <button
                        key={d.id}
                        type="button"
                        className={`${styles.listItem} ${selectedId === d.id ? styles.listItemSelected : ''}`}
                        onClick={() => onSelect(d)}
                    >
                        <DeviceIcon />
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{d.model ?? '—'}</span>
                            <span className={styles.itemMeta}>{d.manufacturer ?? '—'}</span>
                        </div>
                        <div className={styles.deviceMeta}>
                            <span className={styles.deviceMetaPrimary}>Serial {d.serialNumber ?? '—'}</span>
                            <span className={styles.deviceMetaSecondary}>{d.tagDevice ?? '—'} · ID {d.pulsusId}</span>
                        </div>
                        <span className={`${styles.radio} ${selectedId === d.id ? styles.radioChecked : ''}`} />
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
