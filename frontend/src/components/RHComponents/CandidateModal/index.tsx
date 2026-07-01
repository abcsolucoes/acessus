import { useState, useEffect } from "react"
import { apiFetch, authHeaders } from "../../../services/api"
import { isValidCpf, formatCpf, formatPhone } from '../../../utils/format'
import { DysrupConfirmModal } from '../DysrupConfirmModal'
import type { Candidate } from '../../../types'
import styles from './style.module.css'
import { useRoutePhoto } from "../../../hooks/RHHooks/useRoutePhoto"

type Props = {
    onClose: () => void
    onSuccess: () => void
    initialData?: Candidate
}

export function CandidateModal({ onClose, onSuccess, initialData }: Props) {
    const isEditing = !!initialData

    const [name, setName] = useState(initialData?.name ?? '')
    // E-mail, nascimento e endereço só são preenchidos pelo próprio candidato no
    // formulário de admissão — esse modal nunca os edita, só carrega o valor atual
    // pra reenviar sem alterar (o backend exige esses campos no payload do update).
    const [email] = useState(initialData?.email ?? '')
    const [cpf, setCpf] = useState(initialData?.cpf ?? '')
    const [telephone, setTelephone] = useState(initialData?.telephone ?? '')
    const [birthDate] = useState(initialData?.birthDate ?? '')

    const [zipcode] = useState(initialData?.zipcode ?? '')
    const [addressNumber] = useState(initialData?.addressNumber ?? '')
    const [complement] = useState(initialData?.complement ?? '')

    const [position, setPosition] = useState(initialData?.position ?? '')
    const [admissionDate, setAdmissionDate] = useState(initialData?.admissionDate ?? '')
    const [routeName, setRouteName] = useState(initialData?.routeName ?? '')
    const [teamName, setTeamName] = useState(initialData?.teamName ?? '')
    const [itineraries, setItineraries] = useState<{ itinerary_id: number; itinerary_description: string }[]>([])

    const [routePhoto, setRoutePhoto] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [registered, setRegistered] = useState<{ id: number; name: string } | null>(null)
    const [dysrupLoading, setDysrupLoading] = useState(false)
    const [dysrupError, setDysrupError] = useState<string | null>(null)

    useEffect(() => {
        apiFetch<{ itinerary_id: number; itinerary_description: string }[]>('/dysrup/itineraries', {
            headers: authHeaders(),
        }).then(setItineraries).catch(() => { })
    }, [])

    const { url: currentPhotoUrl, isImage: currentPhotoIsImage } = useRoutePhoto(initialData?.id, initialData?.hasRoutePhoto)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (name.trim().length < 3) { setError('Nome deve ter pelo menos 3 caracteres'); setLoading(false); return }
        if (!isValidCpf(cpf)) { setError('CPF inválido'); setLoading(false); return }
        if (telephone.length < 8) { setError('Telefone inválido'); setLoading(false); return }

        try {
            const data = {
                name,
                email: email || null,
                cpf: cpf.replace(/\D/g, ''),
                telephone: telephone.replace(/\D/g, ''),
                position: position || null,
                admissionDate: admissionDate || null,
                birthDate: birthDate || null,
                zipcode: zipcode.replace(/\D/g, '') || null,
                addressNumber: addressNumber || null,
                complement: complement || null,
                routeName: routeName || null,
                teamName: teamName || null,
            }

            const formData = new FormData()
            formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
            if (routePhoto) formData.append('routePhoto', routePhoto)

            if (isEditing) {
                await apiFetch<Candidate>(`/candidates/${initialData!.id}`, {
                    method: 'PUT',
                    headers: { ...authHeaders() },
                    body: formData,
                })
                onSuccess()
                onClose()
            } else {
                const candidate = await apiFetch<Candidate>('/candidates/register', {
                    method: 'POST',
                    headers: { ...authHeaders() },
                    body: formData,
                })
                onSuccess()

                // Só oferece cadastrar na Dysrup na hora se já tiver o que ela exige —
                // no cadastro normal isso ainda não existe (vem depois, pelo formulário
                // que o próprio candidato preenche).
                const readyForDysrup = !!(candidate.zipcode && candidate.addressNumber && candidate.birthDate)
                if (readyForDysrup) {
                    setRegistered({ id: candidate.id, name: candidate.name })
                } else {
                    onClose()
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : isEditing ? 'Erro ao atualizar candidato' : 'Erro ao cadastrar candidato')
        } finally {
            setLoading(false)
        }
    }

    async function handleDysrupConfirm() {
        if (!registered) return
        setDysrupLoading(true)
        try {
            await apiFetch(`/dysrup/registrar-candidato/${registered.id}`, {
                method: 'POST',
                headers: authHeaders(),
            })
            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : ''
            if (message.toLowerCase().includes('cpf') || message.toLowerCase().includes('existe') || message.toLowerCase().includes('conflict')) {
                setDysrupError(message)
            } else {
                onClose()
            }
        } finally {
            setDysrupLoading(false)
        }
    }

    if (registered) {
        return (
            <DysrupConfirmModal
                candidateName={registered.name}
                onConfirm={handleDysrupConfirm}
                onSkip={onClose}
                error={dysrupError}
                loading={dysrupLoading}
            />
        )
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{isEditing ? 'Editar candidato' : 'Novo candidato'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>

                    <p className={styles.sectionTitle}>Dados pessoais</p>

                    <div className={styles.fullWidth}>
                        <label>Nome completo <span className={styles.required}>*</span></label>
                        <input
                            placeholder="Nome do candidato"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.grid2}>
                        <div>
                            <label>CPF <span className={styles.required}>*</span></label>
                            <input
                                placeholder="000.000.000-00"
                                value={formatCpf(cpf)}
                                onChange={e => setCpf(e.target.value.replace(/\D/g, ''))}
                                maxLength={14}
                            />
                        </div>
                        <div>
                            <label>Telefone <span className={styles.required}>*</span></label>
                            <input
                                placeholder="(11) 99999-0000"
                                value={formatPhone(telephone)}
                                onChange={e => setTelephone(e.target.value.replace(/\D/g, ''))}
                                maxLength={15}
                            />
                        </div>
                    </div>

                    <p className={styles.sectionTitle}>Cargo e equipe</p>

                    <div className={styles.grid2}>
                        <div>
                            <label>Cargo <span className={styles.optional}>(opcional)</span></label>
                            <input
                                placeholder="Ex: Promotor, Analista..."
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Data de admissão <span className={styles.optional}>(opcional)</span></label>
                            <input
                                type="date"
                                value={admissionDate}
                                onChange={e => setAdmissionDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.grid2}>
                        <div>
                            <label>Equipe <span className={styles.optional}>(opcional)</span></label>
                            <select value={teamName} onChange={e => setTeamName(e.target.value)}>
                                <option value="">Selecione uma equipe</option>
                                {itineraries.map(i => (
                                    <option key={i.itinerary_id} value={i.itinerary_description}>
                                        {i.itinerary_description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Rota <span className={styles.optional}>(opcional)</span></label>
                            <input
                                placeholder="Ex: M - 020"
                                value={routeName}
                                onChange={e => setRouteName(e.target.value)}
                            />
                        </div>
                    </div>

                    <p className={styles.sectionTitle}>Foto da rota <span className={styles.optional}>(opcional)</span></p>

                    <div className={styles.fullWidth}>
                        {isEditing && initialData?.hasRoutePhoto && !routePhoto && (
                            <div className={styles.currentFile}>
                                {currentPhotoUrl && currentPhotoIsImage ? (
                                    <img src={currentPhotoUrl} alt="Foto da rota atual" className={styles.currentFileThumb} />
                                ) : (
                                    <span className={styles.uploadedIcon}>📄</span>
                                )}
                                <div className={styles.currentFileInfo}>
                                    <span className={styles.currentFileLabel}>Arquivo atual</span>
                                    {currentPhotoUrl && (
                                        <a href={currentPhotoUrl} target="_blank" rel="noreferrer" className={styles.currentFileView}>
                                            Visualizar
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                        {routePhoto ? (
                            <div className={styles.uploadedFile}>
                                <span className={styles.uploadedIcon}>📄</span>
                                <span className={styles.uploadedName}>{routePhoto.name}</span>
                                <button type="button" className={styles.uploadedRemove} onClick={() => setRoutePhoto(null)}>✕</button>
                            </div>
                        ) : (
                            <label className={styles.uploadArea}>
                                <span className={styles.uploadIcon}>↑</span>
                                <span className={styles.uploadTitle}>{isEditing && initialData?.hasRoutePhoto ? 'Selecionar novo arquivo (substitui o atual)' : 'Selecionar arquivo'}</span>
                                <span className={styles.uploadHint}>JPG, PNG ou PDF</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    className={styles.fileInput}
                                    onChange={e => setRoutePhoto(e.target.files?.[0] ?? null)}
                                />
                            </label>
                        )}
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? (isEditing ? 'Salvando…' : 'Cadastrando…') : (isEditing ? 'Salvar' : 'Cadastrar candidato')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
