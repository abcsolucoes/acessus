import { apiFetch, authHeaders } from "../api"
import type { Page, Ticket, User } from "../../types"
import type { Filter } from "../../hooks/TicketHooks/useTicketsPage"

const PAGE_SIZE = 20

export function listTickets(filter: Filter, page: number) {
  return apiFetch<Page<Ticket>>(
    `/tickets?filter=${filter}&page=${page}&size=${PAGE_SIZE}`,
    { headers: authHeaders() }
  )
}

export function listAssignableUsers() {
  return apiFetch<User[]>('/users/assignable', {
    headers: authHeaders(),
  })
}

export function createTicket(body: {
  title: string
  description: string
  department: string | null
  assignedToId: number | null
  applicantId?: number | null
}) {
  return apiFetch<Ticket>('/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
}

export function uploadTicketAttachment(ticketId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return apiFetch(`/tickets/${ticketId}/attachments`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })
}
