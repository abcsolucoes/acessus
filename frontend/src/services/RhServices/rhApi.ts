import type { Candidate, Page } from "../../types"
import { apiFetch, authHeaders } from "../api"

export function findAll(statusFilter: string, search: string, page: number, sort: string) {
    const statusParam = statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''
    const endpoint = search.trim()
        ? `/candidates/search?term=${encodeURIComponent(search)}&page=${page}&size=20&sort=${sort}`
        : `/candidates?page=${page}&size=20&sort=${sort}${statusParam}`

    return apiFetch<Page<Candidate>>(endpoint, { headers: authHeaders() })
}