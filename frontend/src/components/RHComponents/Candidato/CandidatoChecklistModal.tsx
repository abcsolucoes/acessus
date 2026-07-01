import type { Candidate } from "../../../types"
import styles from './CandidatoChecklistModal.module.css'

type Props = {
  candidate: Candidate
  checklistLoading: boolean
  onClose: () => void
  onAction: (action: 'welcome' | 'route' | 'dysrup' | 'ticket') => void
  onRunAll: () => void
}

export function CandidatoChecklistModal({ candidate, checklistLoading, onClose, onAction, onRunAll }: Props) {
  const missingDysrup = [
    !candidate.zipcode && 'CEP',
    !candidate.addressNumber && 'número do endereço',
    !candidate.birthDate && 'data de nascimento',
  ].filter(Boolean) as string[]

  // "Enviar dados Dysrup" manda o login/senha de acesso — só faz sentido depois
  // que o candidato de fato existe lá, por isso aparece só depois de cadastrado.
  const missingWelcome = [
    !candidate.email && 'e-mail',
    !candidate.dysrupRegisteredAt && 'cadastro na Dysrup',
  ].filter(Boolean) as string[]

  const missingRoute = [
    !candidate.routeName && 'nome da rota',
    !candidate.hasRoutePhoto && 'foto da rota',
  ].filter(Boolean) as string[]

  const items = [
    {
      key: 'dysrup', label: 'Cadastrar na Dysrup', done: !!candidate.dysrupRegisteredAt,
      blocked: missingDysrup.length > 0, hint: `Pendente: ${missingDysrup.join(', ')}`,
    },
    {
      key: 'welcome', label: 'Enviar dados Dysrup', done: !!candidate.welcomeMessageSentAt,
      blocked: missingWelcome.length > 0, hint: `Pendente: ${missingWelcome.join(', ')}`,
    },
    {
      key: 'route', label: 'Enviar dados da rota', done: !!candidate.routeDataSentAt,
      blocked: missingRoute.length > 0, hint: `Pendente: ${missingRoute.join(', ')}`,
    },
    {
      key: 'ticket', label: 'Abrir chamado T.I', done: !!candidate.tiTicketCreatedAt,
      blocked: false, hint: '',
    },
  ] as const

  const hasRunnablePending = items.some(i => !i.done && !i.blocked)

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Pendências antes de finalizar</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <p className={styles.subtitle}>
          As etapas abaixo ainda não foram realizadas para <strong>{candidate.name}</strong>. Você pode executá-las agora ou prosseguir sem elas.
        </p>

        <div className={styles.items}>
          {items.map(item => (
            <div key={item.key} className={`${styles.item} ${item.done ? styles.itemDone : ''}`}>
              <div className={styles.itemLeft}>
                {item.done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
                <div className={styles.itemLabelWrap}>
                  <span>{item.label}</span>
                  {!item.done && item.blocked && (
                    <span className={styles.itemHint}>{item.hint}</span>
                  )}
                </div>
              </div>
              {!item.done && (
                <button
                  className={styles.actionBtn}
                  onClick={() => onAction(item.key)}
                  disabled={checklistLoading || item.blocked}
                  title={item.blocked ? item.hint : undefined}
                >
                  Executar
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={checklistLoading}>
            Prosseguir assim
          </button>
          {hasRunnablePending && (
            <button className={styles.submitBtn} onClick={onRunAll} disabled={checklistLoading}>
              {checklistLoading ? 'Executando…' : 'Realizar todas pendentes'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
