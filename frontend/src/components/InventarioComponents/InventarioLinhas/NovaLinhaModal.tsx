import { useState } from 'react'
import type { LineType } from '../../../types'
import { criarLinha } from '../../../services/LinhaService/linhaApi'
import styles from './NovaLinhaModal.module.css'

type Props = {
    onClose: () => void
    onSuccess: () => void
}

const TYPE_OPTIONS: { value: LineType; label: string }[] = [
    { value: 'CHIP', label: 'Chip físico' },
    { value: 'ESIM', label: 'eSIM' },
]

export function NovaLinhaModal({ onClose, onSuccess }: Props) {
    const [number, setNumber] = useState('')
    const [iccid, setIccid] = useState('')
    const [type, setType] = useState<LineType>('CHIP')
    const [notes, setNotes] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (number.trim().length < 8) { setError('Número inválido'); return }

        setLoading(true)

        try {
            await criarLinha({
                number: number.trim(),
                iccid: iccid.trim() || undefined,
                type,
                notes: notes.trim() || undefined,
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao cadastrar linha')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Nova linha</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label>Número <span className={styles.required}>*</span></label>
                        <input
                            placeholder="(31) 99999-9999"
                            value={number}
                            onChange={e => setNumber(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Tipo <span className={styles.required}>*</span></label>
                        <select value={type} onChange={e => setType(e.target.value as LineType)}>
                            {TYPE_OPTIONS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Chip (ICCID) <span className={styles.optional}>(opcional)</span></label>
                        <input
                            placeholder="8955 0000 0000 0000"
                            value={iccid}
                            onChange={e => setIccid(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Observações <span className={styles.optional}>(opcional)</span></label>
                        <textarea
                            placeholder="Alguma observação sobre essa linha..."
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Cadastrando…' : 'Cadastrar linha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
