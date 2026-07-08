import type { EmployeeSummary, Funcionario, Page } from "../../types"
import { apiFetch, authHeaders } from "../api"

export function listFuncionarios(statusFilter: string, page: number) {
    const statusParam = statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''
    const endpoint = `/employees?page=${page}&size=20${statusParam}`

    return apiFetch<Page<Funcionario>>(endpoint, { headers: authHeaders() })
}

export function summaryFuncionarios() {
    return apiFetch<EmployeeSummary>("/employees/summary", { headers: authHeaders() })
}