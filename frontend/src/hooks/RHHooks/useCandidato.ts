import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch, authHeaders, decodeToken, API_URL } from '../../services/api'
import type { Candidate, Field } from '../../types'

export function useCandidato() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState<Field[]>([])
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [toast, setToast] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDysrupModal, setShowDysrupModal] = useState(false)
  const [dysrupLoading, setDysrupLoading] = useState(false)
  const [dysrupError, setDysrupError] = useState<string | null>(null)
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [checklistLoading, setChecklistLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setUser(decodeToken())
      try {
        const data = await apiFetch<Candidate>(`/candidates/${id}`, { headers: authHeaders() })
        setCandidate(data)
        const fieldsData = await apiFetch<Field[]>(`/field/${id}`, { headers: authHeaders() })
        setFields(fieldsData.filter(f => f.scope === 'CANDIDATE'))
      } catch {
        navigate('/rh')
      }
    }
    load()
  }, [])

  async function refresh() {
    const updated = await apiFetch<Candidate>(`/candidates/${id}`, { headers: authHeaders() })
    setCandidate(updated)
  }

  async function handleDownload(endpoint: string, filename: string) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await apiFetch(`/candidates/delete/${id}`, { method: 'DELETE', headers: authHeaders() })
      navigate('/rh')
    } catch {
      setDeleteLoading(false)
    }
  }

  async function handleResendForm() {
    try {
      await apiFetch(`/candidates/${id}/resend-form`, { method: 'POST', headers: authHeaders() })
      setToast('Formulário reenviado!')
    } catch {
      setToast('Erro ao reenviar formulário.')
    }
  }

  async function handleOpenForm() {
    try {
      const url = await apiFetch<string>(`/candidates/formCandidate/${id}`, { headers: authHeaders() })
      window.open(url, '_blank')
    } catch (err) {
      console.error('Erro ao abrir formulário:', err)
    }
  }

  async function handleChangeStatus(status: string) {
    setLoading(true)
    try {
      const data = await apiFetch<Candidate>(`/candidates/changeStatus/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(status),
      })
      setCandidate(data)
      if (status === 'APPROVED') {
        const hasPending = !data.welcomeMessageSentAt || !data.routeDataSentAt || !data.dysrupRegisteredAt || !data.tiTicketCreatedAt
        if (hasPending) setShowChecklistModal(true)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function handleOpenTicket() {
    try {
      await apiFetch(`/candidates/${id}/create-ti-ticket`, { method: 'POST', headers: authHeaders() })
      await refresh()
      setToast('Chamado aberto para o T.I com sucesso!')
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Erro ao abrir chamado.')
    }
  }

  function handleRegisterDysrup() {
    setDysrupError(null)
    setShowDysrupModal(true)
  }

  async function handleDysrupConfirm() {
    setDysrupLoading(true)
    try {
      await apiFetch(`/dysrup/registrar-candidato/${id}`, { method: 'POST', headers: authHeaders() })
      await refresh()
      setShowDysrupModal(false)
      setToast('Candidato cadastrado na Dysrup com sucesso!')
    } catch (e) {
      const message = e instanceof Error ? e.message : ''
      if (message.toLowerCase().includes('cpf') || message.toLowerCase().includes('existe') || message.toLowerCase().includes('conflict')) {
        setDysrupError(message)
      } else {
        setShowDysrupModal(false)
        setToast(message || 'Erro ao cadastrar na Dysrup.')
      }
    } finally {
      setDysrupLoading(false)
    }
  }

  async function handleSendWelcome() {
    try {
      await apiFetch(`/candidates/${id}/send-welcome`, { method: 'POST', headers: authHeaders() })
      await refresh()
      setToast('Mensagem de boas-vindas enviada!')
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Erro ao enviar mensagem.')
    }
  }

  async function handleSendRoute() {
    try {
      await apiFetch(`/candidates/${id}/send-route`, { method: 'POST', headers: authHeaders() })
      await refresh()
      setToast('Notificação de rota enviada!')
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Erro ao enviar notificação.')
    }
  }

  async function handleChecklistAction(action: 'welcome' | 'route' | 'dysrup' | 'ticket') {
    try {
      if (action === 'welcome') await apiFetch(`/candidates/${id}/send-welcome`, { method: 'POST', headers: authHeaders() })
      if (action === 'route')   await apiFetch(`/candidates/${id}/send-route`,   { method: 'POST', headers: authHeaders() })
      if (action === 'dysrup')  await apiFetch(`/dysrup/registrar-candidato/${id}`, { method: 'POST', headers: authHeaders() })
      if (action === 'ticket')  await apiFetch(`/candidates/${id}/create-ti-ticket`, { method: 'POST', headers: authHeaders() })
      await refresh()
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Erro ao executar ação.')
    }
  }

  async function handleRunAllPending() {
    if (!candidate) return
    setChecklistLoading(true)
    try {
      if (!candidate.welcomeMessageSentAt) await apiFetch(`/candidates/${id}/send-welcome`, { method: 'POST', headers: authHeaders() })
      if (!candidate.routeDataSentAt)      await apiFetch(`/candidates/${id}/send-route`,   { method: 'POST', headers: authHeaders() })
      if (!candidate.dysrupRegisteredAt)   await apiFetch(`/dysrup/registrar-candidato/${id}`, { method: 'POST', headers: authHeaders() })
      if (!candidate.tiTicketCreatedAt)    await apiFetch(`/candidates/${id}/create-ti-ticket`, { method: 'POST', headers: authHeaders() })
      await refresh()
      setShowChecklistModal(false)
      setToast('Todas as pendências foram concluídas!')
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Erro ao executar pendências.')
    } finally {
      setChecklistLoading(false)
    }
  }

  return {
    id,
    navigate,
    candidate, setCandidate,
    user,
    loading,
    fields, setFields,
    toast, setToast,
    showEditModal, setShowEditModal,
    showDeleteModal, setShowDeleteModal,
    deleteLoading,
    showFieldModal, setShowFieldModal,
    showDysrupModal, setShowDysrupModal,
    dysrupLoading, dysrupError, setDysrupError,
    showChecklistModal, setShowChecklistModal,
    checklistLoading,
    handleChecklistAction,
    handleRunAllPending,
    handleDelete,
    handleResendForm,
    handleOpenForm,
    handleChangeStatus,
    handleOpenTicket,
    handleRegisterDysrup,
    handleDysrupConfirm,
    handleSendWelcome,
    handleSendRoute,
    handleDownload,
  }
}
