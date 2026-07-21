import { Header } from '../../components/Header'
import { Alertas } from '../../components/InventarioComponents/InventarioDashboard/Alertas'
import { IndicadoresCards } from '../../components/InventarioComponents/InventarioDashboard/IndicadoresCards'
import { InventarioSubnav } from '../../components/InventarioComponents/InventarioSubnav'
import { useFuncionario } from '../../hooks/FuncionarioHooks/useFuncionario'
import styles from './style.module.css'

export function InventarioPage() {
  const { summary } = useFuncionario()

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>

        <InventarioSubnav active="geral" />

        {/* ── Indicadores ──────────────────────────────────── */}
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>Indicadores</span>
          <span className={styles.sectionHint}>Atualizado agora há pouco</span>
        </div>

        <IndicadoresCards
        indicadores={summary}
        />

        {/* ── Alertas ──────────────────────────────────────── */}
        <Alertas />

      </main>
    </>
  )
}
