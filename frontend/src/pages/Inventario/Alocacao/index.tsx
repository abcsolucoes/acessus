import { useEffect, useState } from 'react'
import { Header } from '../../../components/Header'
import { Toast } from '../../../components/Toast'
import { InventarioSubnav } from '../../../components/InventarioComponents/InventarioSubnav'
import { ResumoAlocacao } from '../../../components/InventarioComponents/InventarioAlocacao/ResumoAlocacao'
import { PainelFuncionarios } from '../../../components/InventarioComponents/InventarioAlocacao/PainelFuncionarios'
import { PainelAparelhos } from '../../../components/InventarioComponents/InventarioAlocacao/PainelAparelhos'
import { BarraVinculo } from '../../../components/InventarioComponents/InventarioAlocacao/BarraVinculo'
import { VinculoSucessoModal } from '../../../components/InventarioComponents/InventarioAlocacao/VinculoSucessoModal'
import { useFuncionario } from '../../../hooks/FuncionarioHooks/useFuncionario'
import { useAparelhos } from '../../../hooks/AparelhoHooks/useAparelhos'
import { useAlocacao } from '../../../hooks/AlocacaoHooks/useAlocacao'
import styles from './style.module.css'

export function InventarioAlocacaoPage() {
  const {
    funcionarios,
    totalElements: semAparelho,
    totalPages: totalPagesFuncionarios,
    page: pageFuncionarios,
    setPage: setPageFuncionarios,
    search: searchFuncionarios,
    setSearch: setSearchFuncionarios,
    refetch: refetchFuncionarios,
  } = useFuncionario('SEM_APARELHO')

  const {
    aparelhos,
    totalElements: disponiveis,
    totalPages: totalPagesAparelhos,
    page: pageAparelhos,
    setPage: setPageAparelhos,
    search: searchAparelhos,
    setSearch: setSearchAparelhos,
    refetch: refetchAparelhos,
  } = useAparelhos('DISPONIVEL')

  const {
    selectedFuncionario,
    selectedAparelho,
    onSelectFuncionario,
    onSelectAparelho,
    vincular,
    vinculando,
    limparSelecao,
  } = useAlocacao()

  const [totalSemAparelho, setTotalSemAparelho] = useState(0)
  const [totalDisponiveis, setTotalDisponiveis] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [vinculoConcluido, setVinculoConcluido] = useState<{
    funcionarioName: string
    departamento: string | null
    aparelhoLabel: string
    pulsusId: number
    deviceId: number
  } | null>(null)

  useEffect(() => {
    if (!searchFuncionarios.trim()) setTotalSemAparelho(semAparelho)
  }, [semAparelho, searchFuncionarios])

  useEffect(() => {
    if (!searchAparelhos.trim()) setTotalDisponiveis(disponiveis)
  }, [disponiveis, searchAparelhos])

  async function handleVincular() {
    if (!selectedFuncionario || !selectedAparelho) return

    const funcionarioName = selectedFuncionario.name
    const departamento = selectedFuncionario.department
    const aparelhoLabel = `${selectedAparelho.model ?? 'Aparelho'} · ${selectedAparelho.tagDevice ?? '—'}`
    const pulsusId = selectedAparelho.pulsusId
    const deviceId = selectedAparelho.id

    try {
      await vincular()

      setVinculoConcluido({ funcionarioName, departamento, aparelhoLabel, pulsusId, deviceId })

      limparSelecao()
      refetchFuncionarios()
      refetchAparelhos()
    } catch {
      setToast({ message: 'Erro ao vincular aparelho', type: 'error' })
    }
  }

  return (
    <>
      <Header moduleName="Inventário" userName="Usuário" />

      <main className={styles.main}>

        <InventarioSubnav active="alocacao" />

        <div className={styles.top}>
          <div className={styles.titleGroup}>
            <span className={styles.title}>Alocação de aparelhos</span>
            <span className={styles.subtitle}>Associe aparelhos disponíveis às pessoas que precisam deles.</span>
          </div>

          <button type="button" className={styles.helpBtn} title="Ajuda">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </button>
        </div>

        <ResumoAlocacao semAparelho={totalSemAparelho} disponiveis={totalDisponiveis} />

        <div className={styles.matchPanel}>
          <div className={styles.matchGrid}>
            <PainelFuncionarios
              funcionarios={funcionarios}
              pendentes={totalSemAparelho}
              search={searchFuncionarios}
              setSearch={setSearchFuncionarios}
              page={pageFuncionarios}
              totalPages={totalPagesFuncionarios}
              setPage={setPageFuncionarios}
              selectedId={selectedFuncionario?.id ?? null}
              onSelect={onSelectFuncionario}
            />

            <div className={styles.divider}>
              <span className={styles.dividerIcon}>
                <svg viewBox="0 0 24 24"><path d="M16.5 9.4 7.5 4.2" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /></svg>
              </span>
            </div>

            <PainelAparelhos
              aparelhos={aparelhos}
              disponiveis={totalDisponiveis}
              search={searchAparelhos}
              setSearch={setSearchAparelhos}
              page={pageAparelhos}
              totalPages={totalPagesAparelhos}
              setPage={setPageAparelhos}
              selectedId={selectedAparelho?.id ?? null}
              onSelect={onSelectAparelho}
            />
          </div>

          <BarraVinculo
            funcionario={selectedFuncionario}
            aparelho={selectedAparelho}
            vinculando={vinculando}
            onVincular={handleVincular}
          />
        </div>

      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {vinculoConcluido && (
        <VinculoSucessoModal
          funcionarioName={vinculoConcluido.funcionarioName}
          departamento={vinculoConcluido.departamento}
          aparelhoLabel={vinculoConcluido.aparelhoLabel}
          pulsusId={vinculoConcluido.pulsusId}
          deviceId={vinculoConcluido.deviceId}
          onClose={() => setVinculoConcluido(null)}
          onDownloadError={() => setToast({ message: 'Erro ao gerar contrato de comodato', type: 'error' })}
        />
      )}
    </>
  )
}
