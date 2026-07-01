import { formatCpf, formatPhone, formatDate } from '../../../utils/format'
import type { Candidate } from '../../../types'
import { useRoutePhoto } from '../../../hooks/RHHooks/useRoutePhoto'
import styles from './CandidatoInfo.module.css'

type Props = {
  candidate: Candidate | null
}

export function CandidatoInfo({ candidate }: Props) {
  const { url: routePhotoUrl, isImage: routePhotoIsImage } = useRoutePhoto(candidate?.id, candidate?.hasRoutePhoto)

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
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Equipe</span>
          <span className={styles.infoValue}>{candidate?.teamName || '—'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Rota</span>
          <span className={styles.infoValue}>{candidate?.routeName || '—'}</span>
        </div>
      </div>

      {candidate?.hasRoutePhoto && (
        <div className={styles.routePhotoBlock}>
          <span className={styles.infoLabel}>Foto da rota</span>
          {routePhotoUrl ? (
            routePhotoIsImage ? (
              <a href={routePhotoUrl} target="_blank" rel="noreferrer">
                <img src={routePhotoUrl} alt="Foto da rota" className={styles.routePhotoThumb} />
              </a>
            ) : (
              <a href={routePhotoUrl} target="_blank" rel="noreferrer" className={styles.routePhotoLink}>
                Ver arquivo (PDF)
              </a>
            )
          ) : (
            <span className={styles.infoValue}>Carregando…</span>
          )}
        </div>
      )}
    </section>
  )
}
