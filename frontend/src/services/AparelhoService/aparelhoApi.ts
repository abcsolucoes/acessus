import type { Device, Page } from "../../types"
import { apiFetch, authHeaders } from "../api"

export function listAparelhos(page: number, situacao?: string, search?: string) {
  if (search?.trim()) {
    return apiFetch<Page<Device>>(`/devices/search?term=${encodeURIComponent(search)}&page=${page}&size=20`, { headers: authHeaders() })
  }

  const filterParam = situacao && situacao !== 'ALL' ? `&situacao=${situacao}` : ''
  return apiFetch<Page<Device>>(`/devices?page=${page}&size=20${filterParam}`, { headers: authHeaders() })
}

export function sincronizarAparelhos() {
  // Sync com o Pulsus é síncrono/bloqueante de propósito (ver decisão do projeto) e
  // pode passar de 30s — usa um timeout maior que o padrão do apiFetch (15s)
  return apiFetch<void>('/devices/sync', {
    method: 'POST',
    headers: authHeaders(),
  }, 60000)
}

export function getAparelho(id: number) {
  return apiFetch<Device>(`/devices/${id}`, { headers: authHeaders() })
}

export function vincularAparelho(deviceId: number, employeeId: number) {
  return apiFetch<Device>(`/devices/${deviceId}/vincular`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId }),
  })
}