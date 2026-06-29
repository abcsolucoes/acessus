import { useEffect, useState } from 'react'
import { decodeToken } from '../../services/api'
import type { Ticket, User } from '../../types'
import { listAssignableUsers, listTickets } from '../../services/TicketServices/ticketsApi'

export type Filter = 'mine' | 'sector' | 'created' | 'all'

export function useTicketsPage() {
    const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
    const [allUsers, setAllUsers] = useState<User[]>([])

    const [filter, setFilter] = useState<Filter>('mine')
    const [allTickets, setAllTickets] = useState<Ticket[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(0)
    const [loadingList, setLoadingList] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

    const visibleTickets = selectedStatus
        ? allTickets.filter(ticket => ticket.status === selectedStatus)
        : allTickets

    useEffect(() => {
        setUser(decodeToken())
        listAssignableUsers().then(setAllUsers)
    }, [])

    useEffect(() => {
        fetchTickets(page, filter)
    }, [page, filter])

    function changeFilter(f: Filter) {
        setFilter(f)
        setSelectedStatus(null)
        setPage(0)
    }

    async function fetchTickets(p: number, f: Filter) {
        setLoadingList(true)

        try {
            const data = await listTickets(f, p)

            setAllTickets(data.content)
            setTotalPages(data.totalPages)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingList(false)
        }
    }


    function toggleStatus(status: string) {
        setSelectedStatus(prev => prev === status ? null : status)
    }

    return {
        user,
        allUsers,

        filter,
        changeFilter,

        allTickets,
        visibleTickets,
        loadingList,
        fetchTickets,

        totalPages,
        page,
        setPage,

        selectedStatus,
        toggleStatus,
    }
}
