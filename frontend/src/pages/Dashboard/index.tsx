import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { apiFetch, authHeaders, decodeToken } from "../../services/api";


import styles from './style.module.css'

const MODULES = [
  {
    name: 'RH',
    description: 'Candidatos e processos seletivos',
    path: '/rh',
    roles: ['ADMIN', 'RH'],
  },
  {
    name: 'Contatos',
    description: 'Agenda e contatos da empresa',
    path: '/contatos',
    roles: ['ADMIN', 'RH', 'OPERACIONAL', 'DP'],
  },
  {
    name: 'Tickets',
    description: 'Abertura e gerenciamento de tickets',
    path: '/tickets',
    roles: ['ADMIN', 'RH', 'OPERACIONAL', 'DP'],
  },
    {
    name: 'Configurações',
    description: 'Usuários e configurações do sistema',
    path: '/configuracoes',
    roles: ['ADMIN'],
  },
  {
    name: 'Logs',
    description: 'Auditoria de ações do sistema',
    path: '/logs',
    roles: ['ADMIN'],
  }
]

export function DashboardPage() {
  const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null);
  const navigate = useNavigate()

  useEffect(() => {
    const decoded = decodeToken()
    if (!decoded) { navigate('/login'); return }

    // Mostra os módulos imediatamente pelo token — não depende da API
    setUser(decoded)

    // Valida a sessão e atualiza a role com o valor atual do banco
    // (garante que mudanças de role reflitam sem precisar re-logar)
    apiFetch<{ name: string; role: string; email: string }>('/users/me', { headers: authHeaders() })
      .then(me => setUser({ name: me.name, role: me.role, sub: me.email }))
      .catch(() => {}) // 401 já é tratado pelo apiFetch (redireciona para /login)
  }, [])

  const visibleModules = MODULES.filter(m => m.roles.includes(user?.role ?? ''))

  return (
    <>
      <Header
        moduleName="Dashboard"
        userName={user?.name ?? ''}
      />

      <main className={styles.main}>
        <div className={styles.greeting}>
          <h2 className={styles.greetingTitle}>Olá, {user?.name?.split(' ')[0]}</h2>
          <p className={styles.greetingSubtitle}>O que vamos fazer hoje?</p>
        </div>

        <p className={styles.sectionLabel}>Módulos disponíveis</p>

        <div className={styles.grid}>
          {visibleModules.map(module => (
            <div key={module.path} className={styles.card} onClick={() => navigate(module.path)}>
              <h2 className={styles.cardName}>{module.name}</h2>
              <p className={styles.cardDesc}>{module.description}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
