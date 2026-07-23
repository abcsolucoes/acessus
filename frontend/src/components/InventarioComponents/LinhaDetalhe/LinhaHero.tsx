import { useState } from "react"
import type { Line, LineStatus, LineType } from "../../../types"
import { atualizarStatusLinha } from "../../../services/LinhaService/linhaApi"
import styles from "./LinhaHero.module.css"

const STATUS_LABEL: Record<LineStatus, string> = {
    IN_USE: 'Em uso',
    AVAILABLE: 'Disponível',
    REACTIVATE: 'Reativar',
    UNAVAILABLE: 'Indisponível',
}

const TYPE_LABEL: Record<LineType, string> = {
    CHIP: 'Chip físico',
    ESIM: 'eSIM',
}

const STATUS_CLASS: Record<LineStatus, string> = {
    IN_USE: styles.badgeSuccess,
    AVAILABLE: styles.badgeNeutral,
    REACTIVATE: styles.badgeWarning,
    UNAVAILABLE: styles.badgeDanger,
}

// "Em uso" só é definido vinculando um funcionário (ver LinhaFuncionario) — aqui só
// se escolhe entre os outros três
const STATUS_OPTIONS: LineStatus[] = ['AVAILABLE', 'REACTIVATE', 'UNAVAILABLE']

function LineIcon() {
    return <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
}

type Props = { linha: Line, onAlterado: () => void }

export function LinhaHero({ linha, onAlterado }: Props) {
    const [changing, setChanging] = useState(false)

    async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const novoStatus = e.target.value as LineStatus
        if (novoStatus === linha.status) return

        setChanging(true)
        try {
            await atualizarStatusLinha(linha.id, novoStatus)
            onAlterado()
        } finally {
            setChanging(false)
        }
    }

    return (
        <section className={styles.hero}>
            <div className={styles.heroLeft}>
                <span className={styles.avatar}><LineIcon /></span>
                <div className={styles.heroInfo}>
                    <h1 className={styles.name}>{linha.number}</h1>
                    <span className={styles.roleLine}>Linha corporativa · {TYPE_LABEL[linha.type]}</span>
                    <div className={styles.badgeRow}>
                        <span className={`${styles.badge} ${STATUS_CLASS[linha.status]}`}>{STATUS_LABEL[linha.status]}</span>
                        {(linha.iccid || linha.type === 'ESIM') && (
                            <span className={styles.companyMeta}>Chip {linha.type === 'ESIM' ? 'eSIM' : linha.iccid}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.heroActions}>
                <label className={styles.statusEditorLabel} htmlFor="linha-status-select">Alterar status</label>
                <select
                    id="linha-status-select"
                    className={styles.statusSelect}
                    value={linha.status === 'IN_USE' ? '' : linha.status}
                    onChange={handleStatusChange}
                    disabled={changing}
                >
                    {linha.status === 'IN_USE' && <option value="" disabled>Em uso (vinculada)</option>}
                    {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                </select>
                {linha.status === 'IN_USE' && (
                    <span className={styles.statusHint}>Desvincula o funcionário atual</span>
                )}
            </div>
        </section>
    )
}
