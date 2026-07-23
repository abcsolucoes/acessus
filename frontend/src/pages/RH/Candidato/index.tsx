import { Header } from "../../../components/Header"
import { Toast } from "../../../components/Toast"
import styles from './style.module.css'
import { FieldModal } from "../../../components/RHComponents/FieldModal"
import { DysrupConfirmModal } from "../../../components/RHComponents/DysrupConfirmModal"
import { useCandidato } from "../../../hooks/RHHooks/useCandidato"
import { CandidatoHero } from "../../../components/RHComponents/Candidato/CandidatoHero"
import { CandidatoInfo } from "../../../components/RHComponents/Candidato/CandidatoInfo"
import { CandidatoFields } from "../../../components/RHComponents/Candidato/CandidatoFields"
import { CandidatoStatus } from "../../../components/RHComponents/Candidato/CandidatoStatus"
import { CandidatoDownloads } from "../../../components/RHComponents/Candidato/CandidatoDownloads"
import { CandidatoDocuments } from "../../../components/RHComponents/Candidato/CandidatoDocuments"
import { CandidatoDeleteModal } from "../../../components/RHComponents/Candidato/CandidatoDeleteModal"
import { CandidatoChecklistModal } from "../../../components/RHComponents/Candidato/CandidatoChecklistModal"
import { CandidateModal } from "../../../components/RHComponents/CandidateModal"

export function RHCandidatoPage() {
  const {
    id,
    candidate,
    user,
    loading,
    fields, setFields,
    allFields,
    documents, handleDeleteDocument,
    toast, setToast,
    showEditModal, setShowEditModal,
    showDeleteModal, setShowDeleteModal,
    deleteLoading,
    showFieldModal, setShowFieldModal,
    navigate,
    handleRegisterDysrup,
    handleOpenForm,
    handleResendForm,
    handleSendWelcome,
    handleSendRoute,
    handleOpenTicket,
    showDysrupModal, setShowDysrupModal,
    dysrupLoading, dysrupError, setDysrupError,
    showChecklistModal, setShowChecklistModal,
    checklistLoading,
    handleChecklistAction,
    handleRunAllPending,
    handleDelete,
    handleChangeStatus,
    handleDysrupConfirm,
    handleDownload,
    downloadingEndpoint,
    downloadProgress,
  } = useCandidato()

  return (
    <>
      <Header moduleName="RH" userName={user?.name ?? ''} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <main className={styles.main}>

        {/* ── Breadcrumb ── */}
        <div className={styles.breadcrumb}>
          <button className={styles.backBtn} onClick={() => navigate('/rh')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Candidatos
          </button>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{candidate?.name ?? '...'}</span>
        </div>

        {/* ── Hero card ── */}
        <CandidatoHero
          candidate={candidate}
          loading={loading}
          onRegisterDysrup={handleRegisterDysrup}
          onOpenForm={handleOpenForm}
          onResendForm={handleResendForm}
          onSendWelcome={handleSendWelcome}
          onSendRoute={handleSendRoute}
          onOpenTicket={handleOpenTicket}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => setShowDeleteModal(true)}
        />

        {/* ── Grid principal ── */}
        <div className={styles.grid}>

          {/* ── Coluna esquerda ── */}
          <div className={styles.col}>

            <CandidatoInfo candidate={candidate} />

            <CandidatoFields
              fields={fields}
              setFields={setFields}
              candidateId={Number(id)}
              onAddField={() => setShowFieldModal(true)}
            />

          </div>

          {/* ── Coluna direita ── */}
          <div className={styles.col}>

            <CandidatoStatus
              candidateStatus={candidate?.candidateStatus}
              loading={loading}
              onChangeStatus={handleChangeStatus}
            />

            <CandidatoDownloads
              candidateId={id}
              candidateName={candidate?.name}
              downloadingEndpoint={downloadingEndpoint}
              downloadProgress={downloadProgress}
              onDownload={handleDownload}
            />

            <CandidatoDocuments
              documents={documents}
              fields={allFields}
              candidateId={id}
              candidateName={candidate?.name}
              downloadingEndpoint={downloadingEndpoint}
              downloadProgress={downloadProgress}
              onDownload={handleDownload}
              onDelete={handleDeleteDocument}
            />

          </div>
        </div>

        {showFieldModal && (
          <FieldModal
            candidateId={Number(id)}
            onClose={() => setShowFieldModal(false)}
            onSuccess={field => setFields(prev => [...prev, field])}
          />
        )}

      </main>

      {showEditModal && (
        <CandidateModal
          initialData={candidate ?? undefined}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => { setShowEditModal(false) }}
        />
      )}

      {showDeleteModal && (
        <CandidatoDeleteModal
          candidateName={candidate?.name ?? ''}
          deleteLoading={deleteLoading}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}


      {showChecklistModal && candidate && (
        <CandidatoChecklistModal
          candidate={candidate}
          checklistLoading={checklistLoading}
          onClose={() => setShowChecklistModal(false)}
          onAction={handleChecklistAction}
          onRunAll={handleRunAllPending}
        />
      )}

      {showDysrupModal && candidate && (
        <DysrupConfirmModal
          candidateName={candidate.name}
          onConfirm={handleDysrupConfirm}
          onSkip={() => { setShowDysrupModal(false); setDysrupError(null) }}
          error={dysrupError}
          loading={dysrupLoading}
        />
      )}
    </>
  )
}