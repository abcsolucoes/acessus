import type { Dispatch, SetStateAction } from "react"
import type { LogsFilter } from "../../types"
import styles from "../../pages/Logs/Logs.module.css"

type Props = {
    filter: LogsFilter
    setFilter: Dispatch<SetStateAction<LogsFilter>>
    onSearch: () => void
    onClear: () => void
}

export function LogsFilter({ filter, setFilter, onSearch, onClear }: Props) {
    return (
        <div className={styles.filters}>
            <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-name">Usuário</label>
                <input
                    id="filter-name"
                    type="text"
                    className={styles.filterInput}
                    placeholder="Buscar por nome..."
                    value={filter.userName}
                    onChange={e => setFilter(f => ({ ...f, userName: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && onSearch()}
                />
            </div>
            <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-start">De</label>
                <input
                    id="filter-start"
                    type="date"
                    className={styles.filterInput}
                    value={filter.startDate}
                    onChange={e => setFilter(f => ({ ...f, startDate: e.target.value }))}
                />
            </div>
            <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-end">Até</label>
                <input
                    id="filter-end"
                    type="date"
                    className={styles.filterInput}
                    value={filter.endDate}
                    onChange={e => setFilter(f => ({ ...f, endDate: e.target.value }))}
                />
            </div>
            <div className={styles.filterActions}>
                <button type="button" className={styles.clearBtn} onClick={onClear}>Limpar</button>
                <button type="button" className={styles.searchBtn} onClick={onSearch}>Buscar</button>
            </div>
        </div>
    )
}