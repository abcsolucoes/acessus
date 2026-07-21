import { useState } from 'react'
import { Header } from '../../../components/Header'
import { Toast } from '../../../components/Toast'
import { Filtro } from '../../../components/InventarioComponents/InventarioFuncionarios/Filtro'
import { ImportarModal } from '../../../components/InventarioComponents/InventarioFuncionarios/ImportarModal'
import { ListaFuncionarios } from '../../../components/InventarioComponents/InventarioFuncionarios/ListaFuncionarios'
import { NovoFuncionarioModal } from '../../../components/InventarioComponents/InventarioFuncionarios/NovoFuncionarioModal'
import { Paginacao } from '../../../components/InventarioComponents/InventarioFuncionarios/Paginacao'
import { InventarioSubnav } from '../../../components/InventarioComponents/InventarioSubnav'
import { useExportarFuncionarios } from '../../../hooks/FuncionarioHooks/useExportarFuncionarios'
import { useFuncionario } from '../../../hooks/FuncionarioHooks/useFuncionario'
import styles from './style.module.css'

export function InventarioFuncionariosPage() {
  const { funcionarios, page, totalPages, setPage, totalElements, statusFilter, setStatusFilter, search, setSearch, summary, refetch } = useFuncionario();
  const { exportar, loading: exportando } = useExportarFuncionarios();
  const [importarAberto, setImportarAberto] = useState(false)
  const [novoAberto, setNovoAberto] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function handleExportar() {
    try {
      await exportar()
    } catch {
      setToast({ message: 'Erro ao exportar funcionários', type: 'error' })
    }
  }

  function handleNovoFuncionarioSuccess() {
    refetch()
    setToast({ message: 'Funcionário cadastrado com sucesso', type: 'success' })
  }

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>

        <InventarioSubnav active="funcionarios" />

        <div className={styles.top}>
          <div className={styles.titleGroup}>
            <span className={styles.title}>Colaboradores</span>
            <span className={styles.badge}>{totalElements} registros</span>
          </div>
          <div className={styles.topActions}>
            <button className={styles.importBtn} onClick={() => setNovoAberto(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Novo funcionário
            </button>
            <button className={styles.importBtn} onClick={() => setImportarAberto(true)}>
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Importar planilha
            </button>
            <button className={styles.exportBtn} onClick={handleExportar} disabled={exportando}>
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              {exportando ? 'Exportando…' : 'Exportar'}
            </button>
          </div>
        </div>

        <Filtro
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          search={search}
          setSearch={setSearch}
          afastadosCount={summary?.afastados}
        />

        <ListaFuncionarios
          funcionarios={funcionarios}
        />

        <Paginacao page={page} totalPages={totalPages} setPage={setPage} />

      </main>

      {importarAberto && (
        <ImportarModal
          onClose={() => setImportarAberto(false)}
          onImported={refetch}
        />
      )}

      {novoAberto && (
        <NovoFuncionarioModal
          onClose={() => setNovoAberto(false)}
          onSuccess={handleNovoFuncionarioSuccess}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
