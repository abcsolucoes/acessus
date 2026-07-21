import { useState } from 'react'
import { Header } from '../../../components/Header'
import { Toast } from '../../../components/Toast'
import { ListaAparelhos } from '../../../components/InventarioComponents/InventarioAparelhos/ListaAparelhos'
import { Paginacao } from '../../../components/InventarioComponents/InventarioAparelhos/Paginacao'
import { InventarioSubnav } from '../../../components/InventarioComponents/InventarioSubnav'
import { useAparelhos } from '../../../hooks/AparelhoHooks/useAparelhos'
import styles from './style.module.css'
import { Filtro } from '../../../components/InventarioComponents/InventarioAparelhos/Filtro'

export function InventarioAparelhosPage() {
  const { aparelhos, page, totalPages, setPage, totalElements, sincronizando, sincronizar, situacaoFilter, setSituacaoFilter, search, setSearch } = useAparelhos();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function handleSincronizar() {
    try {
      await sincronizar()
      setToast({ message: 'Aparelhos sincronizados com sucesso', type: 'success' })
    } catch {
      setToast({ message: 'Erro ao sincronizar aparelhos com o Pulsus', type: 'error' })
    }
  }

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>

        <InventarioSubnav active="aparelhos" />

        <div className={styles.top}>
          <div className={styles.titleGroup}>
            <span className={styles.title}>Aparelhos</span>
            <span className={styles.badge}>{totalElements} registros</span>
          </div>
          <div className={styles.topActions}>
            <button className={styles.syncBtn} onClick={handleSincronizar} disabled={sincronizando}>
              <svg className={sincronizando ? styles.spinning : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {sincronizando ? 'Sincronizando…' : 'Sincronizar com Pulsus'}
            </button>
          </div>
        </div>

        <Filtro situacaoFilter={situacaoFilter} setSituacaoFilter={setSituacaoFilter} search={search} setSearch={setSearch} />

        <ListaAparelhos aparelhos={aparelhos} />

        <Paginacao page={page} totalPages={totalPages} setPage={setPage} />

      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
