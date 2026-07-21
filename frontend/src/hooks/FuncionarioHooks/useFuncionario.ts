import { useEffect, useState } from "react";
import type { Funcionario, FuncionariosIndicadores } from "../../types";
import { listFuncionarios, summaryFuncionarios } from "../../services/FuncionarioService/funcionarioApi";

export function useFuncionario(initialStatusFilter = "ALL") {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(0)
    const [summary, setSummary] = useState<FuncionariosIndicadores>();
    const [reloadToken, setReloadToken] = useState(0);

    function handleSetSearch(value: string) {
        setSearch(value)
        setPage(0)
    }

    function handleSetStatusFilter(value: string) {
        setStatusFilter(value)
        setPage(0)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            listFuncionarios(statusFilter, search, page)
                .then((res) => {
                    setFuncionarios(res.content);
                    setTotalElements(res.totalElements);
                    setTotalPages(res.totalPages);
                })
                .catch(() => { });
        }, 500)

        return () => clearTimeout(timer)
    }, [statusFilter, search, page, reloadToken]);

    useEffect(() => {
        summaryFuncionarios().then((res) => {
            setSummary(res)
        });
    }, [reloadToken]);

    return {
        funcionarios,
        totalElements,
        totalPages,
        statusFilter,
        setStatusFilter: handleSetStatusFilter,
        search,
        setSearch: handleSetSearch,
        page,
        setPage,
        summary,
        refetch: () => setReloadToken((t) => t + 1)
    }
}