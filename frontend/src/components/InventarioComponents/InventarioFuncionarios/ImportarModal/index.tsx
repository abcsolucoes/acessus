import { useRef, useState } from 'react'
import type { ImportResumo } from '../../../../types'
import { importarFuncionarios } from '../../../../services/FuncionarioService/funcionarioApi'
import styles from './style.module.css'

type Props = {
    onClose: () => void
    onImported: () => void
}

export function ImportarModal({ onClose, onImported }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resultado, setResultado] = useState<ImportResumo | null>(null)

    function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
        setFile(e.target.files?.[0] ?? null)
        setError(null)
    }

    function handleImportar() {
        if (!file) return

        setLoading(true)
        setError(null)

        importarFuncionarios(file)
            .then((res) => {
                setResultado(res)
                onImported()
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                {resultado ? (
                    <>
                        <div className={styles.iconWrap}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <div className={styles.body}>
                            <h2 className={styles.title}>Importação concluída</h2>
                            <p className={styles.desc}>A planilha foi processada com sucesso.</p>
                        </div>

                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{resultado.created}</span>
                                <span className={styles.summaryLabel}>Novos</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryValue}>{resultado.updated}</span>
                                <span className={styles.summaryLabel}>Atualizados</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={`${styles.summaryValue} ${styles.summaryValueWarning}`}>{resultado.flaggedForReview}</span>
                                <span className={styles.summaryLabel}>P/ revisão</span>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button type="button" className={styles.confirmBtn} style={{ flex: 1 }} onClick={onClose}>
                                Concluir
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`${styles.iconWrap} ${error ? styles.iconWrapError : ''}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>

                        <div className={styles.body}>
                            <h2 className={styles.title}>Importar planilha de funcionários</h2>
                            <p className={styles.desc}>
                                Envie o arquivo <strong>.xls</strong> exportado pelo Alter Data (base_inventario). Funcionários existentes são
                                atualizados por CPF; quem sumir da planilha é marcado para revisão.
                            </p>
                        </div>

                        <button type="button" className={styles.dropzone} onClick={() => inputRef.current?.click()}>
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xls"
                                className={styles.hiddenInput}
                                onChange={handleSelect}
                            />
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>{file ? file.name : 'Clique para selecionar o arquivo (.xls)'}</span>
                        </button>

                        {error && <p className={styles.errorMsg}>{error}</p>}

                        <div className={styles.actions}>
                            <button type="button" className={styles.skipBtn} onClick={onClose} disabled={loading}>
                                Cancelar
                            </button>
                            <button type="button" className={styles.confirmBtn} onClick={handleImportar} disabled={!file || loading}>
                                {loading && <span className={styles.spinner} />}
                                {loading ? 'Importando…' : 'Importar'}
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}
