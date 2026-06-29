import type { Dispatch, SetStateAction } from "react"
import styles from "../../pages/Contatos/style.module.css"
import type { Contact } from "../../types"

type Props = {
    setModalData: Dispatch<SetStateAction<Contact | 'new' | null>>
}

export function ContatosHeaderPage({setModalData}: Props) {
    return (
        <div className={styles.top}>
            <h1 className={styles.title}>Contatos</h1>
            <div className={styles.topActions}>
                <button className={styles.addBtn} onClick={() => setModalData('new')}>
                    + Novo contato
                </button>
            </div>
        </div>
    )
}