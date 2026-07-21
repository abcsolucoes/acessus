import { useState } from "react"
import { Link } from "react-router-dom"
import type { Device, Funcionario } from "../../../types"
import { desvincularAparelho } from "../../../services/AparelhoService/aparelhoApi"
import { DesvincularModal } from "../DesvincularModal"
import styles from "./FuncionarioAparelhos.module.css"

type Props = {
    funcionario: Funcionario | null
    onDesvinculado: () => void
}

export function FuncionarioAparelhos({ funcionario, onDesvinculado }: Props) {
    const [desvincularDevice, setDesvincularDevice] = useState<Device | null>(null)

    async function handleDesvincular() {
        if (!desvincularDevice) return
        await desvincularAparelho(desvincularDevice.id)
        onDesvinculado()
    }

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Aparelhos vinculados</h2>
                <span className={styles.count}>
                    {funcionario?.devices?.length ?? 0}{" "}
                    {funcionario?.devices?.length === 1 ? "aparelho" : "aparelhos"}
                </span>
            </div>

            <div className={styles.deviceList}>
                {funcionario?.devices?.length ? (
                    <div>
                        {/* Renderize os aparelhos aqui */}
                        {funcionario.devices.map((device) => (
                            <div className={styles.deviceCard} key={device.id}>
                                <div className={styles.deviceHeader}>
                                    <span className={styles.deviceIcon}>
                                        <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                                    </span>
                                    <div className={styles.deviceInfo}>
                                        <span className={styles.deviceModel}>{device.model}</span>
                                        <span className={styles.deviceMeta}>{device.manufacturer} · Serial {device.serialNumber}</span>
                                    </div>
                                </div>

                                <div className={styles.deviceSpecs}>
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>ID Pulsus</span>
                                        <span className={styles.specValue}>{device.pulsusId}</span>
                                    </div>
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>TAG</span>
                                        <span className={styles.specValue}>{device.tagDevice ?? '—'}</span>
                                    </div>
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>IMEI 1</span>
                                        <span className={styles.specValue}>{device.imei1 ?? '—'}</span>
                                    </div>
                                    <div className={styles.specItem}>
                                        <span className={styles.specLabel}>IMEI 2</span>
                                        <span className={styles.specValue}>{device.imei2 ?? '—'}</span>
                                    </div>
                                </div>

                                <div className={styles.deviceActions}>
                                    <a
                                        className={styles.deviceActionBtn}
                                        href={`https://app.pulsus.mobi/devices/${device.pulsusId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        Ver no Pulsus
                                    </a>
                                    <Link
                                        className={styles.deviceActionBtn}
                                        to={`/inventario/aparelhos/${device.id}`}
                                    >
                                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                        Detalhes do aparelho
                                    </Link>
                                    <button
                                        className={styles.unlinkBtn}
                                        onClick={() => setDesvincularDevice(device)}
                                    >
                                        <svg viewBox="0 0 24 24"><path d="M18.36 5.64a5 5 0 0 0-7.07 0L9 7.93M5.64 18.36a5 5 0 0 0 7.07 0L15 16.07" /><line x1="8" y1="16" x2="16" y2="8" /></svg>
                                        Desvincular
                                    </button>
                                </div>
                            </div>

                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>
                            Nenhum aparelho vinculado a este colaborador.
                        </p>
                        <Link to="/inventario/alocacao" className={styles.emptyCta}>
                            Vincular aparelho
                        </Link>
                    </div>
                )}
            </div>

            {desvincularDevice && funcionario && (
                <DesvincularModal
                    deviceModel={desvincularDevice.model ?? 'este aparelho'}
                    employeeName={funcionario.name}
                    onClose={() => setDesvincularDevice(null)}
                    onConfirm={handleDesvincular}
                />
            )}
        </section>
    )
}
