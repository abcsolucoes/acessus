import { useState } from "react"
import { apiFetch, authHeaders } from "../../../services/api"
import type { Field } from "../../../types"
import styles from './style.module.css'

type Props = {
    onClose: () => void
    onSuccess: (field: Field) => void
    candidateId?: number   // undefined = campo padrão, número = campo do candidato
    initialField?: Field   // presente = modo edição (PUT em vez de POST)
}

const FIELD_TYPE_LABEL: Record<string, string> = {
    TEXT: 'Texto',
    DOC: 'Documento',
    DATE: 'Data',
    SELECT: 'Seleção (opções fixas)',
}

export function FieldModal({ onClose, onSuccess, candidateId, initialField }: Props) {
    const isEditing = !!initialField

    const [fieldName, setFieldName] = useState(initialField?.fieldName ?? '')
    const [fieldType, setFieldType] = useState<'TEXT' | 'DOC' | 'DATE' | 'SELECT'>(initialField?.fieldType ?? 'TEXT')
    const [fieldSize, setFieldSize] = useState<'MEDIUM' | 'BIG'>(initialField?.fieldSize ?? 'MEDIUM')
    const [step, setStep] = useState(initialField?.step ?? 'personalData')
    const [enabled, setEnabled] = useState(initialField?.enabled ?? true)
    const [fieldOptions, setFieldOptions] = useState(initialField?.fieldOptions ?? '')
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
        if (fieldType === 'SELECT' && fieldOptions.trim().length === 0) {
            setError('Informe ao menos uma opção, separadas por vírgula')
            setLoading(false)
            return
        }

        try {
            const options = fieldType === 'SELECT' ? fieldOptions.trim() : null

            const data = isEditing
                ? await apiFetch<Field>(`/field/${initialField!.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify({
                        fieldName: fieldName.trim(),
                        enabled,
                        fieldSize,
                        step,
                        fieldOptions: options,
                    }),
                })
                : await apiFetch<Field>('/field/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify({
                        fieldName: fieldName.trim(),
                        fieldType,
                        fieldSize,
                        step,
                        enabled,
                        candidateId: candidateId ?? null,
                        fieldOptions: options,
                    }),
                })

            onSuccess(data)   // ← passa o campo criado/editado de volta
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : `Erro ao ${isEditing ? 'salvar' : 'criar'} campo`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{isEditing ? 'Editar campo' : 'Novo campo'}</h2>
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
                        {isEditing ? (
                            <input value={FIELD_TYPE_LABEL[fieldType]} disabled />
                        ) : (
                            <select
                                value={fieldType}
                                onChange={e => setFieldType(e.target.value as 'TEXT' | 'DOC' | 'DATE' | 'SELECT')}
                                disabled={loading}
                            >
                                <option value="TEXT">Texto</option>
                                <option value="DOC">Documento</option>
                                <option value="DATE">Data</option>
                                <option value="SELECT">Seleção (opções fixas)</option>
                            </select>
                        )}
                    </div>

                    {fieldType === 'SELECT' && (
                        <div>
                            <label>Opções (separadas por vírgula)</label>
                            <input
                                placeholder="Ex: Pai/Mãe,Irmão(ã),Cônjuge,Outro"
                                value={fieldOptions}
                                onChange={e => setFieldOptions(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    )}

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
                            onChange={e => setStep(e.target.value as Field['step'])}
                            disabled={loading}
                        >
                            <option value="personalData">Dados pessoais</option>
                            <option value="address">Endereço</option>
                            <option value="docs">Documentos</option>
                            <option value="dependentsDocs">Docs. dependentes</option>
                            <option value="bankDetails">Dados bancários</option>
                            <option value="transport">Transporte</option>
                            <option value="emergencyContact">Contato de emergência</option>
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
                        {loading ? (isEditing ? 'Salvando…' : 'Criando…') : (isEditing ? 'Salvar' : 'Criar campo')}
                    </button>

                </form>
            </div>
        </div>
    )
}
