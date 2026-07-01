import { useState, useEffect } from "react"
import { apiFetch, authHeaders } from "../../../services/api"
import { isValidEmail, isValidCpf, formatCpf, formatPhone } from '../../../utils/format'
import { DysrupConfirmModal } from '../DysrupConfirmModal'
import type { Candidate } from '../../../types'
import styles from './style.module.css'
import { useCepLookup } from "../../../hooks/RHHooks/useCepLookup"

type Props = {
    onClose: () => void
    onSuccess: () => void
    initialData?: Candidate
}

function formatCep(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length > 5) return digits.slice(0, 5) + '-' + digits.slice(5)
    return digits
}

export function CandidateModal({ onClose, onSuccess, initialData }: Props) {
    const isEditing = !!initialData

    const [name, setName] = useState(initialData?.name ?? '')
    const [email, setEmail] = useState(initialData?.email ?? '')
    const [cpf, setCpf] = useState(initialData?.cpf ?? '')
    const [telephone, setTelephone] = useState(initialData?.telephone ?? '')
    const [birthDate, setBirthDate] = useState(initialData?.birthDate ?? '')

    const [zipcode, setZipcode] = useState(initialData?.zipcode ?? '')
    const [addressNumber, setAddressNumber] = useState(initialData?.addressNumber ?? '')
    const [complement, setComplement] = useState(initialData?.complement ?? '')

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

    const { address, district, city, addressState, loading: cepLoading, error: cepError } = useCepLookup(zipcode)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (name.trim().length < 3) { setError('Nome deve ter pelo menos 3 caracteres'); setLoading(false); return }
        if (!isValidEmail(email)) { setError('E-mail inválido'); setLoading(false); return }
        if (!isValidCpf(cpf)) { setError('CPF inválido'); setLoading(false); return }
        if (telephone.length < 8) { setError('Telefone inválido'); setLoading(false); return }
        if (!birthDate) { setError('Informe a data de nascimento'); setLoading(false); return }
        if (zipcode.replace(/\D/g, '').length !== 8) { setError('Informe o CEP'); setLoading(false); return }
        if (!addressNumber.trim()) { setError('Informe o número do endereço'); setLoading(false); return }
        if (!admissionDate) { setError('Data de admissão obrigatória'); setLoading(false); return }

        try {
            const data = {
                name, email,
                cpf: cpf.replace(/\D/g, ''),
                telephone: telephone.replace(/\D/g, ''),
                position, admissionDate,
                birthDate: birthDate || null,
                zipcode: zipcode.replace(/\D/g, '') || null,
                addressNumber: addressNumber || null,
                complement: complement || null,
                routeName, teamName,
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
                setRegistered({ id: candidate.id, name: candidate.name })
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
                        <label>Nome completo</label>
                        <input
                            placeholder="Nome do candidato"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.grid2}>
                        <div>
                            <label>E-mail</label>
                            <input
                                placeholder="email@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>CPF</label>
                            <input
                                placeholder="000.000.000-00"
                                value={formatCpf(cpf)}
                                onChange={e => setCpf(e.target.value.replace(/\D/g, ''))}
                                maxLength={14}
                            />
                        </div>
                    </div>

                    <div className={styles.grid2}>
                        <div>
                            <label>Telefone</label>
                            <input
                                placeholder="(11) 99999-0000"
                                value={formatPhone(telephone)}
                                onChange={e => setTelephone(e.target.value.replace(/\D/g, ''))}
                                maxLength={15}
                            />
                        </div>
                        <div>
                            <label>Data de nascimento</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={e => setBirthDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <p className={styles.sectionTitle}>Endereço</p>

                    <div className={styles.grid2}>
                        <div>
                            <label>
                                CEP{cepLoading && <span className={styles.cepSpinner}> buscando…</span>}
                            </label>
                            <input
                                placeholder="00000-000"
                                value={formatCep(zipcode)}
                                onChange={e => setZipcode(e.target.value.replace(/\D/g, ''))}
                                maxLength={9}
                            />
                            {cepError && <span className={styles.fieldError}>{cepError}</span>}
                        </div>
                        <div>
                            <label>Estado</label>
                            <input placeholder="UF" value={addressState} readOnly maxLength={2} />
                        </div>
                    </div>

                    <div className={styles.fullWidth}>
                        <label>Logradouro</label>
                        <input placeholder="Preenchido automaticamente pelo CEP" value={address} readOnly />
                    </div>

                    <div className={styles.grid2}>
                        <div>
                            <label>Número</label>
                            <input
                                placeholder="Ex: 950"
                                value={addressNumber}
                                onChange={e => setAddressNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Complemento <span className={styles.optional}>(opcional)</span></label>
                            <input
                                placeholder="Apto, bloco..."
                                value={complement}
                                onChange={e => setComplement(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.grid2}>
                        <div>
                            <label>Bairro</label>
                            <input placeholder="Bairro" value={district} readOnly />
                        </div>
                        <div>
                            <label>Cidade</label>
                            <input placeholder="Cidade" value={city} readOnly />
                        </div>
                    </div>

                    <p className={styles.sectionTitle}>Cargo e equipe</p>

                    <div className={styles.grid2}>
                        <div>
                            <label>Cargo</label>
                            <input
                                placeholder="Ex: Promotor, Analista..."
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Data de admissão</label>
                            <input
                                type="date"
                                value={admissionDate}
                                onChange={e => setAdmissionDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.grid2}>
                        <div>
                            <label>Equipe</label>
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
                            <label>Rota</label>
                            <input
                                placeholder="Ex: M - 020"
                                value={routeName}
                                onChange={e => setRouteName(e.target.value)}
                            />
                        </div>
                    </div>

                    <p className={styles.sectionTitle}>Foto da rota</p>

                    <div className={styles.fullWidth}>
                        {routePhoto ? (
                            <div className={styles.uploadedFile}>
                                <span className={styles.uploadedIcon}>📄</span>
                                <span className={styles.uploadedName}>{routePhoto.name}</span>
                                <button type="button" className={styles.uploadedRemove} onClick={() => setRoutePhoto(null)}>✕</button>
                            </div>
                        ) : (
                            <label className={styles.uploadArea}>
                                <span className={styles.uploadIcon}>↑</span>
                                <span className={styles.uploadTitle}>{isEditing ? 'Selecionar nova foto (substitui a atual)' : 'Selecionar arquivo'}</span>
                                <span className={styles.uploadHint}>JPG, PNG ou WebP</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
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
