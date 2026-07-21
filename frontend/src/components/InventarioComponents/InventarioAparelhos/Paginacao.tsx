import styles from "../../../pages/Inventario/Aparelhos/style.module.css"

type Props = {
    page: number
    totalPages: number
    setPage: (page: number) => void
}

export function Paginacao({ page, totalPages, setPage }: Props) {
    const isFirstPage = page === 0
    const isLastPage = page >= totalPages - 1

    return (
        <div className={styles.pagination}>
            <button
                className={styles.pageBtn}
                disabled={isFirstPage}
                onClick={() => setPage(page - 1)}
            >
                ← Anterior
            </button>
            <span className={styles.pageInfo}>
                Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
            </span>
            <button
                className={styles.pageBtn}
                disabled={isLastPage}
                onClick={() => setPage(page + 1)}
            >
                Próxima →
            </button>
        </div>
    )
}
