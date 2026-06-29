import type { Dispatch, SetStateAction } from "react"
import styles from "../../pages/Contatos/style.module.css"

type Props = {
    search: string
    setSearch: Dispatch<SetStateAction<string>>
}

export function ContatosSearchBar({setSearch, search}: Props) {
    return (
        <div className={styles.toolbar}>
            <input
                className={styles.search}
                placeholder="Buscar por nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
    )
}