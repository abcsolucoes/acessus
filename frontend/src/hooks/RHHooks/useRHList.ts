import { useEffect, useState } from "react"
import type { Candidate } from "../../types"
import { findAll } from "../../services/RhServices/rhApi"
import { decodeToken } from "../../services/api"

export function useRHList() {
    const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [sort, setSort] = useState('id,desc')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        setUser(decodeToken())
    }, [])

    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => {
            findAll(statusFilter, search, page, sort)
                .then(data => {
                    setCandidates(data.content)
                    setTotalPages(data.totalPages)
                })
                .catch(() => { })
                .finally(() => setLoading(false))
        }, 500)

        return () => clearTimeout(timer)
    }, [search, page, statusFilter, sort, refresh])

    return {
        user,
        candidates, search, setSearch,
        statusFilter, setStatusFilter,
        sort, setSort,
        page, setPage,
        totalPages, loading,
        refresh: () => setRefresh(r => r + 1),
    }
}