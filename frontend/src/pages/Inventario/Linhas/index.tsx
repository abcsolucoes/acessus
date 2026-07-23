import { useEffect, useState } from 'react'
import { Header } from '../../../components/Header'
import { Toast } from '../../../components/Toast'
import { InventarioSubnav } from '../../../components/InventarioComponents/InventarioSubnav'
import { ResumoLinhas } from '../../../components/InventarioComponents/InventarioLinhas/ResumoLinhas'
import { FiltroLinhas } from '../../../components/InventarioComponents/InventarioLinhas/FiltroLinhas'
import { ListaLinhas } from '../../../components/InventarioComponents/InventarioLinhas/ListaLinhas'
import { Paginacao } from '../../../components/InventarioComponents/InventarioLinhas/Paginacao'
import { NovaLinhaModal } from '../../../components/InventarioComponents/InventarioLinhas/NovaLinhaModal'
import { useLinhas } from '../../../hooks/LinhaHooks/useLinhas'
import { countLinhas } from '../../../services/LinhaService/linhaApi'
import styles from './style.module.css'

export function InventarioLinhasPage() {
  const {
    linhas,
    totalElements,
    totalPages,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    refetch,
  } = useLinhas()

  const [emUso, setEmUso] = useState(0)
  const [disponiveis, setDisponiveis] = useState(0)
  const [novaLinhaAberta, setNovaLinhaAberta] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function atualizarResumo() {
    countLinhas('IN_USE').then(setEmUso).catch(() => { })
    countLinhas('AVAILABLE').then(setDisponiveis).catch(() => { })
  }

  useEffect(() => {
    atualizarResumo()
  }, [])

  function handleNovaLinhaSuccess() {
    refetch()
    atualizarResumo()
    setToast({ message: 'Linha cadastrada com sucesso', type: 'success' })
  }

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>

        <InventarioSubnav active="linhas" />

        <div className={styles.top}>
          <div className={styles.titleGroup}>
            <span className={styles.title}>Linhas</span>
            <span className={styles.badge}>{totalElements} registros</span>
          </div>
          <div className={styles.topActions}>
            <button type="button" className={styles.primaryBtn} onClick={() => setNovaLinhaAberta(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Nova linha
            </button>
          </div>
        </div>

        <ResumoLinhas emUso={emUso} disponiveis={disponiveis} />

        <FiltroLinhas statusFilter={statusFilter} setStatusFilter={setStatusFilter} search={search} setSearch={setSearch} />

        <ListaLinhas linhas={linhas} />

        <Paginacao page={page} totalPages={totalPages} setPage={setPage} />

      </main>

      {novaLinhaAberta && (
        <NovaLinhaModal
          onClose={() => setNovaLinhaAberta(false)}
          onSuccess={handleNovaLinhaSuccess}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
