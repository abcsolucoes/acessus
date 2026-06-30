import { useEffect, useState } from "react"
import { fetchMyLogs } from "../../services/LogsServices/logsApi"
import type { Logs } from "../../types"
import { decodeToken } from "../../services/api"

export function useDashboardPage() {
    const [logs, setLogs] = useState<Logs[]>([])
    const token = decodeToken();

    useEffect(() => {
        if (!token?.name) return
        fetchMyLogs(0)
            .then(res => setLogs(res.content.slice(0, 5)))
            .catch(() => { })
    }, [token?.name])

    return {
        logs
    }
}



