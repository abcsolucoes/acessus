import { Link } from 'react-router-dom'
import { Header } from '../../../components/Header'
import { LinhaHero } from '../../../components/InventarioComponents/LinhaDetalhe/LinhaHero'
import { LinhaInfo } from '../../../components/InventarioComponents/LinhaDetalhe/LinhaInfo'
import { LinhaFuncionario } from '../../../components/InventarioComponents/LinhaDetalhe/LinhaFuncionario'
import type { Line } from '../../../types'
import styles from './style.module.css'

const LINHA_MOCK: Line = {
  id: 1,
  number: '(31) 99876-5432',
  iccid: '8955 0140 2211',
  status: 'IN_USE',
  notes: null,
  employeeName: 'Adriano Rezende Lima',
  employeeId: 101,
}

export function InventarioLinhaDetalhePage() {
  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link to="/inventario/linhas" className={styles.backBtn}>
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            Linhas
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{LINHA_MOCK.number}</span>
        </div>

        <LinhaHero linha={LINHA_MOCK} />

        <div className={styles.col}>
          <LinhaInfo linha={LINHA_MOCK} />
          <LinhaFuncionario linha={LINHA_MOCK} />
        </div>
      </main>
    </>
  )
}
