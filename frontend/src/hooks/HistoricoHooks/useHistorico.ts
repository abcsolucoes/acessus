import { useEffect, useState } from "react";
import type { DeviceHistory } from "../../types";
import { ListHistorico } from "../../services/HistoricoAparelhoService/historicoApi";

export function useHistorico() {
    const [historico, setHistorico] = useState<DeviceHistory[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);

    useEffect(() => {
        ListHistorico(page)
            .then((res) => {
                setHistorico(res.content);
                setTotalElements(res.totalElements);
                setTotalPages(res.totalPages);
            })
            .catch(() => { });
    }, [page])

    return { historico, totalElements, totalPages, page, setPage };
}