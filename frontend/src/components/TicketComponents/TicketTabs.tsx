import type { Filter } from "../../hooks/TicketHooks/useTicketsPage"
import styles from "../../pages/Tickets/style.module.css"


type Props = {
    filter: Filter;
    onFilterChange: (filter: Filter) => void;
    isAdmin: boolean
}


export function TicketTabs({ filter, onFilterChange, isAdmin }: Props) {
    return (
        <div className={styles.tabs}>
            <button className={`${styles.tab} ${filter === 'mine' ? styles.tabActive : ''}`} onClick={() => onFilterChange('mine')}>Para mim</button>
            <button className={`${styles.tab} ${filter === 'sector' ? styles.tabActive : ''}`} onClick={() => onFilterChange('sector')}>Meu setor</button>
            <button className={`${styles.tab} ${filter === 'created' ? styles.tabActive : ''}`} onClick={() => onFilterChange('created')}>Abertos por mim</button>
            {isAdmin && (
                <button className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`} onClick={() => onFilterChange('all')}>Todos</button>
            )}
        </div>
    )
}
