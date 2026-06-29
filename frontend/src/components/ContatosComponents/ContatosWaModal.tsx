import type { Dispatch, SetStateAction } from "react"
import styles from "../../pages/Contatos/style.module.css"
import type { Contact } from "../../types"
import { waNumero } from "../../utils/format"

type Props = {
    setWaContact: Dispatch<SetStateAction<Contact | null>>
    waContact: Contact | null
}

export function ContatosWaModal({ setWaContact, waContact }: Props) {
    if (!waContact) return null
    return (
        <div className={styles.waOverlay} onClick={() => setWaContact(null)}>
            <div className={styles.waModal} onClick={e => e.stopPropagation()}>

                <div className={styles.waIcon}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                        <circle cx="22" cy="22" r="22" fill="#25D366" />
                        <path d="M22 8C14.268 8 8 14.268 8 22c0 2.538.686 4.918 1.882 6.962L8 36l7.22-1.854A13.94 13.94 0 0022 36c7.732 0 14-6.268 14-14S29.732 8 22 8zm7.3 19.77c-.32-.16-1.9-.938-2.195-1.044-.295-.107-.51-.16-.724.16-.215.32-.83 1.044-1.018 1.258-.187.215-.375.24-.695.08-.32-.16-1.35-.498-2.572-1.588-.95-.848-1.593-1.895-1.78-2.215-.187-.32-.02-.493.14-.652.145-.143.32-.375.48-.562.16-.188.213-.32.32-.535.107-.214.053-.401-.027-.562-.08-.16-.724-1.742-.991-2.384-.261-.626-.527-.54-.724-.55l-.616-.01a1.18 1.18 0 00-.856.4c-.294.32-1.124 1.099-1.124 2.68s1.151 3.108 1.311 3.322c.16.214 2.266 3.46 5.49 4.851.767.33 1.366.528 1.833.676.77.245 1.47.21 2.024.127.617-.092 1.9-.777 2.168-1.527.267-.75.267-1.393.187-1.527-.08-.133-.294-.214-.615-.374z" fill="white" />
                    </svg>
                </div>

                <h3 className={styles.waTitle}>Contato cadastrado!</h3>
                <p className={styles.waMessage}>
                    Deseja iniciar uma conversa com <strong>{waContact.name}</strong> no WhatsApp?
                </p>
                {waContact.telephone && (
                    <p className={styles.waPhone}>{waContact.telephone}</p>
                )}

                <div className={styles.waFooter}>
                    <button className={styles.waSkipBtn} onClick={() => setWaContact(null)}>
                        Agora não
                    </button>
                    {waContact.telephone && (
                        <a
                            className={styles.waOpenBtn}
                            href={`https://wa.me/${waNumero(waContact.telephone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setWaContact(null)}
                        >
                            Abrir no WhatsApp
                        </a>
                    )}
                </div>

            </div>
        </div>
    )
}