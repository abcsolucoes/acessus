import { Header } from '../../../components/Header'
import { InventarioSubnav } from '../../../components/InventarioComponents/InventarioSubnav'
import { Filtro } from '../../../components/InventarioComponents/InventarioMovimentacoes/Filtro'
import { ListaMovimentacoes } from '../../../components/InventarioComponents/InventarioMovimentacoes/ListaMovimentacoes'
import { Paginacao } from '../../../components/InventarioComponents/InventarioMovimentacoes/Paginacao'
import styles from './style.module.css'
import { useHistorico } from '../../../hooks/HistoricoHooks/useHistorico'

export function InventarioMovimentacoesPage() {
  const { historico, totalElements, page, totalPages, setPage } = useHistorico();

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>

        <InventarioSubnav active="movimentacoes" />

        <div className={styles.top}>
          <div className={styles.titleGroup}>
            <div className={styles.titleRow}>
              <span className={styles.title}>Movimentações</span>
              <span className={styles.badge}>{totalElements} registros</span>
            </div>
            <span className={styles.subtitle}>Histórico de vínculos entre aparelhos e colaboradores.</span>
          </div>
        </div>

        <Filtro />

        <ListaMovimentacoes historico={historico}/>

        <Paginacao page={page} totalPages={totalPages} setPage={setPage} />

      </main>
    </>
  )
}
