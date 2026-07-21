import { useState } from "react"
import { exportarFuncionarios } from "../../services/FuncionarioService/funcionarioApi"

export function useExportarFuncionarios() {
    const [loading, setLoading] = useState(false)

    async function exportar() {
        setLoading(true)
        try {
            await exportarFuncionarios()
        } finally {
            setLoading(false)
        }
    }

    return { exportar, loading }
}
