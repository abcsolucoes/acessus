import styles from "../../pages/Dashboard/style.module.css"

export function DashboardBanner() {
    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <span className={styles.heroEyebrow}>Accessus conectado</span>
                <h2>
                    Tudo conectado.
                    <br />
                    Tudo <span>resolvido.</span>
                </h2>
                <p>
                    Centralize demandas e fluxos em uma experiencia simples, rapida e organizada.
                </p>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
                <div className={`${styles.orbit} ${styles.orbitOne}`} />
                <div className={`${styles.orbit} ${styles.orbitTwo}`} />
                <div className={styles.panelMock}>
                    <div className={styles.panelTop}>
                        <span />
                        <span />
                        <span />
                    </div>
                    <div className={styles.panelGrid}>
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
                <div className={`${styles.floatCard} ${styles.floatTicket}`}>
                    <strong>Novo ticket</strong>
                    <small>Solicitacao registrada</small>
                </div>
                <div className={`${styles.floatCard} ${styles.floatContact}`}>
                    <strong>Contato salvo</strong>
                    <small>Agenda atualizada</small>
                </div>
            </div>
        </section>
    )
}