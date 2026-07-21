import { Link, useParams } from 'react-router-dom'
import { Header } from '../../../components/Header'
import { FuncionarioHero } from '../../../components/InventarioComponents/FuncionarioDetalhe/FuncionarioHero'
import { FuncionarioInfo } from '../../../components/InventarioComponents/FuncionarioDetalhe/FuncionarioInfo'
import { FuncionarioAparelhos } from '../../../components/InventarioComponents/FuncionarioDetalhe/FuncionarioAparelhos'
import { FuncionarioHistorico } from '../../../components/InventarioComponents/FuncionarioDetalhe/FuncionarioHistorico'
import styles from './style.module.css'
import { useFuncionarioDetalhe } from '../../../hooks/FuncionarioHooks/useFuncionarioDetalhe'

export function InventarioFuncionarioDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { funcionario, historico, historicoPage, setHistoricoPage, historicoTotalPages, refetch } = useFuncionarioDetalhe(Number(id));

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link to="/inventario/funcionarios" className={styles.backBtn}>
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            Colaboradores
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{funcionario?.name.toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase())}</span>
        </div>

        <FuncionarioHero funcionario={funcionario}/>

        <div className={styles.grid}>
          <div className={styles.col}>
            <FuncionarioInfo funcionario={funcionario}/>
            <FuncionarioAparelhos funcionario={funcionario} onDesvinculado={refetch}/>
          </div>
          <div className={styles.col}>
            <FuncionarioHistorico
              historico={historico}
              page={historicoPage}
              totalPages={historicoTotalPages}
              setPage={setHistoricoPage}
            />
          </div>
        </div>
      </main>
    </>
  )
}
