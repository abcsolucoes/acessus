import { useNavigate } from "react-router-dom"
import styles from "../../pages/Dashboard/style.module.css"

const flowSteps = [
    { title: 'Solicitar', description: 'Abra demandas com contexto claro.' },
    { title: 'Acompanhar', description: 'Volte aos tickets sempre que precisar.' },
    { title: 'Resolver', description: 'Mantenha o trabalho organizado.' },
]

export function DashboardDayFlow() {
    const navigate = useNavigate()

    return (
        <section className={styles.workspace}>
            <div className={`${styles.cardPanel} ${styles.flowPanel}`}>
                <div className={styles.panelHeader}>
                    <span className={styles.sectionIcon}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 7h7" />
                            <path d="M4 17h7" />
                            <path d="M15 7h5" />
                            <path d="M15 17h5" />
                            <path d="M11 7c2.5 0 2.5 10 5 10" />
                            <path d="M11 17c2.5 0 2.5-10 5-10" />
                        </svg>
                    </span>
                    <h2>Fluxo do dia</h2>
                </div>

                <div className={styles.flowTrack}>
                    {flowSteps.map((step, index) => (
                        <div key={step.title} className={styles.flowStep}>
                            <span>{index + 1}</span>
                            <strong>{step.title}</strong>
                            <small>{step.description}</small>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`${styles.cardPanel} ${styles.tipPanel}`}>
                <div className={styles.panelHeader}>
                    <span className={styles.sectionIcon}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M9 18h6" />
                            <path d="M10 22h4" />
                            <path d="M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.7-1.5 2.8H10c0-1.1-.6-2.1-1.5-2.8Z" />
                        </svg>
                    </span>
                    <h2>Dicas para você</h2>
                </div>

                <div className={styles.tipBody}>
                    <div className={styles.tipIllustration} aria-hidden="true">
                        <span className={styles.tipCardOne} />
                        <span className={styles.tipCardTwo} />
                        <span className={styles.tipBadge}>
                            <svg viewBox="0 0 24 24">
                                <path d="M7 12.5 10.5 16 17 8" />
                            </svg>
                        </span>
                    </div>
                    <div>
                        <strong>Informativos</strong>
                        <p>Leia informativos rápidos para usufruir do sistema da melhor forma.</p>
                        <button type="button" onClick={() => navigate('/ajuda')}>
                            Leia aqui
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 12h14" />
                                <path d="m13 6 6 6-6 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}