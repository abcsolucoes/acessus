import { useState } from 'react'
import type { EmployeeProfile, EmployeeStatus } from '../../../../types'
import { criarFuncionario } from '../../../../services/FuncionarioService/funcionarioApi'
import { formatCpf, isValidCpf } from '../../../../utils/format'
import styles from './style.module.css'

type Props = {
    onClose: () => void
    onSuccess: () => void
}

const PROFILE_OPTIONS: { value: EmployeeProfile; label: string }[] = [
    { value: 'PARTNER', label: 'Sócio' },
    { value: 'SERVICE_PROVIDER', label: 'Prestador de serviço' },
]

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'EXPERIENCIA', label: 'Em contrato de experiência' },
    { value: 'FERIAS', label: 'Férias' },
    { value: 'FERIAS_VENCIDAS', label: 'Férias vencidas' },
    { value: 'AFASTADO', label: 'Afastado' },
    { value: 'ATESTADO_MEDICO_VENCIDO', label: 'Atestado médico vencido' },
    { value: 'AVISO_PREVIO', label: 'Aviso prévio' },
]

export function NovoFuncionarioModal({ onClose, onSuccess }: Props) {
    const [name, setName] = useState('')
    const [cpf, setCpf] = useState('')
    const [profile, setProfile] = useState<EmployeeProfile>('PARTNER')
    const [department, setDepartment] = useState('')
    const [position, setPosition] = useState('')
    const [state, setState] = useState('')
    const [city, setCity] = useState('')
    const [admissionDate, setAdmissionDate] = useState('')
    const [status, setStatus] = useState<EmployeeStatus>('ATIVO')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (name.trim().length < 3) { setError('Nome deve ter pelo menos 3 caracteres'); return }
        if (!isValidCpf(cpf)) { setError('CPF inválido'); return }
        if (state && state.trim().length !== 2) { setError('UF deve ter 2 letras'); return }

        setLoading(true)

        try {
            await criarFuncionario({
                name: name.trim(),
                cpf: cpf.replace(/\D/g, ''),
                profile,
                department: department.trim() || undefined,
                position: position.trim() || undefined,
                state: state.trim().toUpperCase() || undefined,
                city: city.trim() || undefined,
                admissionDate: admissionDate || undefined,
                status,
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao cadastrar funcionário')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Novo funcionário</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>

                    <p className={styles.sectionTitle}>Dados pessoais</p>

                    <div className={styles.fullWidth}>
                        <label>Nome completo <span className={styles.required}>*</span></label>
                        <input
                            placeholder="Nome do funcionário"
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
                            <label>Perfil <span className={styles.required}>*</span></label>
                            <select value={profile} onChange={e => setProfile(e.target.value as EmployeeProfile)}>
                                {PROFILE_OPTIONS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <p className={styles.sectionTitle}>Informações complementares <span className={styles.optional}>(opcional)</span></p>

                    <div className={styles.grid2}>
                        <div>
                            <label>Departamento</label>
                            <input
                                placeholder="Ex: Operação"
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>Cargo</label>
                            <input
                                placeholder="Ex: Consultor, Diretor..."
                                value={position}
                                onChange={e => setPosition(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.grid2}>
                        <div>
                            <label>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as EmployeeStatus)}>
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
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
                            <label>Cidade</label>
                            <input
                                placeholder="Ex: Belo Horizonte"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>UF</label>
                            <input
                                placeholder="MG"
                                value={state}
                                onChange={e => setState(e.target.value.toUpperCase())}
                                maxLength={2}
                            />
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Cadastrando…' : 'Cadastrar funcionário'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
