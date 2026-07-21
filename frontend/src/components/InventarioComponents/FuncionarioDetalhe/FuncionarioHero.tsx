import type { Funcionario } from "../../../types"
import { getInitials } from "../../../utils/format"
import styles from "./FuncionarioHero.module.css"

type Props = {
    funcionario: Funcionario | null
}

export function FuncionarioHero({funcionario}: Props) {
    if(funcionario) {
        return (
            <section className={styles.hero}>
                <div className={styles.heroLeft}>
                    <span className={styles.avatar}>{getInitials("Marina Costa")}</span>
                    <div className={styles.heroInfo}>
                        <h1 className={styles.name}>{funcionario?.name.toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase())}</h1>
                        <span className={styles.roleLine}>{funcionario.position} · {funcionario.department}</span>
                        <div className={styles.badgeRow}>
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Ativo</span>
                            <span className={`${styles.badge} ${styles.badgeNeutral}`}>Colaboradora CLT</span>
                            <span className={styles.companyMeta}>ABC Soluções em Vendas LTDA</span>
                        </div>
                    </div>
                </div>
    
                <div className={styles.heroActions}>
                    <button className={styles.secondaryBtn}>Ajustar status</button>
                    <button className={styles.primaryBtn}>Editar cadastro</button>
                </div>
            </section>
        )

    }
}
