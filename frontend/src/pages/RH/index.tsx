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

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: '#F59E0B' },
  UNDER_ANALYSIS: { label: 'Em análise', color: '#3B82F6' },
  APPROVED: { label: 'Aprovado', color: '#22C55E' },
  REJECTED: { label: 'Rejeitado', color: '#EF4444' },
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUser(decodeToken())
  }, [])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const statusParam = statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''
      const endpoint = search.trim()
        ? `/candidates/search?term=${encodeURIComponent(search)}&page=${page}&size=20`
        : `/candidates?page=${page}&size=20${statusParam}`

      apiFetch<Page<Candidate>>(endpoint, { headers: authHeaders() })
        .then(data => {
          setCandidates(data.content)
          setTotalPages(data.totalPages)
        })
        .catch(() => { })
        .finally(() => setLoading(false))
    }, 500)

    return () => clearTimeout(timer)
  }, [search, page, statusFilter, refresh])

  const filtered = candidates
  
  return (
    <>
      <Header moduleName="RH" userName={user?.name ?? ""} />

      <main className={styles.main}>

        <div className={styles.top}>
          <div className={styles.topLeft}>
            <h1 className={styles.title}>Candidatos</h1>
            <span className={styles.count}>{filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}</span>
          </div>
          <div className={styles.topActions}>
            <button className={styles.camposBtn} onClick={() => navigate('/rh/campos')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Gerenciar campos
            </button>
            <button className={styles.addBtn} onClick={() => setShowModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adicionar candidato
            </button>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {STATUS_FILTERS.map(s => (
              <button
                key={s.value}
                className={`${styles.filterBtn} ${statusFilter === s.value ? styles.filterBtnActive : ''}`}
                onClick={() => setStatusFilter(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" />
            </svg>
            <input
              className={styles.search}
              placeholder="Buscar candidato…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.loadingBar}>
              <div className={styles.loadingSpinner} />
              <span>Carregando candidatos…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p>Nenhum candidato encontrado</p>
              <span>Tente ajustar o filtro ou a busca</span>
            </div>
          ) : (
            filtered.map((c, i) => {
              const meta = STATUS_META[c.candidateStatus]
              return (
                <div
                  key={c.id}
                  className={styles.card}
                  onClick={() => navigate(`/rh/${c.id}`)}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className={styles.cardAvatar}>
                    {initials(c.name)}
                  </div>
                  <div className={styles.cardMain}>
                    <span className={styles.cardName}>{c.name}</span>
                    <span className={styles.cardEmail}>{c.email}</span>
                  </div>
                  <span className={styles.cardPosition}>{c.position}</span>
                  {meta && (
                    <span className={styles.cardBadge} style={{ color: meta.color, borderColor: `${meta.color}44`, background: `${meta.color}14` }}>
                      {meta.label}
                    </span>
                  )}
                  <svg className={styles.cardArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              )
            })
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 0}>
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
              <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}>
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
