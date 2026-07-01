import { formatCpf, formatPhone, formatDate } from '../../../utils/format'
import type { Candidate } from '../../../types'
import styles from './CandidatoInfo.module.css'

type Props = {
  candidate: Candidate | null
}

export function CandidatoInfo({ candidate }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Informações</h2>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>E-mail</span>
          <span className={styles.infoValue}>{candidate?.email}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>CPF</span>
          <span className={styles.infoValue}>{formatCpf(candidate?.cpf ?? '')}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Telefone</span>
          <span className={styles.infoValue}>{formatPhone(candidate?.telephone ?? '')}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Cargo</span>
          <span className={styles.infoValue}>{candidate?.position}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Data de admissão</span>
          <span className={styles.infoValue}>{formatDate(candidate?.admissionDate)}</span>
        </div>
      </div>
    </section>
  )
}
