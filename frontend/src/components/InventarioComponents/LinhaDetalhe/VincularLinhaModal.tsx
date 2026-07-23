import { useEffect, useState } from 'react'
import type { Funcionario } from '../../../types'
import { listFuncionarios } from '../../../services/FuncionarioService/funcionarioApi'
import { vincularLinha } from '../../../services/LinhaService/linhaApi'
import { getInitials } from '../../../utils/format'
import styles from './VincularLinhaModal.module.css'

type Props = {
    lineId: number
    onClose: () => void
    onSuccess: () => void
}

export function VincularLinhaModal({ lineId, onClose, onSuccess }: Props) {
    const [search, setSearch] = useState('')
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [selecionado, setSelecionado] = useState<Funcionario | null>(null)
    const [buscando, setBuscando] = useState(false)
    const [vinculando, setVinculando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        setBuscando(true)
        const timer = setTimeout(() => {
            listFuncionarios('ALL', search, 0)
                .then(res => setFuncionarios(res.content))
                .catch(() => setFuncionarios([]))
                .finally(() => setBuscando(false))
        }, 400)

        return () => clearTimeout(timer)
    }, [search])

    async function handleConfirmar() {
        if (!selecionado) return
        setError('')
        setVinculando(true)

        try {
            await vincularLinha(lineId, selecionado.id)
            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao vincular linha')
        } finally {
            setVinculando(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Vincular funcionário</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.searchWrap}>
                    <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className={styles.searchInput}
                        placeholder="Buscar por nome ou e-mail"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className={styles.list}>
                    {!buscando && funcionarios.length === 0 && (
                        <div className={styles.emptyState}>Nenhum funcionário encontrado.</div>
                    )}

                    {funcionarios.map(f => (
                        <button
                            key={f.id}
                            type="button"
                            className={`${styles.listItem} ${selecionado?.id === f.id ? styles.listItemSelected : ''}`}
                            onClick={() => setSelecionado(f)}
                        >
                            <span className={styles.avatar}>{getInitials(f.name)}</span>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{f.name}</span>
                                <span className={styles.itemMeta}>{f.department ?? '—'} · {f.position ?? '—'}</span>
                            </div>
                            <span className={`${styles.radio} ${selecionado?.id === f.id ? styles.radioChecked : ''}`} />
                        </button>
                    ))}
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.footer}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={vinculando}>
                        Cancelar
                    </button>
                    <button type="button" className={styles.submitBtn} onClick={handleConfirmar} disabled={!selecionado || vinculando}>
                        {vinculando ? 'Vinculando…' : 'Vincular'}
                    </button>
                </div>
            </div>
        </div>
    )
}
