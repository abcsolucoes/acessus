import { useCallback, useEffect, useState } from "react";
import type { Device, DeviceHistory } from "../../types";
import { getAparelho } from "../../services/AparelhoService/aparelhoApi";
import { ListHistoryByDevice } from "../../services/HistoricoAparelhoService/historicoApi";

export function useAparelhoDetalhe(id: number) {
    const [aparelho, setAparelho] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [historico, setHistorico] = useState<DeviceHistory[]>([]);
    const [historicoPage, setHistoricoPage] = useState(0);
    const [historicoTotalPages, setHistoricoTotalPages] = useState(0);

    const refetchAparelho = useCallback(() => {
        setLoading(true);
        return getAparelho(id)
            .then(setAparelho)
            .catch(() => setAparelho(null))
            .finally(() => setLoading(false));
    }, [id]);

    const refetchHistorico = useCallback(() => {
        return ListHistoryByDevice(id, historicoPage)
            .then((res) => {
                setHistorico(res.content);
                setHistoricoTotalPages(res.totalPages);
            })
            .catch(() => { });
    }, [id, historicoPage]);

    useEffect(() => { refetchAparelho(); }, [refetchAparelho]);
    useEffect(() => { refetchHistorico(); }, [refetchHistorico]);

    // Chamado depois de uma ação que muda o vínculo do aparelho (ex: desvincular
    // funcionário) — atualiza os dois de uma vez, já que a página sempre mostra ambos juntos
    const refetch = useCallback(() => {
        return Promise.all([refetchAparelho(), refetchHistorico()]);
    }, [refetchAparelho, refetchHistorico]);

    return { aparelho, loading, historico, historicoPage, setHistoricoPage, historicoTotalPages, refetch };
}
