import styles from "../../../pages/Inventario/Linhas/style.module.css"

export function Paginacao() {
    return (
        <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled>
                ← Anterior
            </button>
            <span className={styles.pageInfo}>
                Página 1 de 1
            </span>
            <button className={styles.pageBtn} disabled>
                Próxima →
            </button>
        </div>
    )
}
