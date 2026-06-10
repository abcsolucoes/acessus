/*
 * LoginPage
 *
 * Conceitos cobertos aqui:
 *  - useState         → guarda o valor de cada input e estado de loading/erro
 *  - Inputs controlados → o React "controla" o que está no campo via value + onChange
 *  - handleSubmit     → intercepta o submit do form e chama a API
 *  - useNavigate      → navega para outra rota depois do login
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, decodeToken, saveToken } from '../../../services/api'
import styles from '../auth.module.css'

export function LoginPage() {
  // ── Estado ────────────────────────────────────────────────────────────────
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const navigate = useNavigate() // hook para mudar de página

  useEffect(() => {
    const decoded = decodeToken();
    if(decoded) {navigate("/dashboard"); return}
  }, [])

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()   // impede o reload padrão do formulário
    setError('')         // limpa erro anterior
    setLoading(true)

    try {
      const data = await apiFetch<string>('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      saveToken(data)        // salva o JWT no localStorage
      navigate('/dashboard')       // redireciona para a área logada
    } catch (err) {
      // err é do tipo unknown; convertemos para string com instanceof
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)  // sempre desativa o loading, com sucesso ou erro
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Cabeçalho */}
        <div className={styles.cardHeader}>
          <h1 className={styles.logo}>Acessus<span>.</span></h1>
          <p className={styles.title}>Bem-vindo de volta</p>
          <p className={styles.subtitle}>Entre com sua conta para continuar</p>
        </div>

        {/* Formulário */}
        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">E-mail</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}                          // valor vem do estado
              onChange={e => setEmail(e.target.value)} // atualiza o estado a cada tecla
              disabled={loading}
              required
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Senha</label>
              {/* Navega para a página de recuperação de senha */}
              <button
                type="button"
                className={styles.forgotBtn}
                onClick={() => navigate('/forgot-password')}
              >
                Esqueci minha senha
              </button>
            </div>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(p => !p)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Mensagem de erro — só aparece quando error !== '' */}
          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

        </form>
      </div>
    </div>
  )
}
