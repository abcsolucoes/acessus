import styles from "../../../pages/Inventario/Alocacao/style.module.css"
import type { Device, Funcionario } from "../../../types"
import { getInitials } from "../../../utils/format"

type Props = {
    funcionario: Funcionario | null
    aparelho: Device | null
    vinculando: boolean
    onVincular: () => void
}

export function BarraVinculo({ funcionario, aparelho, vinculando, onVincular }: Props) {
    const podeVincular = funcionario !== null && aparelho !== null && !vinculando

    return (
        <div className={styles.footerBar}>
            <div className={styles.footerSelection}>
                {funcionario ? (
                    <span className={styles.footerChip}>
                        <span className={styles.avatar}>{getInitials(funcionario.name)}</span>
                        {funcionario.name}
                    </span>
                ) : (
                    <span className={`${styles.footerChip} ${styles.footerChipEmpty}`}>Selecione um funcionário</span>
                )}

                <span className={styles.footerArrow}>
                    Vincular a
                    <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </span>

                {aparelho ? (
                    <span className={styles.footerChip}>
                        <span className={styles.deviceIcon}>
                            <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                        </span>
                        {aparelho.model ?? 'Aparelho'} · {aparelho.tagDevice ?? '—'}
                    </span>
                ) : (
                    <span className={`${styles.footerChip} ${styles.footerChipEmpty}`}>Selecione um aparelho</span>
                )}
            </div>

            <button type="button" className={styles.confirmBtn} disabled={!podeVincular} onClick={onVincular}>
                {vinculando ? 'Vinculando…' : 'Vincular aparelho'}
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>

            {funcionario && funcionario.devices.length > 0 && (
                <span className={styles.footerWarning}>
                    <svg viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    {funcionario.name.split(' ')[0]} já possui {funcionario.devices.length === 1 ? '1 aparelho vinculado' : `${funcionario.devices.length} aparelhos vinculados`}. Ao confirmar, ficará com mais de um até você desvincular o antigo.
                </span>
            )}

            <span className={styles.footerNote}>
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>
                A alteração será registrada no histórico.
            </span>
        </div>
    )
}
