import { useCallback, useEffect, useState } from "react";
import type { DeviceHistory, Funcionario } from "../../types";
import { getFuncionario } from "../../services/FuncionarioService/funcionarioApi";
import { ListHistoryByEmployee } from "../../services/HistoricoAparelhoService/historicoApi";

export function useFuncionarioDetalhe(id: number) {
    const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
    const [loading, setLoading] = useState(true);
    const [historico, setHistorico] = useState<DeviceHistory[]>([]);
    const [historicoPage, setHistoricoPage] = useState(0);
    const [historicoTotalPages, setHistoricoTotalPages] = useState(0);

    const refetchFuncionario = useCallback(() => {
        setLoading(true);
        return getFuncionario(id)
            .then(setFuncionario)
            .catch(() => setFuncionario(null))
            .finally(() => setLoading(false));
    }, [id]);

    const refetchHistorico = useCallback(() => {
        return ListHistoryByEmployee(id, historicoPage)
            .then((res) => {
                setHistorico(res.content);
                setHistoricoTotalPages(res.totalPages);
            })
            .catch(() => { });
    }, [id, historicoPage]);

    useEffect(() => { refetchFuncionario(); }, [refetchFuncionario]);
    useEffect(() => { refetchHistorico(); }, [refetchHistorico]);

    // Chamado depois de uma ação que muda o vínculo do funcionário (ex: desvincular
    // aparelho) — atualiza os dois de uma vez, já que a página sempre mostra ambos juntos
    const refetch = useCallback(() => {
        return Promise.all([refetchFuncionario(), refetchHistorico()]);
    }, [refetchFuncionario, refetchHistorico]);

    return { funcionario, loading, historico, historicoPage, setHistoricoPage, historicoTotalPages, refetch };
}
