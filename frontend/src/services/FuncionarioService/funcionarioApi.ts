import type { Company, Funcionario, FuncionariosIndicadores, ImportResumo, NovoFuncionarioPayload, Page } from "../../types"
import { API_URL, apiFetch, authHeaders } from "../api"

export function listFuncionarios(statusFilter: string, search: string, page: number) {
    let filterParam = ''
    if (statusFilter === 'COM_APARELHO') filterParam = '&hasDevice=true'
    else if (statusFilter === 'SEM_APARELHO') filterParam = '&hasDevice=false'
    else if (statusFilter !== 'ALL') filterParam = `&status=${statusFilter}`

    const endpoint = search.trim()
        ? `/employee/search?term=${encodeURIComponent(search)}&page=${page}&size=20`
        : `/employee?page=${page}&size=20${filterParam}`

    return apiFetch<Page<Funcionario>>(endpoint, { headers: authHeaders() })
}

export function importarFuncionarios(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return apiFetch<ImportResumo>('/employee/importSave', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
    })
}

export function summaryFuncionarios(): Promise<FuncionariosIndicadores> {
    return Promise.all([
        apiFetch<number>("/employee/count?ativos=true", { headers: authHeaders() }),
        apiFetch<number>("/employee/count?status=AFASTADO", { headers: authHeaders() }),
    ]).then(([ativos, afastados]) => ({ ativos, afastados }))
}

export function countFuncionariosSemAparelho() {
    return apiFetch<number>("/employee/count?hasDevice=false", { headers: authHeaders() })
}

export function listCompanies() {
    return apiFetch<Company[]>("/employee/companies", { headers: authHeaders() })
}

export function criarFuncionario(payload: NovoFuncionarioPayload) {
    return apiFetch<Funcionario>("/employee", {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
}

export async function exportarFuncionarios() {
    const res = await fetch(`${API_URL}/employee/export`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Erro ao exportar funcionários')

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'funcionarios.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
}

export async function getFuncionario(id: number) {
    return apiFetch<Funcionario>(`/employee/${id}`, { headers: authHeaders() })    
}