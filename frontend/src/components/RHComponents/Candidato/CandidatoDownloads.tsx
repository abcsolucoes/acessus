import styles from './CandidatoDownloads.module.css'

type Props = {
  candidateId: string | undefined
  candidateName: string | undefined
  onDownload: (endpoint: string, filename: string) => void
}

export function CandidatoDownloads({ candidateId, candidateName, onDownload }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Downloads</h2>
      <div className={styles.downloadCards}>
        <button
          className={styles.downloadCard}
          onClick={() => onDownload(`/candidates/${candidateId}/report`, `relatorio_${candidateName ?? candidateId}.docx`)}
        >
          <span className={styles.downloadIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </span>
          <span className={styles.downloadInfo}>
            <strong>Relatório</strong>
            <small>.docx</small>
          </span>
          <svg className={styles.downloadArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
        <button
          className={styles.downloadCard}
          onClick={() => onDownload(`/candidates/${candidateId}/files/zip`, `documentos_${candidateName ?? candidateId}.zip`)}
        >
          <span className={styles.downloadIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </span>
          <span className={styles.downloadInfo}>
            <strong>Documentos</strong>
            <small>.zip</small>
          </span>
          <svg className={styles.downloadArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
