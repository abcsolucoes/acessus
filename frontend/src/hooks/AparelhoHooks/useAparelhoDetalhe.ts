import { useEffect, useState } from "react";
import type { Device, DeviceHistory } from "../../types";
import { getAparelho } from "../../services/AparelhoService/aparelhoApi";
import { ListHistoryByDevice } from "../../services/HistoricoAparelhoService/historicoApi";

export function useAparelhoDetalhe(id: number) {
    const [aparelho, setAparelho] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [historico, setHistorico] = useState<DeviceHistory[]>([]);
    const [historicoPage, setHistoricoPage] = useState(0);
    const [historicoTotalPages, setHistoricoTotalPages] = useState(0);

    useEffect(() => {
        setLoading(true);
        getAparelho(id)
            .then(setAparelho)
            .catch(() => setAparelho(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        ListHistoryByDevice(id, historicoPage)
            .then((res) => {
                setHistorico(res.content);
                setHistoricoTotalPages(res.totalPages);
            })
            .catch(() => { });
    }, [id, historicoPage]);

    return { aparelho, loading, historico, historicoPage, setHistoricoPage, historicoTotalPages };
}
