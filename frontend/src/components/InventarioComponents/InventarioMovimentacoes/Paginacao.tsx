import type { Dispatch, SetStateAction } from "react"
import styles from "../../../pages/Inventario/Movimentacoes/style.module.css"

type Props = {
    page: number,
    totalPages: number,
    setPage: Dispatch<SetStateAction<number>>
}

export function Paginacao({ page, totalPages, setPage }: Props) {
    return (
        <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(page - 1)}>← Anterior</button>
            <span className={styles.pageInfo}>Página {page + 1} de {totalPages || 1}</span>
            <button className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Próxima →</button>
        </div>
    )
}
