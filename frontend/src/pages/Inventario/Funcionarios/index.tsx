import { Header } from '../../../components/Header'
import { Filtro } from '../../../components/InventarioComponents/InventarioFuncionarios/Filtro'
import { ListaFuncionarios } from '../../../components/InventarioComponents/InventarioFuncionarios/ListaFuncionarios'
import { Paginacao } from '../../../components/InventarioComponents/InventarioFuncionarios/Paginacao'
import { InventarioSubnav } from '../../../components/InventarioComponents/InventarioSubnav'
import { useFuncionario } from '../../../hooks/FuncionarioHooks/useFuncionario'
import styles from './style.module.css'

export function InventarioFuncionariosPage() {
  const { funcionarios, page, totalPages, setPage, totalElements } = useFuncionario();

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>

        <InventarioSubnav active="funcionarios" />

        <div className={styles.top}>
          <div className={styles.titleGroup}>
            <span className={styles.title}>Funcionários</span>
            <span className={styles.badge}>{totalElements} registros</span>
          </div>
          <button className={styles.exportBtn}>
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Exportar
          </button>
        </div>

        <Filtro />

        <ListaFuncionarios
          funcionarios={funcionarios}
        />

        <Paginacao page={page} totalPages={totalPages} setPage={setPage} />

      </main>
    </>
  )
}
