import { type Logs } from "../../types";
import styles from "./Logs.module.css";
import { Header } from "../../components/Header";
import { LogsHeaderPage } from "../../components/LogsComponents/LogsHeaderPage";
import { LogsFilter } from "../../components/LogsComponents/LogsFilter";
import { LogsTable } from "../../components/LogsComponents/LogsTable";
import { useLogsPage } from "../../hooks/LogsHooks/useLogsHooks";




export function Logs() {

    const {
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
    } = useLogsPage()

    return (
        <>
            <Header
                moduleName="Logs"
                userName={user?.name ?? ""}
            />
            <main className={styles.main}>

                {/* Topo */}
                <LogsHeaderPage totalElements={totalElements} />

                {/* Filtros */}
                <LogsFilter
                    userName={userName}
                    setUserName={setUserName}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    onSearch={handleSearch}
                    onClear={handleClear}
                />

                {/* Tabela */}
                <LogsTable
                    logs={logs}
                    getInitials={getInitials}
                />

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
