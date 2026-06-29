import { useEffect, useState } from "react";
import { apiFetch, authHeaders, decodeToken } from "../../services/api";
import type { Logs, Page } from "../../types";

function getInitials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map(n => n[0])
        .join("")
        .toUpperCase();
}

const PAGE_SIZE = 20;

export function useLogsPage() {
    const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null);
    const [page, setPage] = useState(0);
    const [userName, setUserName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [logs, setLogs] = useState<Logs[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        setUser(decodeToken());
    }, []);

    useEffect(() => {
        loadLogs(page, userName, startDate, endDate);
    }, [page]);

    async function loadLogs(p: number, name: string, start: string, end: string) {
        try {
            // Monta query params — só inclui os que foram preenchidos
            const params = new URLSearchParams({
                page: String(p),
                size: String(PAGE_SIZE),
                sort: "createdAt,desc",
            });

            if (name.trim()) params.set("userName", name.trim());
            if (start) params.set("startDate", start);
            if (end) params.set("endDate", end);

            const response = await apiFetch<Page<Logs>>(`/logs?${params.toString()}`, { headers: authHeaders() });

            setLogs(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Erro ao buscar logs:", error);
        }
    }

    function handleSearch() {
        // Volta para a página 0 — se já estava em 0, o useEffect não dispara, chama direto
        if (page === 0) {
            loadLogs(0, userName, startDate, endDate);
        } else {
            setPage(0); // o useEffect cuida de chamar loadLogs
        }
    }

    function handleClear() {
        setUserName("");
        setStartDate("");
        setEndDate("");
        if (page === 0) {
            loadLogs(0, "", "", "");
        } else {
            setPage(0);
        }
    }

    return {
        user,
        userName,
        setUserName,
        totalElements,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        handleSearch,
        handleClear,
        logs,
        getInitials,
        page,
        totalPages,
        setPage
    }
}
