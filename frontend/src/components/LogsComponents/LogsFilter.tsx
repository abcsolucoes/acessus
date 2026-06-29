import type { Dispatch, SetStateAction } from "react"
import styles from "../../pages/Logs/Logs.module.css"

type Props = {
    userName: string
    setUserName: Dispatch<SetStateAction<string>>
    startDate: string
    setStartDate: Dispatch<SetStateAction<string>>
    endDate: string
    setEndDate: Dispatch<SetStateAction<string>>
    onSearch: () => void
    onClear: () => void
}

export function LogsFilter({
    userName,
    setUserName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onSearch,
    onClear
}: Props) {
    return (
        <div className={styles.filters}>
            <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-name">Usuário</label>
                <input
                    id="filter-name"
                    type="text"
                    className={styles.filterInput}
                    placeholder="Buscar por nome..."
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && onSearch}
                />
            </div>
            <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-start">De</label>
                <input
                    id="filter-start"
                    type="date"
                    className={styles.filterInput}
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />
            </div>
            <div className={styles.filterField}>
                <label className={styles.filterLabel} htmlFor="filter-end">Até</label>
                <input
                    id="filter-end"
                    type="date"
                    className={styles.filterInput}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />
            </div>
            <div className={styles.filterActions}>
                <button type="button" className={styles.clearBtn} onClick={onClear}>Limpar</button>
                <button type="button" className={styles.searchBtn} onClick={onSearch}>Buscar</button>
            </div>
        </div>
    )
}