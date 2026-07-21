import { Link, useParams } from 'react-router-dom'
import { Header } from '../../../components/Header'
import { AparelhoHero } from '../../../components/InventarioComponents/AparelhoDetalhe/AparelhoHero'
import { AparelhoInfo } from '../../../components/InventarioComponents/AparelhoDetalhe/AparelhoInfo'
import { AparelhoFuncionario } from '../../../components/InventarioComponents/AparelhoDetalhe/AparelhoFuncionario'
import { AparelhoHistorico } from '../../../components/InventarioComponents/AparelhoDetalhe/AparelhoHistorico'
import { useAparelhoDetalhe } from '../../../hooks/AparelhoHooks/useAparelhoDetalhe'
import styles from './style.module.css'

export function InventarioAparelhoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { aparelho, loading, historico, historicoPage, setHistoricoPage, historicoTotalPages } = useAparelhoDetalhe(Number(id))

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>
        {loading ? null : !aparelho ? (
          <p>Aparelho não encontrado.</p>
        ) : (
          <>
            <div className={styles.breadcrumb}>
              <Link to="/inventario/aparelhos" className={styles.backBtn}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                Aparelhos
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{aparelho.model ?? aparelho.serialNumber ?? `Aparelho #${aparelho.id}`}</span>
            </div>

            <AparelhoHero aparelho={aparelho} />

            <div className={styles.grid}>
              <div className={styles.col}>
                <AparelhoInfo aparelho={aparelho} />
                <AparelhoFuncionario aparelho={aparelho} />
              </div>
              <div className={styles.col}>
                <AparelhoHistorico
                  historico={historico}
                  page={historicoPage}
                  totalPages={historicoTotalPages}
                  setPage={setHistoricoPage}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
