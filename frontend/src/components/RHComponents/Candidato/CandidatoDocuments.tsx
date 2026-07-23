import type { Field, FieldValueResponse } from '../../../types'
import { buildDocumentFileName, formatDownloadProgress, type DownloadProgress } from '../../../utils/format'
import styles from './CandidatoDocuments.module.css'

type Props = {
  documents: FieldValueResponse[]
  fields: Field[]
  candidateId: string | undefined
  candidateName: string | undefined
  downloadingEndpoint: string | null
  downloadProgress: DownloadProgress | null
  onDownload: (endpoint: string, filename: string) => void
  onDelete: (valueId: number) => void
}

function SpinnerIcon() {
  return (
    <svg className={styles.spinning} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

export function CandidatoDocuments({ documents, fields, candidateId, candidateName, downloadingEndpoint, downloadProgress, onDownload, onDelete }: Props) {
  const fieldNameById = new Map(fields.map(f => [f.id, f.fieldName]))

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Documentos enviados</h2>
      {documents.length === 0 ? (
        <p className={styles.empty}>Nenhum documento enviado ainda.</p>
      ) : (
        <div className={styles.list}>
          {documents.map(doc => {
            const endpoint = `/candidates/${candidateId}/files/${doc.valueId}`
            const downloading = downloadingEndpoint === endpoint
            const fieldName = fieldNameById.get(doc.fieldId) ?? 'Documento'
            const downloadName = doc.fileName ? buildDocumentFileName(fieldName, candidateName ?? '', doc.fileName) : `documento-${doc.valueId}`

            return (
              <div key={doc.valueId} className={styles.item}>
                <button
                  className={styles.itemMain}
                  disabled={downloadingEndpoint !== null}
                  onClick={() => onDownload(endpoint, downloadName)}
                >
                  <span className={styles.itemIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <span className={styles.itemInfo}>
                    <strong>{fieldName}</strong>
                    <small>{downloading ? formatDownloadProgress(downloadProgress) : doc.fileName}</small>
                  </span>
                  {downloading ? <SpinnerIcon /> : (
                    <svg className={styles.itemArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  )}
                </button>
                <button
                  className={styles.deleteBtn}
                  disabled={downloadingEndpoint !== null}
                  title="Excluir documento"
                  onClick={() => onDelete(doc.valueId)}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
