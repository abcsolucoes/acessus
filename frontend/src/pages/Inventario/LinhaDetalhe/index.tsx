import { Link, useParams } from 'react-router-dom'
import { Header } from '../../../components/Header'
import { LinhaHero } from '../../../components/InventarioComponents/LinhaDetalhe/LinhaHero'
import { LinhaInfo } from '../../../components/InventarioComponents/LinhaDetalhe/LinhaInfo'
import { LinhaFuncionario } from '../../../components/InventarioComponents/LinhaDetalhe/LinhaFuncionario'
import { useLinhaDetalhe } from '../../../hooks/LinhaHooks/useLinhaDetalhe'
import styles from './style.module.css'

export function InventarioLinhaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { linha, loading, refetch } = useLinhaDetalhe(Number(id))

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>
        {loading ? null : !linha ? (
          <p>Linha não encontrada.</p>
        ) : (
          <>
            <div className={styles.breadcrumb}>
              <Link to="/inventario/linhas" className={styles.backBtn}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                Linhas
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{linha.number}</span>
            </div>

            <LinhaHero linha={linha} onAlterado={refetch} />

            <div className={styles.col}>
              <LinhaInfo linha={linha} onAlterado={refetch} />
              <LinhaFuncionario linha={linha} onAlterado={refetch} />
            </div>
          </>
        )}
      </main>
    </>
  )
}
