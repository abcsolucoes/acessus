import { useEffect, useState } from "react"
import { apiFetch, authHeaders, decodeToken } from "../../services/api";
import { type Logs, type Page } from "../../types";
import { formatDateTime } from "../../utils/format";
import styles from "./Logs.module.css";
import { Header } from "../../components/Header";

function getInitials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map(n => n[0])
        .join("")
        .toUpperCase();
}

const PAGE_SIZE = 20;

export function Logs() {
    const [logs, setLogs] = useState<Logs[]>([]);
    const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null);

    // ── Filtros ──
    const [userName, setUserName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // ── Paginação ──
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        setUser(decodeToken());
    }, []);

    // Recarrega sempre que a página mudar
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

            if (name.trim())  params.set("userName", name.trim());
            if (start)        params.set("startDate", start);
            if (end)          params.set("endDate", end);

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

    return (
        <>
        <Header
            moduleName="Logs"
            userName={user?.name ?? ""}
        />
        <main className={styles.main}>

            {/* Topo */}
            <div className={styles.top}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Logs de Auditoria</h1>
                    {totalElements > 0 && (
                        <span className={styles.badge}>{totalElements} registros</span>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <div className={styles.filters}>
                <div className={styles.filterField}>
                    <label className={styles.filterLabel} htmlFor="filter-name">Usuário</label>
                    <input
                        id="filter-name"
                        type="text"
                        className={styles.filterInput}
                        placeholder="Buscar por nome..."
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                    />
                </div>
                <div className={styles.filterField}>
                    <label className={styles.filterLabel} htmlFor="filter-start">De</label>
                    <input
                        id="filter-start"
                        type="date"
                        className={styles.filterInput}
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div className={styles.filterField}>
                    <label className={styles.filterLabel} htmlFor="filter-end">Até</label>
                    <input
                        id="filter-end"
                        type="date"
                        className={styles.filterInput}
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
                <div className={styles.filterActions}>
                    <button type="button" className={styles.clearBtn} onClick={handleClear}>Limpar</button>
                    <button type="button" className={styles.searchBtn} onClick={handleSearch}>Buscar</button>
                </div>
            </div>

            {/* Tabela */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Ação</th>
                            <th style={{ textAlign: "right" }}>Data / Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={3}>
                                    <div className={styles.emptyState}>
                                        <span className={styles.emptyIcon}>📋</span>
                                        <p className={styles.emptyText}>Nenhum log encontrado</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            logs.map(l => (
                                <tr key={l.id}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                {getInitials(l.userName)}
                                            </div>
                                            <span className={styles.userName}>{l.userName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.description}>{l.description}</span>
                                    </td>
                                    <td className={styles.dateCell}>
                                        <span className={styles.date}>{formatDateTime(l.createdAt)}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 0}
                    >
                        ← Anterior
                    </button>
                    <span className={styles.pageInfo}>
                        Página {page + 1} de {totalPages}
                    </span>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages - 1}
                    >
                        Próxima →
                    </button>
                </div>
            )}

        </main>
        </>
    )
}
