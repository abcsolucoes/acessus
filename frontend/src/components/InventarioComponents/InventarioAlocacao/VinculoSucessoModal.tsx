import { useState } from 'react'
import { baixarContratoComodato } from '../../../services/AparelhoService/aparelhoApi'
import styles from './VinculoSucessoModal.module.css'

type Props = {
    funcionarioName: string
    departamento: string | null
    aparelhoLabel: string
    pulsusId: number
    deviceId: number
    onClose: () => void
    onDownloadError: () => void
}

const YOUK_URL = 'https://manager.youk.com.br/envioDocs'

export function VinculoSucessoModal({ funcionarioName, departamento, aparelhoLabel, pulsusId, deviceId, onClose, onDownloadError }: Props) {
    const [baixando, setBaixando] = useState(false)

    async function handleBaixarContrato() {
        setBaixando(true)
        try {
            await baixarContratoComodato(deviceId)
        } catch {
            onDownloadError()
        } finally {
            setBaixando(false)
        }
    }

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
                    </p>
                </div>

                <div className={styles.nextSteps}>
                    <div className={styles.step}>
                        <div className={styles.stepLeft}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <div className={styles.stepLabelWrap}>
                                <span>Contrato de comodato</span>
                                <span className={styles.stepHint}>Gera o PDF com os dados de {funcionarioName.split(' ')[0]} e do aparelho</span>
                            </div>
                        </div>
                        <button type="button" className={styles.stepBtn} onClick={handleBaixarContrato} disabled={baixando}>
                            {baixando ? 'Gerando…' : 'Baixar PDF'}
                        </button>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepLeft}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M22 2 11 13" />
                                <path d="M22 2 15 22 11 13 2 9z" />
                            </svg>
                            <div className={styles.stepLabelWrap}>
                                <span>Documentos no Youk</span>
                                <span className={styles.stepHint}>Envie o contrato assinado pelo portal</span>
                            </div>
                        </div>
                        <a className={styles.stepBtn} href={YOUK_URL} target="_blank" rel="noopener noreferrer">
                            Abrir
                        </a>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepLeft}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="5" y="2" width="14" height="20" rx="2" />
                                <line x1="12" y1="18" x2="12" y2="18" />
                            </svg>
                            <div className={styles.stepLabelWrap}>
                                <span>Grupo no Pulsus</span>
                                <span className={styles.stepHint}>Mova o aparelho pra "{departamento ?? '—'}" — a API não faz isso automaticamente</span>
                            </div>
                        </div>
                        <a className={styles.stepBtn} href={`https://app.pulsus.mobi/devices/${pulsusId}`} target="_blank" rel="noopener noreferrer">
                            Abrir
                        </a>
                    </div>
                </div>

                <button type="button" className={styles.closeBtn} onClick={onClose}>
                    Fechar
                </button>

            </div>
        </div>
    )
}
