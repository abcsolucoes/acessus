import { useState } from 'react'
import type { Candidate } from '../../../types'
import { getInitials } from '../../../utils/format'
import styles from './CandidatoHero.module.css'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  UNDER_ANALYSIS: 'Em análise',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}

type Props = {
  candidate: Candidate | null
  loading: boolean
  onRegisterDysrup: () => void
  onOpenForm: () => void
  onResendForm: () => void
  onSendWelcome: () => void
  onSendRoute: () => void
  onOpenTicket: () => void
  onEdit: () => void
  onDelete: () => void
}

export function CandidatoHero({
  candidate, loading,
  onRegisterDysrup, onOpenForm, onResendForm,
  onSendWelcome, onSendRoute, onOpenTicket,
  onEdit, onDelete,
}: Props) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const [actionsPos, setActionsPos] = useState({ top: 0, right: 0 })

  const initials = getInitials(candidate?.name ?? '')

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.avatar}>{initials || '?'}</div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>{candidate?.name ?? '...'}</h1>
            <span className={styles.heroPosition}>{candidate?.position ?? ''}</span>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.heroBadgeRow}>
            <span className={`${styles.badge} ${styles[`badge_${candidate?.candidateStatus}`]}`}>
              {STATUS_LABEL[candidate?.candidateStatus ?? '']}
            </span>
            <button
              className={styles.dysrupBtn}
              onClick={onRegisterDysrup}
              disabled={loading}
              title={candidate?.dysrupRegisteredAt ? `Cadastrado em ${new Date(candidate.dysrupRegisteredAt).toLocaleString('pt-BR')}` : 'Cadastrar na Dysrup'}
            >
              <img src="/dysrup_logo.png" alt="Dysrup" height="18" style={{ display: 'block' }} />
              <span style={{ width: 6 }} />
              <p>{candidate?.dysrupRegisteredAt ? 'Já cadastrado' : 'Cadastrar na Dysrup'}</p>
              {candidate?.dysrupRegisteredAt && (
                <svg style={{ marginLeft: 6, color: '#fff', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </div>

          <div className={styles.heroActions}>
            <div className={styles.actionsWrap}>
              <button
                className={styles.actionsToggle}
                onClick={e => {
                  const r = e.currentTarget.getBoundingClientRect()
                  setActionsPos({ top: r.bottom + 6, right: window.innerWidth - r.right })
                  setActionsOpen(o => !o)
                }}
              >
                Ações
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {actionsOpen && (
        <>
          <div className={styles.actionsBackdrop} onClick={() => setActionsOpen(false)} />
          <div className={styles.actionsMenu} style={{ top: actionsPos.top, right: actionsPos.right }}>
            <p className={styles.actionsGroup}>Formulário</p>
            <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); onOpenForm() }} disabled={!candidate?.formEnabled}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Ver formulário
            </button>
            <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); onResendForm() }} disabled={!candidate?.formEnabled}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
              Reenviar formulário
            </button>

            <p className={styles.actionsGroup}>WhatsApp</p>
            <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); onSendWelcome() }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Enviar boas-vindas
              {candidate?.welcomeMessageSentAt && (
                <svg className={styles.actionsDoneIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <title>Enviado em {new Date(candidate.welcomeMessageSentAt).toLocaleString('pt-BR')}</title>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); onSendRoute() }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 8 12 12 14 14" />
              </svg>
              Enviar dados da rota
              {candidate?.routeDataSentAt && (
                <svg className={styles.actionsDoneIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <title>Enviado em {new Date(candidate.routeDataSentAt).toLocaleString('pt-BR')}</title>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>

            <div className={styles.actionsDivider} />
            <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); onOpenTicket() }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Abrir chamado T.I (Aparelho)
              {candidate?.tiTicketCreatedAt && (
                <svg className={styles.actionsDoneIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <title>Aberto em {new Date(candidate.tiTicketCreatedAt).toLocaleString('pt-BR')}</title>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <div className={styles.actionsDivider} />
            <button className={`${styles.actionsItem} ${styles.actionsItemEdit}`} onClick={() => { setActionsOpen(false); onEdit() }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button className={`${styles.actionsItem} ${styles.actionsItemDelete}`} onClick={() => { setActionsOpen(false); onDelete() }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
              Excluir
            </button>
          </div>
        </>
      )}
    </>
  )
}
