import type { Device, DeviceSituacao } from "../../../types"
import styles from "./AparelhoHero.module.css"

const SITUACAO_LABEL: Record<DeviceSituacao, string> = {
    EM_USO: 'Em uso',
    DISPONIVEL: 'Disponível',
    MANUTENCAO: 'Em manutenção',
    SEM_USUARIO_IDENTIFICADO: 'Sem usuário identificado',
}

const SITUACAO_CLASS: Record<DeviceSituacao, string> = {
    EM_USO: styles.badgeSuccess,
    DISPONIVEL: styles.badgeNeutral,
    MANUTENCAO: styles.badgeWarning,
    SEM_USUARIO_IDENTIFICADO: styles.badgeDanger,
}

function DeviceIcon() {
    return <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
}

type Props = { aparelho: Device }

export function AparelhoHero({ aparelho }: Props) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroLeft}>
                <span className={styles.avatar}><DeviceIcon /></span>
                <div className={styles.heroInfo}>
                    <h1 className={styles.name}>{aparelho.model ?? 'Aparelho sem modelo'}</h1>
                    <span className={styles.roleLine}>{aparelho.manufacturer ?? '—'} · {aparelho.group ?? 'Sem grupo'}</span>
                    <div className={styles.badgeRow}>
                        <span className={`${styles.badge} ${SITUACAO_CLASS[aparelho.situacao]}`}>{SITUACAO_LABEL[aparelho.situacao]}</span>
                        <span className={styles.companyMeta}>Serial {aparelho.serialNumber ?? '—'}</span>
                    </div>
                </div>
            </div>

            <div className={styles.heroActions}>
                <a
                    className={styles.primaryBtn}
                    href={`https://app.pulsus.mobi/devices/${aparelho.pulsusId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Ver na Pulsus
                </a>
            </div>
        </section>
    )
}
