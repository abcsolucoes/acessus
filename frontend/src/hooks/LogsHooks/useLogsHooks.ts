import { useEffect, useState } from "react";
import { decodeToken } from "../../services/api";
import type { Logs, LogsFilter } from "../../types";
import { fetchLogs } from "../../services/LogsServices/logsApi";

export function useLogsPage() {
    const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null);
    const [page, setPage] = useState(0);
    const [filter, setFilter] = useState<LogsFilter>({ userName: "", startDate: "", endDate: "" });
    const [logs, setLogs] = useState<Logs[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        setUser(decodeToken());
    }, []);
    
    useEffect(() => {
        loadLogs(page, filter.userName, filter.startDate, filter.endDate);
    }, [page, filter]);

    async function loadLogs(p: number, name: string, start: string, end: string) {
        try {
            const response = await fetchLogs(p, name, start, end)
            setLogs(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (error) {
            console.error("Erro ao buscar logs:", error)
        }
    }

    function handleSearch() {
        if (page === 0) {
            loadLogs(0, filter.userName, filter.startDate, filter.endDate);
        } else {
            setPage(0); // useEffect dispara com o filter atual
        }
    }

    function handleClear() {
        setFilter({ userName: "", startDate: "", endDate: "" });
        setPage(0); // useEffect dispara com filter zerado
    }

    return {
        user,
        filter,
        setFilter,
        handleSearch,
        handleClear,
        logs,
        page,
        totalPages,
        totalElements,
        setPage,
    }
}
