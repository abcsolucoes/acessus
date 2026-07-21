import styles from "../../../pages/Inventario/Movimentacoes/style.module.css"

export function Filtro() {
    return (
        <div className={styles.filters}>
            <div className={styles.filterField}>
                <span className={styles.filterLabel}>Buscar</span>
                <div className={styles.searchWrap}>
                    <span className={styles.searchIcon}>
                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input className={styles.filterInput} placeholder="Funcionário ou aparelho..." />
                </div>
            </div>

            <div className={styles.filterFieldNarrow}>
                <span className={styles.filterLabel}>De</span>
                <input type="date" className={styles.filterInput} />
            </div>

            <div className={styles.filterFieldNarrow}>
                <span className={styles.filterLabel}>Até</span>
                <input type="date" className={styles.filterInput} />
            </div>

            <div className={styles.pillGroup}>
                <button className={`${styles.pillBtn} ${styles.pillBtnActive}`}>Todas</button>
                <button className={styles.pillBtn}>Alocações</button>
                <button className={styles.pillBtn}>Devoluções</button>
            </div>
        </div>
    )
}
