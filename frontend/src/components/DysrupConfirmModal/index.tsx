import styles from './style.module.css'

type Props = {
    candidateName: string
    onConfirm: () => void
    onSkip: () => void
    error?: string | null
    loading?: boolean
}

export function DysrupConfirmModal({ candidateName, onConfirm, onSkip, error, loading }: Props) {
    const isConflict = error != null

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <div className={`${styles.iconWrap} ${isConflict ? styles.iconWrapConflict : ''}`}>
                    {isConflict ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                    )}
                </div>

                <div className={styles.body}>
                    {isConflict ? (
                        <>
                            <h2 className={styles.title}>Já cadastrado na Dysrup</h2>
                            <p className={styles.desc}>
                                <strong>{candidateName}</strong> já possui um cadastro na Dysrup com este CPF.
                                Nenhuma alteração foi feita na plataforma.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className={styles.title}>Cadastrar na Dysrup?</h2>
                            <p className={styles.desc}>
                                <strong>{candidateName}</strong> foi cadastrado com sucesso no Acessus.
                                Deseja registrá-lo também na plataforma Dysrup?
                            </p>
                        </>
                    )}
                </div>

                <div className={styles.logoRow}>
                    <img src="/dysrup_logo.png" alt="Dysrup" className={styles.dysrupLogo} />
                </div>

                <div className={styles.actions}>
                    {isConflict ? (
                        <button type="button" className={styles.confirmBtn} style={{ flex: 1 }} onClick={onSkip}>
                            Entendido
                        </button>
                    ) : (
                        <>
                            <button type="button" className={styles.skipBtn} onClick={onSkip} disabled={loading}>
                                Agora não
                            </button>
                            <button type="button" className={styles.confirmBtn} onClick={onConfirm} disabled={loading}>
                                {loading ? (
                                    <span className={styles.spinner} />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                                {loading ? 'Cadastrando…' : 'Sim, cadastrar'}
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}
