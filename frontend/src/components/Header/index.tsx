import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, authHeaders, decodeToken, removeToken } from '../../services/api'
import { Toast } from '../Toast'
import styles from './Header.module.css'

type HeaderProps = {
  moduleName: string
  userName: string
}

export function Header({ moduleName, userName }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [juncaoStatus, setJuncaoStatus] = useState<'idle' | 'loading'>('idle')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)

  useEffect(() => {
    setUser(decodeToken())

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    removeToken()
    navigate('/login')
  }

  return (
    <>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={6000} />}
    <header className={styles.header}>

      {/* Esquerda: logo + módulo */}
      <div className={styles.left}>
        <h1 className={styles.logo} onClick={() => navigate('/dashboard')}>
          Acessus<span>.</span>
        </h1>
        <div className={styles.divider} />
        <span className={styles.module}>{moduleName}</span>
      </div>


      {/* Direita: dropdown do usuário */}
      <div className={styles.dropdown} ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {moduleName !== "Dashboard" && (
          <button onClick={() => { navigate('/dashboard') }} className={`${styles.userBtn} ${styles.backBtn}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
        )}

        <button
          className={styles.userBtn}
          onClick={() => setOpen(prev => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {userName.split(' ')[0]}
          <svg
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className={styles.menu} role="menu">

            <button
              className={styles.menuItem}
              onClick={() => { setOpen(false); navigate('/dashboard') }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Início
            </button>

            {(user?.sub === "gabriel.silva@solucoesabc.com.br" || user?.sub === "gabriel.oliveira@solucoesabc.com.br" || user?.sub === "guilherme.lima@solucoesabc.com.br") && (
              <>
                <button
                  className={styles.menuItem}
                  disabled={juncaoStatus === 'loading'}
                  onClick={async () => {
                    setOpen(false)
                    setJuncaoStatus('loading')
                    setToast({ message: 'Gerando junção, o arquivo será enviado no seu e-mail em alguns minutos...', type: 'success' })
                    try {
                      await apiFetch('/dysrup/gerar-juncao', { method: 'POST', headers: authHeaders() })
                    } catch {
                      setToast({ message: 'Erro ao iniciar a geração. Tente novamente.', type: 'error' })
                    } finally {
                      setJuncaoStatus('idle')
                    }
                  }}
                >
                  {juncaoStatus === 'loading' ? 'Gerando...' : 'Realizar Junção'}
                </button>
              </>
            )}

            <div className={styles.menuDivider} />

            <button
              className={`${styles.menuItem} ${styles.danger}`}
              onClick={handleLogout}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sair
            </button>

          </div>
        )}

      </div>

    </header>
    </>
  )
}
