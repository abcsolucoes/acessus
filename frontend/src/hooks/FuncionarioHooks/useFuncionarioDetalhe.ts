import { useEffect, useState } from "react";
import type { DeviceHistory, Funcionario } from "../../types";
import { getFuncionario } from "../../services/FuncionarioService/funcionarioApi";
import { ListHistoryByEmployee } from "../../services/HistoricoAparelhoService/historicoApi";

export function useFuncionarioDetalhe(id: number) {
    const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
    const [loading, setLoading] = useState(true);
    const [historico, setHistorico] = useState<DeviceHistory[]>([]);
    const [historicoPage, setHistoricoPage] = useState(0);
    const [historicoTotalPages, setHistoricoTotalPages] = useState(0);

    useEffect(() => {
        setLoading(true);
        getFuncionario(id)
            .then(setFuncionario)
            .catch(() => setFuncionario(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        ListHistoryByEmployee(id, historicoPage)
            .then((res) => {
                setHistorico(res.content);
                setHistoricoTotalPages(res.totalPages);
            })
            .catch(() => { });
    }, [id, historicoPage]);

    return { funcionario, loading, historico, historicoPage, setHistoricoPage, historicoTotalPages };
}