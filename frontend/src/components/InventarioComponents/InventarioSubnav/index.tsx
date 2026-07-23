import { Link } from 'react-router-dom'
import styles from './style.module.css'

export type InventarioSection = 'geral' | 'funcionarios' | 'aparelhos' | 'linhas' | 'alocacao' | 'movimentacoes'

type Props = {
  active: InventarioSection
}

export function InventarioSubnav({ active }: Props) {
  return (
    <nav className={styles.subnav}>
      <Link to="/inventario" className={`${styles.subnavItem} ${active === 'geral' ? styles.subnavItemActive : ''}`}>
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
        Visão geral
      </Link>
      <Link to="/inventario/funcionarios" className={`${styles.subnavItem} ${active === 'funcionarios' ? styles.subnavItemActive : ''}`}>
        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        Colaboradores
      </Link>
      <Link to="/inventario/aparelhos" className={`${styles.subnavItem} ${active === 'aparelhos' ? styles.subnavItemActive : ''}`}>
        <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
        Aparelhos
      </Link>
      <Link to="/inventario/linhas" className={`${styles.subnavItem} ${active === 'linhas' ? styles.subnavItemActive : ''}`}>
        <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
        Linhas
      </Link>
      <Link to="/inventario/alocacao" className={`${styles.subnavItem} ${active === 'alocacao' ? styles.subnavItemActive : ''}`}>
        <svg viewBox="0 0 24 24"><path d="M16.5 9.4 7.5 4.2" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
        Alocação
      </Link>
      <Link to="/inventario/movimentacoes" className={`${styles.subnavItem} ${active === 'movimentacoes' ? styles.subnavItemActive : ''}`}>
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        Movimentações
      </Link>
    </nav>
  )
}
