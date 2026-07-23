import { useState } from "react";
import { Header } from "../../components/Header";
import { useNavigate } from "react-router-dom";


import styles from './style.module.css'
import { useRHList } from "../../hooks/RHHooks/useRHList";
import { CandidateModal } from "../../components/RHComponents/CandidateModal";
import { CandidateCard } from "../../components/RHComponents/RHList/CandidateCard";
import { RHToolbar } from "../../components/RHComponents/RHList/RHToolbar";

export function RHPage() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const {
    user,
    candidates, search, setSearch,
    statusFilter, setStatusFilter,
    sort, setSort,
    page, setPage,
    totalPages, loading,
    refresh,
  } = useRHList()

  return (
    <>
      <Header moduleName="RH" userName={user?.name ?? ""} />

      <main className={styles.main}>

        <div className={styles.top}>
          <div className={styles.topLeft}>
            <h1 className={styles.title}>Candidatos</h1>
            <span className={styles.count}>{candidates.length} {candidates.length === 1 ? 'registro' : 'registros'}</span>
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

        <RHToolbar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />

        <div className={styles.list}>
          {loading ? (
            <div className={styles.loadingBar}>
              <div className={styles.loadingSpinner} />
              <span>Carregando candidatos…</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className={styles.empty}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p>Nenhum candidato encontrado</p>
              <span>Tente ajustar o filtro ou a busca</span>
            </div>
          ) : (
            candidates.map((c, i) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                onClick={() => navigate(`/rh/${c.id}`)}
                animationDelay={i * 40}
              />
            ))
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
          onSuccess={() => refresh()}
        />
      )}
    </>
  )
}
