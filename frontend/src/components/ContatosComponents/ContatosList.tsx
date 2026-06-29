import type { Dispatch, SetStateAction } from "react"
import styles from "../../pages/Contatos/style.module.css"
import type { Contact } from "../../types"
import { waNumero } from "../../utils/format"

type Props = {
    filtered: Contact[]
    setModalData: Dispatch<SetStateAction<Contact | 'new' | null>>
    onDelete: (resourceName: string) => void
}

export function ContatosList({ filtered, setModalData, onDelete }: Props) {
    if (filtered.length === 0) {
        return <p className={styles.empty}>Nenhum contato encontrado.</p>
    }

    return (
        <div className={styles.grid}>
            {filtered.map(c => (
                <div key={c.resourceName} className={styles.card}>

                    <div className={styles.avatar}>
                        {c.name.charAt(0).toUpperCase()}
                    </div>

                    <div className={styles.cardBody}>
                        <span className={styles.cardName}>{c.name}</span>
                        <span className={styles.cardDetail}>{c.telephone}</span>
                        <span className={styles.cardDetail}>{c.email}</span>
                    </div>

                    <div className={styles.cardActions}>
                        {c.telephone && (
                            <a
                                className={styles.waBtn}
                                href={`https://wa.me/${waNumero(c.telephone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir no WhatsApp"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.42A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.073-1.117l-.292-.173-3.032.865.867-3.003-.19-.307A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8zm4.406-5.932c-.242-.121-1.43-.706-1.652-.786-.22-.08-.382-.12-.543.12-.16.242-.624.786-.765.947-.14.162-.281.182-.523.061-.242-.121-1.02-.376-1.942-1.197-.718-.64-1.202-1.43-1.343-1.671-.14-.242-.015-.373.106-.493.109-.108.242-.282.363-.423.12-.14.16-.242.242-.403.08-.161.04-.302-.02-.423-.061-.12-.543-1.31-.744-1.794-.196-.471-.396-.407-.543-.415l-.463-.008a.888.888 0 00-.644.302c-.221.242-.845.826-.845 2.015s.865 2.337.986 2.498c.12.16 1.702 2.6 4.126 3.646.576.249 1.026.397 1.376.508.578.184 1.105.158 1.521.096.464-.069 1.43-.585 1.631-1.15.2-.564.2-1.047.14-1.148-.06-.1-.221-.161-.463-.282z" />
                                </svg>
                            </a>
                        )}
                        <button className={styles.editBtn} onClick={() => setModalData(c)}>
                            Editar
                        </button>
                        <button className={styles.deleteBtn} onClick={() => onDelete(c.resourceName)}>
                            Excluir
                        </button>
                    </div>

                </div>
            ))}
        </div>
    )
}