import { useCallback, useEffect, useState } from "react"
import type { Line } from "../../types"
import { getLinha } from "../../services/LinhaService/linhaApi"

export function useLinhaDetalhe(id: number) {
    const [linha, setLinha] = useState<Line | null>(null)
    const [loading, setLoading] = useState(true)

    const refetch = useCallback(() => {
        setLoading(true)
        return getLinha(id)
            .then(setLinha)
            .catch(() => setLinha(null))
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => { refetch() }, [refetch])

    return { linha, loading, refetch }
}
