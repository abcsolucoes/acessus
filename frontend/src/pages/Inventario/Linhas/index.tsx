import { useState } from 'react'
import { Header } from '../../../components/Header'
import { InventarioSubnav } from '../../../components/InventarioComponents/InventarioSubnav'
import { ResumoLinhas } from '../../../components/InventarioComponents/InventarioLinhas/ResumoLinhas'
import { FiltroLinhas } from '../../../components/InventarioComponents/InventarioLinhas/FiltroLinhas'
import { ListaLinhas } from '../../../components/InventarioComponents/InventarioLinhas/ListaLinhas'
import { Paginacao } from '../../../components/InventarioComponents/InventarioLinhas/Paginacao'
import { NovaLinhaModal } from '../../../components/InventarioComponents/InventarioLinhas/NovaLinhaModal'
import styles from './style.module.css'

export function InventarioLinhasPage() {
  const [novaLinhaAberta, setNovaLinhaAberta] = useState(false)

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>

        <InventarioSubnav active="linhas" />

        <div className={styles.top}>
          <div className={styles.titleGroup}>
            <span className={styles.title}>Linhas</span>
            <span className={styles.badge}>8 registros</span>
          </div>
          <div className={styles.topActions}>
            <button type="button" className={styles.primaryBtn} onClick={() => setNovaLinhaAberta(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Nova linha
            </button>
          </div>
        </div>

        <ResumoLinhas />

        <FiltroLinhas />

        <ListaLinhas />

        <Paginacao />

      </main>

      {novaLinhaAberta && <NovaLinhaModal onClose={() => setNovaLinhaAberta(false)} />}
    </>
  )
}
