import { apiFetch, authHeaders } from "../../services/api"
import type { Logs, Page } from "../../types"

const PAGE_SIZE = 20

export function fetchLogs(p: number, userName: string, startDate: string, endDate: string) {
    const params = new URLSearchParams({
        page: String(p),
        size: String(PAGE_SIZE),
        sort: "createdAt,desc",
    })
    
    if (userName.trim()) params.set("userName", userName.trim())
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)

    return apiFetch<Page<Logs>>(`/logs?${params.toString()}`, { headers: authHeaders() })
}

export function fetchMyLogs(p: number) {
    const params = new URLSearchParams({ page: String(p), size: "5", sort: "createdAt,desc" })
    return apiFetch<Page<Logs>>(`/logs/me?${params.toString()}`, { headers: authHeaders() })
}