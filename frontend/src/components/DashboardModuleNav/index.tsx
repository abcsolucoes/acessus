import { NavLink } from 'react-router-dom'
import styles from './DashboardModuleNav.module.css'

export type UserRole = 'ADMIN' | 'RH' | 'OPERACIONAL' | 'DP'

type DashboardModuleNavProps = {
  role: UserRole
}

type ModuleItem = {
  label: string
  description: string
  path: string
  icon: 'dashboard' | 'ticket' | 'contact' | 'rh' | 'settings' | 'logs'
  roles?: UserRole[]
}

const modules: ModuleItem[] = [
  {
    label: 'Dashboard',
    description: 'Inicio do sistema',
    path: '/dashboard',
    icon: 'dashboard',
  },
  {
    label: 'Tickets',
    description: 'Solicitacoes e suporte',
    path: '/tickets',
    icon: 'ticket',
  },
  {
    label: 'Contatos',
    description: 'Agenda corporativa',
    path: '/contatos',
    icon: 'contact',
  },
  {
    label: 'RH',
    description: 'Admissao e candidatos',
    path: '/rh',
    icon: 'rh',
    roles: ['ADMIN', 'RH'],
  },
  {
    label: 'Logs',
    description: 'Auditoria do sistema',
    path: '/logs',
    icon: 'logs',
    roles: ['ADMIN'],
  },
  {
    label: 'Configuracoes',
    description: 'Usuarios e permissoes',
    path: '/configuracoes',
    icon: 'settings',
    roles: ['ADMIN'],
  },
]

function canSeeModule(item: ModuleItem, role: UserRole) {
  return !item.roles || item.roles.includes(role)
}

function ModuleIcon({ type }: { type: ModuleItem['icon'] }) {
  if (type === 'ticket') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3Z" />
        <path d="M9 9h6" />
        <path d="M9 15h6" />
      </svg>
    )
  }

  if (type === 'contact') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 19v-1a4 4 0 0 0-8 0v1" />
        <circle cx="12" cy="8" r="3" />
        <path d="M18 8h4" />
        <path d="M20 6v4" />
      </svg>
    )
  }

  if (type === 'rh') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 11a4 4 0 1 0-8 0" />
        <path d="M4 20a8 8 0 0 1 16 0" />
        <path d="M12 3v3" />
      </svg>
    )
  }

  if (type === 'settings') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-.5 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 .5-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 .5 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.22.35.42.69.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-.5 1Z" />
      </svg>
    )
  }

  if (type === 'logs') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M14 3v4h4" />
        <path d="M9 11h6" />
        <path d="M9 15h6" />
        <path d="M9 19h3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-6h4v6" />
    </svg>
  )
}

export function DashboardModuleNav({ role }: DashboardModuleNavProps) {
  const visibleModules = modules.filter((item) => canSeeModule(item, role))

  return (
    <aside className={styles.sidebar} aria-label="Modulos do sistema">
      <div className={styles.brandBlock}>
        <span className={styles.brandMark}>A</span>
        <div>
          <strong>Acessus</strong>
          <small>Modulos disponiveis</small>
        </div>
      </div>

      <nav className={styles.navList}>
        {visibleModules.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.iconWrap}>
              <ModuleIcon type={item.icon} />
            </span>
            <span className={styles.itemText}>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
