import { useEffect, useState } from "react";
import type { Device } from "../../types";
import { listAparelhos, sincronizarAparelhos } from "../../services/AparelhoService/aparelhoApi";

export function useAparelhos(initialSituacaoFilter = "ALL") {
    const [aparelhos, setAparelhos] = useState<Device[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0)
    const [sincronizando, setSincronizando] = useState(false);
    const [reloadToken, setReloadToken] = useState(0);
    const [situacaoFilter, setSituacaoFilterState] = useState(initialSituacaoFilter);
    const [search, setSearchState] = useState("");

    function setSituacaoFilter(value: string) {
        setSituacaoFilterState(value);
        setPage(0);
    }

    function setSearch(value: string) {
        setSearchState(value);
        setPage(0);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            listAparelhos(page, situacaoFilter, search)
                .then((res) => {
                    setAparelhos(res.content);
                    setTotalElements(res.totalElements);
                    setTotalPages(res.totalPages);
                })
                .catch(() => { });
        }, 500)

        return () => clearTimeout(timer)
    }, [page, situacaoFilter, search, reloadToken]);


    async function sincronizar() {
        setSincronizando(true);
        try {
            await sincronizarAparelhos();
            setPage(0);
            setReloadToken((t) => t + 1);
        } finally {
            setSincronizando(false);
        }
    }

    return {
        aparelhos,
        totalElements,
        totalPages,
        page,
        setPage,
        sincronizando,
        sincronizar,
        situacaoFilter,
        setSituacaoFilter,
        search,
        setSearch,
        refetch: () => setReloadToken((t) => t + 1)
    }
}
