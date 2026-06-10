import { useState } from "react"
import { apiFetch, authHeaders } from "../../../services/api"
import type { Field } from "../../../types"
import styles from './style.module.css'

type Props = {
    onClose: () => void
    onSuccess: (field: Field) => void
    candidateId?: number   // undefined = campo padrão, número = campo do candidato
}

export function FieldModal({ onClose, onSuccess, candidateId }: Props) {
    const [fieldName, setFieldName] = useState('')
    const [fieldType, setFieldType] = useState<'TEXT' | 'DOC' | 'DATE'>('TEXT')
    const [fieldSize, setFieldSize] = useState<'MEDIUM' | 'BIG'>('MEDIUM')
    const [step, setStep] = useState('personalData')
    const [enabled, setEnabled] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')       // ← limpa erro antes de validar
        setLoading(true)   // ← ativa loading antes da requisição

        // ── Validações ──────────────────────────────────────
        if (fieldName.trim().length < 2) {
            setError('Nome do campo deve ter pelo menos 2 caracteres')
            setLoading(false)
            return
        }
        if (fieldName.trim().length > 100) {
            setError('Nome do campo deve ter no máximo 100 caracteres')
            setLoading(false)
            return
        }

        try {
            const data = await apiFetch<Field>('/field/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    fieldName: fieldName.trim(),
                    fieldType,
                    fieldSize,
                    step,
                    enabled,
                    candidateId: candidateId ?? null,
                }),
            })

            onSuccess(data)   // ← passa o campo criado de volta pro RHCamposPage
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar campo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Novo campo</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>

                    <div>
                        <label>Nome do campo</label>
                        <input
                            placeholder="Ex: RG, Comprovante de residência..."
                            value={fieldName}
                            onChange={e => setFieldName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label>Tipo</label>
                        <select
                            value={fieldType}
                            onChange={e => setFieldType(e.target.value as 'TEXT' | 'DOC' | 'DATE')}
                            disabled={loading}
                        >
                            <option value="TEXT">Texto</option>
                            <option value="DOC">Documento</option>
                            <option value="DATE">Data</option>
                        </select>
                    </div>

                    <div>
                        <label>Tamanho</label>
                        <select
                            value={fieldSize}
                            onChange={e => setFieldSize(e.target.value as 'MEDIUM' | 'BIG')}
                            disabled={loading}
                        >
                            <option value="MEDIUM">Médio</option>
                            <option value="BIG">Grande</option>
                        </select>
                    </div>

                    <div>
                        <label>Etapa do formulário</label>
                        <select
                            value={step}
                            onChange={e => setStep(e.target.value)}
                            disabled={loading}
                        >
                            <option value="personalData">Dados pessoais</option>
                            <option value="address">Endereço</option>
                            <option value="docs">Documentos</option>
                            <option value="dependentsDocs">Docs. dependentes</option>
                            <option value="bankDetails">Dados bancários</option>
                        </select>
                    </div>

                    <div className={styles.checkboxRow}>
                        <input
                            id="enabled"
                            type="checkbox"
                            checked={enabled}
                            onChange={e => setEnabled(e.target.checked)}
                            disabled={loading}
                        />
                        <label htmlFor="enabled">Campo ativo</label>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Criando…' : 'Criar campo'}
                    </button>

                </form>
            </div>
        </div>
    )
}