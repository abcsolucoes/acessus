import { useState } from "react";
import type { Device, Funcionario } from "../../types";
import { vincularAparelho } from "../../services/AparelhoService/aparelhoApi";

export function useAlocacao() {
    const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
    const [selectedAparelho, setSelectedAparelho] = useState<Device | null>(null);
    const [vinculando, setVinculando] = useState(false);

    function onSelectFuncionario(funcionario: Funcionario) {
        setSelectedFuncionario(prev => prev?.id === funcionario.id ? null : funcionario);
    }

    function onSelectAparelho(aparelho: Device) {
        setSelectedAparelho(prev => prev?.id === aparelho.id ? null : aparelho);
    }

    async function vincular() {
        if (!selectedFuncionario || !selectedAparelho) return;

        setVinculando(true);
        try {
            await vincularAparelho(selectedAparelho.id, selectedFuncionario.id);
        } finally {
            setVinculando(false);
        }
    }

    function limparSelecao() {
        setSelectedFuncionario(null);
        setSelectedAparelho(null);
    }

    return {
        selectedFuncionario,
        selectedAparelho,
        onSelectFuncionario,
        onSelectAparelho,
        vincular,
        vinculando,
        limparSelecao,
    };
}