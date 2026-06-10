import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import type { Candidate, Field, FieldValueResponse } from "../../types"
import styles from './style.module.css'
import { apiFetch } from "../../services/api"

const STEPS = ['personalData', 'address', 'docs', 'dependentsDocs', 'bankDetails']
const STEP_LABELS = ['Dados pessoais', 'Endereço', 'Documentos', 'Docs. dependentes', 'Dados bancários']
const TYPE_MAP: Record<string, string> = { TEXT: 'text', DOC: 'file', DATE: 'date' }
const SIZE_MAP: Record<string, string> = { MEDIUM: 'fieldItem', BIG: 'fieldItemFull' }

export function FormularioPage() {
  const { token } = useParams()

  const [candidate, setCandidate]       = useState<Candidate | null>(null)
  const [fields, setFields]             = useState<Field[]>([])
  const [step, setStep]                 = useState(0)
  const [values, setValues]             = useState<Record<number, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, string>>({})  // fieldId → filename
  const [uploading, setUploading]       = useState<Record<number, boolean>>({})   // fieldId → uploading
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({})   // fieldId → erro
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [submitted, setSubmitted]       = useState(false)

  const stepFields = fields.filter(f => f.step === STEPS[step])

  // ── Carrega candidato + campos ───────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const candidateData = await apiFetch<Candidate>(`/candidates/validate?token=${token}`)
        setCandidate(candidateData)

        const [fieldsData, savedValues] = await Promise.all([
          apiFetch<Field[]>(`/field/public/${candidateData.id}?token=${token}`),
          apiFetch<FieldValueResponse[]>(`/fieldValue/${candidateData.id}/values?token=${token}`),
        ])
        setFields(fieldsData)

        // Pré-popula os campos com valores já salvos
        const initialValues: Record<number, string> = {}
        const initialUploaded: Record<number, string> = {}
        savedValues.forEach(v => {
          const field = fieldsData.find(f => f.id === v.fieldId)
          if (!field) return
          if (field.fieldType === 'DOC') {
            if (v.fileName) initialUploaded[v.fieldId] = v.fileName
          } else {
            if (v.value) initialValues[v.fieldId] = v.value
          }
        })
        setValues(initialValues)
        setUploadedFiles(initialUploaded)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Link inválido ou formulário encerrado.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Salva valores TEXT/DATE do step atual na API ─────────
  async function saveCurrentStep() {
    const toSave = stepFields
      .filter(f => f.fieldType !== 'DOC' && values[f.id] !== undefined)
      .map(f => ({ fieldId: f.id, value: values[f.id] }))

    if (toSave.length === 0) return

    await apiFetch(`/fieldValue/${candidate!.id}/values?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: toSave }),
    })
  }

  // ── Upload imediato ao selecionar arquivo ────────────────
  async function handleFileUpload(fieldId: number, file: File) {
    setUploading(prev => ({ ...prev, [fieldId]: true }))
    setUploadErrors(prev => ({ ...prev, [fieldId]: '' }))
    try {
      const formData = new FormData()
      formData.append('fieldId', String(fieldId))
      formData.append('file', file)

      await apiFetch(`/candidates/${candidate!.id}/upload?token=${token}`, {
        method: 'POST',
        body: formData,
      })
      setUploadedFiles(prev => ({ ...prev, [fieldId]: file.name }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar arquivo'
      setUploadErrors(prev => ({ ...prev, [fieldId]: msg }))
      console.error('Upload erro:', err)
    } finally {
      setUploading(prev => ({ ...prev, [fieldId]: false }))
    }
  }

  // ── Próximo: salva e avança (ou envia no último step) ────
  async function handleNext() {
    setSaving(true)
    try {
      await saveCurrentStep()
      if (step === STEPS.length - 1) {
        await apiFetch(`/candidates/changeStatus/${candidate!.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify('UNDER_ANALYSIS'),
        })
        setSubmitted(true)
      } else {
        setStep(prev => prev + 1)
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Anterior: salva e volta ──────────────────────────────
  async function handleBack() {
    setSaving(true)
    try {
      await saveCurrentStep()
    } finally {
      setSaving(false)
      setStep(prev => prev - 1)  // volta mesmo que o save falhe
    }
  }

  // ── Telas de estado ───────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingScreen}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Carregando formulário...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.fullScreen}>
          <div className={styles.errorBox}>
            <div className={styles.errorIcon}>!</div>
            <h2 className={styles.errorTitle}>Formulário indisponível</h2>
            <p className={styles.errorDesc}>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.fullScreen}>
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Formulário enviado!</h2>
            <p className={styles.successDesc}>
              Seus dados foram recebidos com sucesso. Aguarde o contato da equipe de RH.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulário ────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Cabeçalho */}
        <header className={styles.formHeader}>
          <span className={styles.brand}>Acessus</span>
          <span className={styles.candidateName}>{candidate?.name ?? ''}</span>
        </header>

        {/* Barra de steps */}
        <div className={styles.stepBar}>
          {STEPS.map((s, i) => (
            <div key={s} className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${i === step ? styles.stepActive : i < step ? styles.stepDone : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={styles.stepLabel}>{STEP_LABELS[i]}</span>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        {/* Card do step */}
        <div className={styles.formCard}>
          <h2 className={styles.stepTitle}>{STEP_LABELS[step]}</h2>

          {stepFields.length === 0 ? (
            <p className={styles.emptyStep}>Nenhum campo configurado para esta etapa.</p>
          ) : (
            <div className={styles.fieldGrid}>
              {stepFields.map(f => (
                <div key={f.id} className={styles[SIZE_MAP[f.fieldSize]]}>

                  {f.fieldType === 'DOC' ? (
                    <>
                      <label className={styles.fieldLabel}>{f.fieldName}</label>

                      {/* Mostra área de upload enquanto não tiver arquivo */}
                      {!uploadedFiles[f.id] && (
                        uploading[f.id] ? (
                          <div className={styles.uploadingState}>
                            <div className={styles.spinnerSm} />
                            <span className={styles.uploadText}>Enviando...</span>
                          </div>
                        ) : (
                          <div className={styles.uploadOptions}>

                            {/* Opção 1: selecionar arquivo */}
                            <label className={styles.uploadOption}>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span className={styles.uploadOptionTitle}>Selecionar arquivo</span>
                              <span className={styles.uploadHint}>PDF, JPG ou PNG</span>
                              <input
                                type="file"
                                className={styles.fileInput}
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (file) handleFileUpload(f.id, file)
                                }}
                              />
                            </label>

                            <div className={styles.uploadDivider} />

                            {/* Opção 2: câmera */}
                            <label className={styles.uploadOption}>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="13" r="4"
                                  stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                              <span className={styles.uploadOptionTitle}>Tirar foto</span>
                              <span className={styles.uploadHint}>Câmera</span>
                              <input
                                type="file"
                                className={styles.fileInput}
                                accept="image/*"
                                capture="environment"
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (file) handleFileUpload(f.id, file)
                                }}
                              />
                            </label>

                          </div>
                        )
                      )}

                      {/* Erro de upload */}
                      {uploadErrors[f.id] && (
                        <p className={styles.uploadError}>{uploadErrors[f.id]}</p>
                      )}

                      {/* Mostra arquivo enviado */}
                      {uploadedFiles[f.id] && (
                        <div className={styles.uploadedFile}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                              stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                          </svg>
                          <span className={styles.uploadedName}>{uploadedFiles[f.id]}</span>
                          <button
                            type="button"
                            className={styles.uploadedRemove}
                            onClick={() => setUploadedFiles(prev => {
                              const next = { ...prev }
                              delete next[f.id]
                              return next
                            })}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <label className={styles.fieldLabel}>{f.fieldName}</label>
                      <input
                        className={styles.input}
                        type={TYPE_MAP[f.fieldType]}
                        placeholder={f.fieldType === 'DATE' ? undefined : 'Digite aqui...'}
                        value={values[f.id] ?? ''}
                        onChange={e => setValues(prev => ({ ...prev, [f.id]: e.target.value }))}
                      />
                    </>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé de navegação */}
        <div className={styles.formNav}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            disabled={step === 0 || saving}
          >
            ← Anterior
          </button>
          <span className={styles.stepCount}>{step + 1} de {STEPS.length}</span>
          <button
            type="button"
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={saving}
          >
            {saving ? 'Salvando...' : step === STEPS.length - 1 ? 'Enviar ✓' : 'Próximo →'}
          </button>
        </div>

      </div>
    </div>
  )
}
