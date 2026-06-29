import styles from "../../pages/Dashboard/style.module.css"

type Props = {
  firstName: string
}

export function DashboardHeaderPage({firstName}: Props) {
  return (
    <section className={styles.intro} aria-labelledby="dashboard-title">
      <div>
        <span className={styles.kicker}>Painel principal</span>
        <h1 id="dashboard-title" className={styles.title}>Olá, {firstName}!</h1>
        <p className={styles.subtitle}>
          Bem-vindo de volta ao Accessus. Seus caminhos principais estao sempre a um clique.
        </p>
      </div>
    </section>
  )
}
