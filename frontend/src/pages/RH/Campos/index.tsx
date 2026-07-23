import { useEffect, useState } from "react";
import { apiFetch, authHeaders, decodeToken } from "../../../services/api";

import type { Field } from "../../../types";
import { useNavigate } from "react-router-dom";
import { Header } from "../../../components/Header";

import styles from "./style.module.css"
import { FieldModal } from "../../../components/RHComponents/FieldModal";

const FIELD_TYPE_LABEL: Record<string, string> = {
  TEXT: 'Texto',
  DOC: 'Documento',
  DATE: 'Data',
  SELECT: 'Seleção',
}

const STEP_LABEL: Record<string, string> = {
  personalData: 'Dados pessoais',
  address: 'Endereço',
  docs: 'Documentos',
  dependentsDocs: 'Docs. dependentes',
  bankDetails: 'Dados bancários',
  transport: 'Transporte',
  emergencyContact: 'Contato de emergência',
}

// Só quem gerencia os campos padrão (ADMISSION) — trava real está no backend,
// isso aqui só evita mostrar um botão que vai dar 403. Lista separada por vírgula.
const DEV_EMAILS = new Set(
  (import.meta.env.VITE_DEV_EMAIL as string | undefined ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
)

export function RHCamposPage() {
  const [fields, setFields] = useState<Field[]>([])
  const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()

  const isDev = !!user?.sub && DEV_EMAILS.has(user.sub.toLowerCase())

  useEffect(() => {
    setUser(decodeToken())
    apiFetch<Field[]>('/field', { headers: authHeaders() })
      .then(data => setFields(data))
      .catch(() => {})
  }, [])

  function handleDelete(id: number) {
    setDeleteError('')
    apiFetch(`/field/${id}`, { method: 'DELETE', headers: authHeaders() })
      .then(() => setFields(prev => prev.filter(f => f.id !== id)))
      .catch(() => setDeleteError('Erro ao excluir campo. Tente novamente.'))
  }

  return (
    <>
      <Header moduleName="RH — Campos" userName={user?.name ?? ''} />
      <main className={styles.main}>

        <div className={styles.top}>
          <button className={styles.backBtn} onClick={() => navigate('/rh')}>
            ← Voltar
          </button>
          <h1 className={styles.title}>Campos padrão</h1>
          {isDev && (
            <button className={styles.addBtn} onClick={() => setShowModal(true)}>
              Novo campo
            </button>
          )}
        </div>

        {deleteError && <p className={styles.error}>{deleteError}</p>}

        <div className={styles.list}>
          {fields.length === 0 ? (
            <p className={styles.empty}>Nenhum campo cadastrado.</p>
          ) : (
            fields.map(f => (
              <div key={f.id} className={styles.card}>
                <div className={styles.cardName}>{f.fieldName}</div>
                <div className={styles.cardInfo}>{FIELD_TYPE_LABEL[f.fieldType]}</div>
                <div className={styles.cardInfo}>{STEP_LABEL[f.step]}</div>
                <div className={styles.actions}>
                  {(f.scope !== 'ADMISSION' || isDev) && (
                    <>
                      <button
                        className={styles.editBtn}
                        onClick={() => setEditingField(f)}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(f.id)}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <FieldModal
            onClose={() => setShowModal(false)}
            onSuccess={field => setFields(prev => [...prev, field])}
          />
        )}

        {editingField && (
          <FieldModal
            initialField={editingField}
            onClose={() => setEditingField(null)}
            onSuccess={field => setFields(prev => prev.map(f => f.id === field.id ? field : f))}
          />
        )}

      </main>
    </>
  )
}
