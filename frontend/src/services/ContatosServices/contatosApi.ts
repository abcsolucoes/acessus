import type { Contact } from "../../types";
import { apiFetch, authHeaders } from "../api";

export function listContatos() {
    return apiFetch<Contact[]>('/contacts', {
        headers: authHeaders(),
    })
}

export function deleteContato(resourceName: string) {
    return apiFetch(`/contacts/${resourceName}`, {
        method: 'DELETE',
        headers: authHeaders(),
    })
}