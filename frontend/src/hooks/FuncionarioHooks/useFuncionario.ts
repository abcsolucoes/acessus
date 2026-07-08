import { useEffect, useState } from "react";
import type { EmployeeSummary, Funcionario } from "../../types";
import { listFuncionarios, summaryFuncionarios } from "../../services/FuncionarioService/funcionarioApi";

export function useFuncionario() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [page, setPage] = useState(0)
    const [summary, setSummary] = useState<EmployeeSummary>();

    useEffect(() => {
        listFuncionarios(statusFilter, page)
            .then((res) => {
                setFuncionarios(res.content);
                setTotalElements(res.totalElements);
                setTotalPages(res.totalPages);
            })
            .catch(() => { });

        summaryFuncionarios().then((res) => {
            setSummary(res)
        });
    }, [statusFilter, page]);

    return {
        funcionarios,
        totalElements,
        totalPages,
        statusFilter,
        setStatusFilter,
        page,
        setPage,
        summary
    }
}