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
  const items = [
    { key: 'welcome', label: 'Enviar boas-vindas',   done: !!candidate.welcomeMessageSentAt },
    { key: 'route',   label: 'Enviar dados da rota', done: !!candidate.routeDataSentAt },
    { key: 'dysrup',  label: 'Cadastrar na Dysrup',  done: !!candidate.dysrupRegisteredAt },
    { key: 'ticket',  label: 'Abrir chamado T.I',    done: !!candidate.tiTicketCreatedAt },
  ] as const

  const hasPending = items.some(i => !i.done)

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
                <span>{item.label}</span>
              </div>
              {!item.done && (
                <button
                  className={styles.actionBtn}
                  onClick={() => onAction(item.key)}
                  disabled={checklistLoading}
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
          {hasPending && (
            <button className={styles.submitBtn} onClick={onRunAll} disabled={checklistLoading}>
              {checklistLoading ? 'Executando…' : 'Realizar todas pendentes'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
