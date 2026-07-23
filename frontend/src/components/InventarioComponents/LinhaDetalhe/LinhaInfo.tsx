import { useState } from "react"
import type { Line } from "../../../types"
import { atualizarObservacoesLinha } from "../../../services/LinhaService/linhaApi"
import styles from "./LinhaInfo.module.css"

type Props = { linha: Line, onAlterado: () => void }

function CopyButton({ value }: { value: string }) {
    const [copiado, setCopiado] = useState(false)

    function handleCopiar() {
        navigator.clipboard.writeText(value).then(() => {
            setCopiado(true)
            setTimeout(() => setCopiado(false), 1500)
        })
    }

    return (
        <button type="button" className={styles.copyBtn} onClick={handleCopiar} title="Copiar">
            {copiado ? (
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
                <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            )}
        </button>
    )
}

export function LinhaInfo({ linha, onAlterado }: Props) {
    const [editing, setEditing] = useState(false)
    const [notes, setNotes] = useState(linha.notes ?? '')
    const [saving, setSaving] = useState(false)

    const chipValue = linha.type === 'ESIM' ? 'eSIM' : (linha.iccid ?? '—')

    function handleEditar() {
        setNotes(linha.notes ?? '')
        setEditing(true)
    }

    async function handleSalvar() {
        setSaving(true)
        try {
            await atualizarObservacoesLinha(linha.id, notes.trim())
            onAlterado()
            setEditing(false)
        } finally {
            setSaving(false)
        }
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                Informações
            </h2>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Número</span>
                    <div className={styles.infoValueRow}>
                        <span className={styles.infoValue}>{linha.number}</span>
                        <CopyButton value={linha.number} />
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Chip (ICCID)</span>
                    <div className={styles.infoValueRow}>
                        <span className={styles.infoValue}>{chipValue}</span>
                        {linha.type !== 'ESIM' && linha.iccid && <CopyButton value={linha.iccid} />}
                    </div>
                </div>
            </div>

            <div className={styles.notesBox}>
                <div className={styles.notesHeader}>
                    <span className={styles.notesLabel}>
                        <svg className={styles.notesIcon} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        Observações
                    </span>
                    {!editing && (
                        <button type="button" className={styles.editBtn} onClick={handleEditar}>
                            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
                            Editar
                        </button>
                    )}
                </div>

                {editing ? (
                    <div className={styles.editForm}>
                        <textarea
                            className={styles.notesInput}
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Alguma observação sobre essa linha..."
                            autoFocus
                        />
                        <div className={styles.editActions}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)} disabled={saving}>
                                Cancelar
                            </button>
                            <button type="button" className={styles.saveBtn} onClick={handleSalvar} disabled={saving}>
                                {saving ? 'Salvando…' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className={linha.notes ? styles.notesText : styles.notesEmpty}>
                        {linha.notes || 'Nenhuma observação registrada.'}
                    </p>
                )}
            </div>
        </section>
    )
}
