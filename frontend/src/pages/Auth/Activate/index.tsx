/*
 * ActivatePage  — ativação de conta (novo usuário)
 *
 * Conceitos cobertos aqui:
 *  - useSearchParams → lê parâmetros da URL  ex: /activate?token=abc123
 *  - useEffect       → executa código assim que o componente é montado
 *                      aqui usamos para validar o token automaticamente
 *  - step state      → reutilizamos o mesmo padrão do ForgotPassword
 *
 * Fluxo:
 *   1. O usuário recebe um link por e-mail: /activate?token=abc123
 *   2. A página lê o token da URL e valida com a API
 *   3. Se válido → mostra o formulário para criar a senha
 *   4. Se inválido/expirado → mostra mensagem de erro
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../../../services/api'
import styles from '../auth.module.css'

type Step = 'validating' | 'form' | 'invalidToken'

export function ActivatePage() {
  // ── useSearchParams: lê a URL ─────────────────────────────────────────────
  // Se a URL for /activate?token=abc123
  // searchParams.get('token') retorna "abc123"
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? '' // ?? '' garante string (nunca null)

  // ── Estado ────────────────────────────────────────────────────────────────
  const [step, setStep]               = useState<Step>('validating')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const navigate = useNavigate()

  // ── useEffect: verifica se o token está na URL ───────────────────────────
  useEffect(() => {
  if (!token) {
    setStep('invalidToken')
  } else {
    setStep('form')
  }

  setLoading(false)
}, [token])

  // ── Submit: criar a senha ─────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      // Ativa a conta e define a senha de uma vez só
      await apiFetch('/users/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      navigate('/login') // conta ativada → vai para o login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ativar conta')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Validando token (estado inicial, rápido) ─────────────────── */}
        {step === 'validating' && (
          <div className={styles.cardHeader}>
            <h1 className={styles.logo}>Acessus<span>.</span></h1>
            <p className={styles.title}>Verificando link…</p>
            <p className={styles.subtitle}>Aguarde um momento.</p>
          </div>
        )}

        {/* ── Token inválido ou expirado ────────────────────────────────── */}
        {step === 'invalidToken' && (
          <>
            <div className={styles.cardHeader}>
              <h1 className={styles.logo}>Acessus<span>.</span></h1>
              <p className={styles.title}>Link inválido</p>
              <p className={styles.subtitle}>
                Este link de ativação é inválido ou já expirou.<br />
                Entre em contato com o administrador para receber um novo link.
              </p>
            </div>

            <div className={styles.form}>
              <button
                className={styles.backBtn}
                onClick={() => navigate('/login')}
              >
                Voltar ao login
              </button>
            </div>
          </>
        )}

        {/* ── Formulário de ativação ────────────────────────────────────── */}
        {step === 'form' && (
          <>
            <div className={styles.cardHeader}>
              <h1 className={styles.logo}>Acessus<span>.</span></h1>
              <p className={styles.title}>Ative sua conta</p>
              <p className={styles.subtitle}>Crie uma senha para acessar o sistema.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">Senha</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    className={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)} tabIndex={-1} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm">Confirmar senha</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirm"
                    className={styles.input}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(p => !p)} tabIndex={-1} aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showConfirm
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Ativando…' : 'Ativar conta'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
