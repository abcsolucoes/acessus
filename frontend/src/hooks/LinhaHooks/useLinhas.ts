import { useEffect, useState } from "react"
import type { Line } from "../../types"
import { listLinhas } from "../../services/LinhaService/linhaApi"

export function useLinhas(initialStatusFilter = "ALL") {
    const [linhas, setLinhas] = useState<Line[]>([])
    const [totalElements, setTotalElements] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(0)
    const [statusFilter, setStatusFilterState] = useState(initialStatusFilter)
    const [search, setSearchState] = useState("")
    const [reloadToken, setReloadToken] = useState(0)

    function setStatusFilter(value: string) {
        setStatusFilterState(value)
        setPage(0)
    }

    function setSearch(value: string) {
        setSearchState(value)
        setPage(0)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            listLinhas(page, statusFilter, search)
                .then((res) => {
                    setLinhas(res.content)
                    setTotalElements(res.totalElements)
                    setTotalPages(res.totalPages)
                })
                .catch(() => { })
        }, 500)

        return () => clearTimeout(timer)
    }, [page, statusFilter, search, reloadToken])

    return {
        linhas,
        totalElements,
        totalPages,
        page,
        setPage,
        statusFilter,
        setStatusFilter,
        search,
        setSearch,
        refetch: () => setReloadToken((t) => t + 1),
    }
}
