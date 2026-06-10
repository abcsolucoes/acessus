/*
 * ForgotPasswordPage  — recuperação de senha em 3 etapas
 *
 * Conceitos cobertos aqui:
 *  - step state pattern → um único useState controla qual "tela" mostrar dentro
 *                         do mesmo componente, sem trocar de rota
 *  - Union type         → type Step = 'email' | 'code' | 'newPassword'
 *                         garante que só esses três valores são válidos
 *  - Renderização condicional → {step === 'email' && <JSX>}
 *
 * Fluxo:
 *   1. email       → usuário digita o e-mail → API envia o código
 *   2. code        → usuário digita o código de 6 dígitos → API valida
 *   3. newPassword → usuário cria a nova senha → API salva → vai pro login
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, decodeToken } from '../../../services/api'
import styles from '../auth.module.css'

// As três etapas possíveis — TypeScript vai reclamar se você usar outro valor
type Step = 'email' | 'code' | 'newPassword'

export function ForgotPasswordPage() {
  // ── Estado compartilhado entre as etapas ──────────────────────────────────
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const decoded = decodeToken();
    if (decoded) { navigate("/dashboard"); return }
  }, [])

  // Limpa o erro sempre que o usuário começar a digitar de novo
  function clearError() {
    if (error) setError('')
  }

  // ── Etapa 1: enviar e-mail ─────────────────────────────────────────────────
  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // A API recebe o e-mail e envia um código de 6 dígitos para ele
      await apiFetch('/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      setStep('code') // ✅ deu certo → avança para a etapa do código
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail')
    } finally {
      setLoading(false)
    }
  }

  // ── Etapa 2: avançar para nova senha ──────────────────────────────────────
  // O backend não tem endpoint de validação isolada — o código só é verificado
  // junto com a nova senha em /users/reset-password (etapa 3).
  // Aqui apenas garantimos que o campo foi preenchido e avançamos localmente.
  function handleValidateCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (code.length !== 6) {
      setError('O código deve ter 6 dígitos')
      return
    }

    setStep('newPassword')
  }

  // ── Etapa 3: salvar nova senha ─────────────────────────────────────────────
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validação local antes de chamar a API
    if (newPassword !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      await apiFetch('/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password: newPassword }),
      })

      // Tudo certo! Manda para o login
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── ETAPA 1: E-mail ───────────────────────────────────────────── */}
        {step === 'email' && (
          <>
            <div className={styles.cardHeader}>
              <h1 className={styles.logo}>Acessus<span>.</span></h1>
              <p className={styles.title}>Esqueci minha senha</p>
              <p className={styles.subtitle}>
                Digite seu e-mail e enviaremos um código de recuperação.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSendEmail}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">E-mail</label>
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError() }}
                  disabled={loading}
                  required
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Enviando…' : 'Enviar código'}
              </button>

              <button
                type="button"
                className={styles.backBtn}
                onClick={() => navigate('/login')}
              >
                Voltar ao login
              </button>
            </form>
          </>
        )}

        {/* ── ETAPA 2: Código ───────────────────────────────────────────── */}
        {step === 'code' && (
          <>
            <div className={styles.cardHeader}>
              <h1 className={styles.logo}>Acessus<span>.</span></h1>
              <p className={styles.title}>Verifique seu e-mail</p>
              <p className={styles.subtitle}>
                Enviamos um código de 6 dígitos para<br />
                <strong>{email}</strong>
              </p>
            </div>

            <form className={styles.form} onSubmit={handleValidateCode}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="code">Código</label>
                <input
                  id="code"
                  // codeInput centraliza o texto e deixa o spacing estilo "_ _ _ _ _ _"
                  className={`${styles.input} ${styles.codeInput}`}
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '')); clearError() }}
                  disabled={loading}
                  required
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Verificando…' : 'Verificar código'}
              </button>

              <button
                type="button"
                className={styles.backBtn}
                onClick={() => { setStep('email'); setCode(''); setError('') }}
              >
                Usar outro e-mail
              </button>
            </form>
          </>
        )}

        {/* ── ETAPA 3: Nova senha ───────────────────────────────────────── */}
        {step === 'newPassword' && (
          <>
            <div className={styles.cardHeader}>
              <h1 className={styles.logo}>Acessus<span>.</span></h1>
              <p className={styles.title}>Crie uma nova senha</p>
              <p className={styles.subtitle}>
                Sua identidade foi confirmada. Agora defina uma nova senha.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleResetPassword}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="newPassword">Nova senha</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="newPassword"
                    className={styles.input}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); clearError() }}
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
                    onChange={e => { setConfirm(e.target.value); clearError() }}
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
                {loading ? 'Salvando…' : 'Redefinir senha'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
