import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import type { Candidate, Page } from "../../types";
import { useNavigate } from "react-router-dom";
import { apiFetch, authHeaders, decodeToken } from "../../services/api";


import styles from './style.module.css'
import { CandidateModal } from "./CandidateModal";

const STATUS_FILTERS = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Em análise', value: 'UNDER_ANALYSIS' },
  { label: 'Aprovado', value: 'APPROVED' },
  { label: 'Rejeitado', value: 'REJECTED' },
]

export function RHPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const navigate = useNavigate()
  const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
  const [page, setPage] = useState(0)          // página atual (Spring começa em 0)
  const [totalPages, setTotalPages] = useState(0)        // total de páginas
  const [showModal, setShowModal] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    setUser(decodeToken())
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const endpoint = search.trim()
        ? `/candidates/search?term=${encodeURIComponent(search)}&page=${page}&size=20`
        : `/candidates?page=${page}&size=20`

      apiFetch<Page<Candidate>>(endpoint, { headers: authHeaders() })
        .then(data => {
          setCandidates(data.content)
          setTotalPages(data.totalPages)
        })
        .catch(() => {})
    }, 500)

    return () => clearTimeout(timer)

  }, [search, page, refresh])

  const filtered = candidates
    .filter(c => statusFilter === 'ALL' || c.candidateStatus === statusFilter)

  return (
    <>
      <Header moduleName="RH" userName={user?.name ?? ""} />

      <main className={styles.main}>

        <div className={styles.top}>
          <h1 className={styles.title}>Candidatos</h1>
          <div className={styles.topActions}>
            <button className={styles.camposBtn} onClick={() => navigate('/rh/campos')}>
              Gerenciar campos
            </button>
            <button className={styles.addBtn} onClick={() => setShowModal(true)}>
              Adicionar
            </button>
          </div>
        </div>

        <div className={styles.toolbar}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s.value}
              className={`${styles.filterBtn} ${statusFilter === s.value ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label}
            </button>
          ))}

          <input
            className={styles.search}
            placeholder="Buscar candidato"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.list}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>Nenhum candidato encontrado.</p>
          ) : (
            filtered.map(c => (
              <div key={c.id} className={styles.card} onClick={() => navigate(`/rh/${c.id}`)}>
                <div className={styles.cardName}>{c.name}</div>
                <div className={styles.cardInfo}>{c.email}</div>
                <div className={styles.cardInfo}>{c.position}</div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>

              <button
                className={styles.pageBtn}
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                ← Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.pageBtn} ${page === i ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className={styles.pageBtn}
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages - 1}
              >
                Próxima →
              </button>

            </div>
          )}

        </div>

      </main>

      {showModal && (
        <CandidateModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setRefresh(r => r + 1)}
        />
      )}
    </>
  )
}
