import type { Line, LineStatus, LineType, Page } from "../../types"
import { apiFetch, authHeaders } from "../api"

export function listLinhas(page: number, status?: string, search?: string) {
    if (search?.trim()) {
        return apiFetch<Page<Line>>(`/lines/search?term=${encodeURIComponent(search)}&page=${page}&size=20`, { headers: authHeaders() })
    }

    const filterParam = status && status !== 'ALL' ? `&status=${status}` : ''
    return apiFetch<Page<Line>>(`/lines?page=${page}&size=20${filterParam}`, { headers: authHeaders() })
}

export function countLinhas(status?: string) {
    const filterParam = status && status !== 'ALL' ? `?status=${status}` : ''
    return apiFetch<number>(`/lines/count${filterParam}`, { headers: authHeaders() })
}

export function getLinha(id: number) {
    return apiFetch<Line>(`/lines/${id}`, { headers: authHeaders() })
}

type CriarLinhaPayload = {
    number: string
    iccid?: string
    type: LineType
    notes?: string
}

export function criarLinha(payload: CriarLinhaPayload) {
    return apiFetch<Line>('/lines', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
}

export function vincularLinha(lineId: number, employeeId: number) {
    return apiFetch<Line>(`/lines/${lineId}/link`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
    })
}

export function desvincularLinha(lineId: number) {
    return apiFetch<Line>(`/lines/${lineId}/unlink`, {
        method: 'PATCH',
        headers: authHeaders(),
    })
}

export function removerLinha(lineId: number) {
    return apiFetch<void>(`/lines/${lineId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })
}

export function atualizarStatusLinha(lineId: number, status: LineStatus) {
    return apiFetch<Line>(`/lines/${lineId}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
    })
}

export function atualizarObservacoesLinha(lineId: number, notes: string) {
    return apiFetch<Line>(`/lines/${lineId}/notes`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
    })
}
