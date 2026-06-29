import { useState } from "react"
import type { User } from '../../types'
import styles from "../../pages/Tickets/style.module.css"
import { createTicket, uploadTicketAttachment } from "../../services/TicketServices/ticketsApi"

type Props = {
    open: boolean
    onClose: () => void
    onCreated: () => Promise<void>
    allUsers: User[]
    user: {
        name: string
        role: string
        sub: string
    } | null
}

export function TicketModal({
    open,
    onClose,
    onCreated,
    allUsers,
    user,
}: Props) {
    const [titulo, setTitulo] = useState('')
    const [descricao, setDescricao] = useState('')
    const [departamento, setDepartamento] = useState('')
    const [pessoa, setPessoa] = useState('')
    const [solicitante, setSolicitante] = useState('')
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [saving, setSaving] = useState(false)
    const [modalError, setModalError] = useState('')

    if (!open) return null

    function handleClose() {
        onClose()
        setTitulo('')
        setDescricao('')
        setDepartamento('')
        setPessoa('')
        setSolicitante('')
        setPendingFiles([])
        setModalError('')
    }

    function addFiles(newFiles: FileList | null) {
        if (!newFiles) return
        setPendingFiles(prev => [...prev, ...Array.from(newFiles)])
    }

    function removeFile(index: number) {
        setPendingFiles(prev => prev.filter((_, i) => i !== index))
    }

    async function handleSendForm() {
        setModalError('')

        if (!titulo.trim()) {
            setModalError('Informe um título.')
            return
        }

        if (!descricao.trim()) {
            setModalError('Informe uma descrição.')
            return
        }

        if (!departamento && !pessoa) {
            setModalError('Selecione um departamento ou uma pessoa.')
            return
        }

        setSaving(true)

        try {
            const body =
                user?.role === 'ADMIN'
                    ? {
                        title: titulo,
                        description: descricao,
                        department: departamento || null,
                        assignedToId: pessoa ? Number(pessoa) : null,
                        applicantId: solicitante ? Number(solicitante) : null,
                    }
                    : {
                        title: titulo,
                        description: descricao,
                        department: departamento || null,
                        assignedToId: pessoa ? Number(pessoa) : null,
                    }

            const created = await createTicket(body)

            for (const file of pendingFiles) {
                await uploadTicketAttachment(created.id, file)
            }

            await onCreated()
            handleClose()
        } catch (err) {
            setModalError(err instanceof Error ? err.message : 'Erro ao abrir ticket.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Novo ticket</h2>
                    <button onClick={handleClose} className={styles.closeBtn} disabled={saving}>x</button>
                </div>

                <div className={styles.form}>

                    <div className={styles.field}>
                        <label className={styles.label}>Título <span className={styles.required}>*</span></label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Resumo do problema ou solicitação"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Descrição <span className={styles.required}>*</span></label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Descreva com detalhes o que precisa ser resolvido..."
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Departamento</label>
                        <select
                            value={departamento}
                            onChange={e => setDepartamento(e.target.value)}
                            className={styles.select}
                            disabled={saving}
                        >
                            <option value="">Selecione um departamento...</option>
                            <option value="TI">TI</option>
                            <option value="RH">RH</option>
                            <option value="DP">DP</option>
                            <option value="OPERACAO">Operação</option>
                        </select>
                    </div>

                    <div className={styles.divider}>ou direcionar para uma pessoa</div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            Pessoa <span className={styles.optional}>(opcional)</span>
                        </label>
                        <select
                            value={pessoa}
                            onChange={e => setPessoa(e.target.value)}
                            className={styles.select}
                            disabled={saving}
                        >
                            <option value="">Selecione uma pessoa...</option>
                            {allUsers
                                .filter(u => u.email !== user?.sub)
                                .map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    {user?.role === "ADMIN" && (
                        <>
                            <div className={styles.divider}>Representando outro usuário</div>

                            <div className={styles.field}>
                                <label className={styles.label}>
                                    Solicitante <span className={styles.optional}>(opcional)</span>
                                </label>
                                <select
                                    value={solicitante}
                                    onChange={e => setSolicitante(e.target.value)}
                                    className={styles.select}
                                    disabled={saving}
                                >
                                    <option value="">Selecione uma pessoa...</option>
                                    {allUsers
                                        .filter(u => u.email !== user?.sub)
                                        .map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </>
                    )}

                    <p className={styles.hint}>
                        Informe ao menos um destino: departamento, pessoa, ou ambos.
                    </p>

                    <div className={styles.field}>
                        <label className={styles.label}>Anexos <span className={styles.optional}>(opcional)</span></label>

                        <div className={styles.uploadOptions}>
                            <label className={styles.uploadOption}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className={styles.uploadOptionTitle}>Selecionar arquivo</span>
                                <input type="file" className={styles.fileInput} multiple
                                    onChange={e => addFiles(e.target.files)} disabled={saving} />
                            </label>

                            <div className={styles.uploadDivider} />

                            <label className={styles.uploadOption}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                                <span className={styles.uploadOptionTitle}>Tirar foto</span>
                                <input type="file" className={styles.fileInput} accept="image/*" capture="environment"
                                    onChange={e => addFiles(e.target.files)} disabled={saving} />
                            </label>
                        </div>

                        {pendingFiles.length > 0 && (
                            <ul className={styles.fileList}>
                                {pendingFiles.map((file, i) => (
                                    <li key={i} className={styles.fileItem}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                                                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                        </svg>
                                        <span className={styles.fileName}>{file.name}</span>
                                        <button type="button" className={styles.fileRemove}
                                            onClick={() => removeFile(i)} disabled={saving}>x</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {modalError && <p className={styles.errorMsg}>{modalError}</p>}

                    <div className={styles.footer}>
                        <button onClick={handleClose} className={styles.cancelBtn} disabled={saving}>Cancelar</button>
                        <button onClick={handleSendForm} className={styles.submitBtn} disabled={saving}>
                            {saving ? 'Abrindo...' : 'Abrir ticket'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
