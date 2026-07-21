import type { DeviceHistory, Page } from "../../types";
import { apiFetch, authHeaders } from "../api";

export function ListHistorico(page: number) {
    return apiFetch<Page<DeviceHistory>>(`/deviceHistory?page=${page}`, { headers: authHeaders() })
}

export function ListHistoryByEmployee(id: number, page: number) {
    return apiFetch<Page<DeviceHistory>>(`/deviceHistory/employee/${id}?page=${page}`, { headers: authHeaders() })
}

export function ListHistoryByDevice(id: number, page: number) {
    return apiFetch<Page<DeviceHistory>>(`/deviceHistory/device/${id}?page=${page}`, { headers: authHeaders() })
}