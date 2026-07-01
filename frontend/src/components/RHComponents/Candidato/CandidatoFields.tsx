import { apiFetch, authHeaders } from '../../../services/api'
import type { Field } from '../../../types'
import styles from './CandidatoFields.module.css'

type Props = {
  fields: Field[]
  setFields: React.Dispatch<React.SetStateAction<Field[]>>
  candidateId: number
  onAddField: () => void
}

export function CandidatoFields({ fields, setFields, candidateId, onAddField }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Campos personalizados</h2>
        <button className={styles.addFieldBtn} onClick={onAddField}>
          + Adicionar campo
        </button>
      </div>
      {fields.length === 0 ? (
        <p className={styles.emptyValue}>Nenhum campo personalizado.</p>
      ) : (
        <div className={styles.fieldList}>
          {fields.map(f => (
            <div key={f.id} className={styles.fieldItem}>
              <span className={styles.fieldName}>{f.fieldName}</span>
              <span className={styles.infoLabel}>{f.fieldType}</span>
              <button
                className={styles.deleteFieldBtn}
                onClick={() => {
                  apiFetch(`/field/${f.id}?candidateId=${candidateId}`, {
                    method: 'DELETE',
                    headers: authHeaders(),
                  }).then(() => setFields(prev => prev.filter(x => x.id !== f.id)))
                }}
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
