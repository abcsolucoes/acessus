import type { Candidate, Page } from "../../types"
import { apiFetch, authHeaders } from "../api"

export function findAll(statusFilter: string, search: string, page: number) {
    const statusParam = statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''
    const endpoint = search.trim()
        ? `/candidates/search?term=${encodeURIComponent(search)}&page=${page}&size=20`
        : `/candidates?page=${page}&size=20${statusParam}`

    return apiFetch<Page<Candidate>>(endpoint, { headers: authHeaders() })
}