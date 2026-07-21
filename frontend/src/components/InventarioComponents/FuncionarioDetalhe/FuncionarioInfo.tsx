import type { EmployeeProfile, Funcionario } from "../../../types"
import { formatCpf, formatDate } from "../../../utils/format";
import styles from "./FuncionarioInfo.module.css"

type Props = {
    funcionario: Funcionario | null;
}

export function FuncionarioInfo({ funcionario }: Props) {

    const PROFILE_LABEL: Record<EmployeeProfile, string> = {
        EMPLOYEE: 'Funcionário(a)',
        PARTNER: 'Sócio(a)',
        SERVICE_PROVIDER: 'Prestador de serviço',
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Informações</h2>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>CPF</span>
                    <span className={styles.infoValue}>{formatCpf(String(funcionario?.cpf))}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Empresa</span>
                    <span className={styles.infoValue}>{funcionario?.company.name}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Departamento</span>
                    <span className={styles.infoValue}>{funcionario?.department}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Cargo</span>
                    <span className={styles.infoValue}>{funcionario?.position}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Cidade/UF</span>
                    <span className={styles.infoValue}>{funcionario?.city}/{funcionario?.state}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Admissão</span>
                    <span className={styles.infoValue}>{formatDate(funcionario?.admissionDate)}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Perfil</span>
                    <span className={styles.infoValue}>{funcionario ? PROFILE_LABEL[funcionario.profile] : '—'}</span>
                </div>
            </div>
        </section>
    )
}
