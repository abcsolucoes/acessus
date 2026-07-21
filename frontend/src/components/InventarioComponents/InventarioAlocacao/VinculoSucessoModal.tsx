import styles from './VinculoSucessoModal.module.css'

type Props = {
    funcionarioName: string
    departamento: string | null
    aparelhoLabel: string
    pulsusId: number
    onClose: () => void
}

export function VinculoSucessoModal({ funcionarioName, departamento, aparelhoLabel, pulsusId, onClose }: Props) {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <div className={styles.iconWrap}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>

                <div className={styles.body}>
                    <h2 className={styles.title}>Aparelho vinculado!</h2>
                    <p className={styles.desc}>
                        <strong>{aparelhoLabel}</strong> foi vinculado a <strong>{funcionarioName}</strong>.
                        Lembre-se de mover o grupo pra <strong>"{departamento ?? '—'}"</strong> no Pulsus.
                    </p>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.skipBtn} onClick={onClose}>
                        Fechar
                    </button>
                    <a
                        className={styles.confirmBtn}
                        href={`https://app.pulsus.mobi/devices/${pulsusId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                    >
                        Abrir no Pulsus
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </a>
                </div>

            </div>
        </div>
    )
}
