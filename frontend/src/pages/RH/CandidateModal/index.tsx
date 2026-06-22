import { useState, useEffect } from "react"
import { apiFetch, authHeaders } from "../../../services/api"
import { isValidEmail, isValidCpf, formatCpf, formatPhone } from '../../../utils/format'

import styles from './style.module.css'

type Props = {
    onClose: () => void
    onSuccess: () => void   // chamado quando o candidato for criado com sucesso
}

export function CandidateModal({ onClose, onSuccess }: Props) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [cpf, setCpf] = useState('')
    const [telephone, setTelephone] = useState('')
    const [position, setPosition] = useState('')
    const [admissionDate, setAdmissionDate] = useState('')
    const [routeName, setRouteName] = useState('')
    const [teamName, setTeamName] = useState('')
    const [itineraries, setItineraries] = useState<{ itinerary_id: number; itinerary_description: string }[]>([])
    const [routePhoto, setRoutePhoto] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        apiFetch<{ itinerary_id: number; itinerary_description: string }[]>('/dysrup/itineraries', {
            headers: authHeaders(),
        }).then(setItineraries).catch(() => {})
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('')
        setLoading(true)

        if (name.trim().length < 3) {
            setError('Nome deve ter pelo menos 3 caracteres')
            setLoading(false)
            return
        }
        if (!isValidEmail(email)) {
            setError('E-mail inválido')
            setLoading(false)
            return
        }
        if (!isValidCpf(cpf)) {
            setError('CPF inválido')
            setLoading(false)
            return
        }
        if (telephone.length < 8) {
            setError('Telefone inválido')
            setLoading(false)
            return
        }
        if (!admissionDate) {
            setError('Data de admissão obrigatória')
            setLoading(false)
            return
        }

        try {
            const formData = new FormData()
            formData.append('data', new Blob([JSON.stringify({ name, email, cpf, telephone, position, admissionDate, routeName, teamName })], { type: 'application/json' }))
            if (routePhoto) formData.append('routePhoto', routePhoto)

            await apiFetch('/candidates/register', {
                method: 'POST',
                headers: { ...authHeaders() },
                body: formData,
            })

            onSuccess()   // avisa o RHPage que um candidato foi criado
            onClose()     // fecha o modal
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao cadastrar candidato')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            {/* onClick no overlay fecha ao clicar fora */}

            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* stopPropagation impede que clicar dentro feche o modal */}

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Novo candidato</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    <div>
                        <label>Nome</label>
                        <input 
                            placeholder="Insira o nome do candidato"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

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
                        <label>Cargo</label>
                        <input
                            placeholder="Ex: Desenvolvedor, Analista..."
                            value={position}
                            onChange={e => setPosition(e.target.value)}
                        />
                    </div>

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

                    <div>
                        <label>Data de admissão</label>
                        <input
                            type="date"
                            value={admissionDate}
                            onChange={e => setAdmissionDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Foto da rota</label>
                        {routePhoto ? (
                            <div className={styles.uploadedFile}>
                                <span className={styles.uploadedIcon}>📄</span>
                                <span className={styles.uploadedName}>{routePhoto.name}</span>
                                <button
                                    type="button"
                                    className={styles.uploadedRemove}
                                    onClick={() => setRoutePhoto(null)}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <label className={styles.uploadArea}>
                                <span className={styles.uploadIcon}>↑</span>
                                <span className={styles.uploadTitle}>Selecionar arquivo</span>
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
                    <button type="submit" disabled={loading}>
                        {loading ? 'Cadastrando…' : 'Cadastrar'}
                    </button>
                </form>

            </div>
        </div>
    )
}
