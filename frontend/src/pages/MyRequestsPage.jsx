import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { requestService } from '../services/requestService'
import { REQUEST_STATUS, REQUEST_TYPES } from '../utils/constants'
import { formatRelativeDate } from '../utils/formatters'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import './MyRequestsPage.css'

const PAGE_SIZE = 10

/* ── Status badge helper ─────────────────────────────────── */
const badgeCls = s => ({
  SUBMITTED: 'mreq-badge-sub',
  IN_PROGRESS: 'mreq-badge-prog',
  RESOLVED: 'mreq-badge-res',
  CLOSED: 'mreq-badge-clo',
}[s] || 'mreq-badge-sub')

/* ── Main component ──────────────────────────────────────── */
const MyRequestsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { t, lang } = useLang()
  const m = t.myRequests
  const isManager = user?.role === 'gestionnaire'

  /* ── Data ── */
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  /* ── Filters / sort / pagination — initialised from URL params ── */
  const [search, setSearch] = useState(() => searchParams.get('q') || '')
  const [filterStatus, setFilterStatus] = useState(() => searchParams.get('status') || '')
  const [filterType, setFilterType] = useState('')
  const [sort, setSort] = useState('date_desc')
  const [page, setPage] = useState(1)

  /* ── Contextual page title based on active status filter ── */
  const pageTitle = useMemo(() => {
    const titles = {
      SUBMITTED:   lang === 'fr' ? 'Demandes soumises'  : 'Submitted Requests',
      IN_PROGRESS: lang === 'fr' ? 'Demandes en cours'  : 'In Progress Requests',
      RESOLVED:    lang === 'fr' ? 'Demandes résolues'  : 'Resolved Requests',
      CLOSED:      lang === 'fr' ? 'Demandes fermées'   : 'Closed Requests',
    }
    return titles[filterStatus] || (isManager ? m.managerTitle : m.title)
  }, [filterStatus, isManager, m, lang])

  /* ── Delete confirmation ── */
  const [deletingId, setDeletingId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  /* ── Load ── */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError('')
      try {
        const data = await requestService.lister()
        setRequests(data || [])
      } catch {
        setError(t.dashboard.error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  /* ── Read notification IDs from localStorage ── */
  const readIds = useMemo(() => {
    try { return new Set(JSON.parse(localStorage.getItem('uqo_read_notifs') || '[]')) } catch { return new Set() }
  }, [requests])

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = [...requests]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(r =>
        r.titre?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.createur?.nom_complet?.toLowerCase().includes(q)
      )
    }

    if (filterStatus) list = list.filter(r => r.statut === filterStatus)
    if (filterType)   list = list.filter(r => r.type === filterType)

    switch (sort) {
      case 'date_asc':
        list.sort((a, b) => new Date(a.date_creation) - new Date(b.date_creation))
        break
      case 'status':
        list.sort((a, b) => a.statut.localeCompare(b.statut))
        break
      case 'title':
        list.sort((a, b) => a.titre.localeCompare(b.titre))
        break
      default: // date_desc
        list.sort((a, b) => new Date(b.date_modification || b.date_creation) - new Date(a.date_modification || a.date_creation))
    }

    return list
  }, [requests, search, filterStatus, filterType, sort])

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  /* Reset to page 1 when filters change */
  useEffect(() => { setPage(1) }, [search, filterStatus, filterType, sort])

  /* ── Unread per request ── */
  const unreadFor = (req) => {
    const comments = req.commentaires || []
    return comments.filter(c => !readIds.has(c.id) && c.auteur_id !== user?.id).length
  }

  /* ── Delete ── */
  const handleDelete = async (id) => {
    setDeleteLoading(true)
    try {
      await requestService.supprimer(id)
      setRequests(prev => prev.filter(r => r.id !== id))
      setDeletingId(null)
    } catch {
      /* silent: keep card visible */
    } finally {
      setDeleteLoading(false)
    }
  }

  /* ── Type options ── */
  const typeOptions = Object.values(REQUEST_TYPES)

  /* ── Loading ── */
  if (isLoading) return (
    <div className="mreq-loading">
      <div className="spinner spinner-green spinner-large" />
      <span>{m.loading}</span>
    </div>
  )

  return (
    <div className="mreq-page">

      {/* ── Header ── */}
      <div className="mreq-header">
        <div>
          {filterStatus && (
            <button className="mreq-back-link" onClick={() => navigate('/dashboard')}>
              ← {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
            </button>
          )}
          <h1 className="mreq-title">{pageTitle}</h1>
          <p className="mreq-subtitle">{isManager ? m.managerSubtitle : m.subtitle}</p>
        </div>
      </div>

      {error && <div className="mreq-error">{error}</div>}

      {/* ── Toolbar ── */}
      <div className="mreq-toolbar">
        {/* Search */}
        <div className="mreq-search-wrap">
          <span className="mreq-search-icon">🔍</span>
          <input
            className="mreq-search"
            type="text"
            placeholder={m.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="mreq-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="mreq-filters">
          {/* Status filter */}
          <select className="mreq-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">{m.filterAll}</option>
            {Object.keys(REQUEST_STATUS).map(s => (
              <option key={s} value={s}>{t.status[s]}</option>
            ))}
          </select>

          {/* Type filter */}
          <select className="mreq-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">{m.filterType}</option>
            {typeOptions.map(tp => (
              <option key={tp} value={tp}>{tp}</option>
            ))}
          </select>

          {/* Sort */}
          <select className="mreq-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="date_desc">{m.sortDateDesc}</option>
            <option value="date_asc">{m.sortDateAsc}</option>
            <option value="status">{m.sortStatus}</option>
            <option value="title">{m.sortTitle}</option>
          </select>
        </div>
      </div>

      {/* ── Result count ── */}
      <div className="mreq-result-count">
        {filtered.length} {m.results}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div className="mreq-empty">
          <div className="mreq-empty-icon">📋</div>
          <div className="mreq-empty-title">{m.noResults}</div>
          <div className="mreq-empty-hint">
            {isManager ? m.noResultsHintManager : (requests.length === 0 ? '' : m.noResultsHint)}
          </div>
          {!isManager && requests.length === 0 && (
            <p className="mreq-empty-cta-hint">{m.createFirst}</p>
          )}
        </div>
      ) : (
        <div className="mreq-list">
          {pageSlice.map(req => {
            const unread = unreadFor(req)
            const canEdit = req.createur_id === user?.id && req.statut === REQUEST_STATUS.SUBMITTED
            const canDelete = req.createur_id === user?.id && req.statut === REQUEST_STATUS.SUBMITTED
            const isConfirming = deletingId === req.id

            return (
              <div key={req.id} className="mreq-card">
                {/* Top row */}
                <div className="mreq-card-top">
                  <div className="mreq-card-left">
                    <span className={`mreq-badge ${badgeCls(req.statut)}`}>
                      {t.status[req.statut] || req.statut}
                    </span>
                    {unread > 0 && (
                      <span className="mreq-unread-pill">
                        💬 {unread} {m.unreadMsg}
                      </span>
                    )}
                  </div>
                  <span className="mreq-card-date">{formatRelativeDate(req.date_modification || req.date_creation)}</span>
                </div>

                {/* Title + type */}
                <div className="mreq-card-body">
                  <h3 className="mreq-card-title" onClick={() => navigate(`/requests/${req.id}`)}>
                    {req.titre}
                  </h3>
                  <span className="mreq-card-type">{req.type}</span>
                  {isManager && req.createur?.nom_complet && (
                    <span className="mreq-card-creator">· {req.createur.nom_complet}</span>
                  )}
                </div>

                {/* Description excerpt */}
                {req.description && (
                  <p className="mreq-card-desc">{req.description}</p>
                )}

                {/* Actions */}
                <div className="mreq-card-footer">
                  <div className="mreq-card-actions">
                    <button className="mreq-action-btn mreq-action-view"
                      onClick={() => navigate(`/requests/${req.id}`)}>
                      👁 {m.view}
                    </button>
                    {canEdit && (
                      <button className="mreq-action-btn mreq-action-edit"
                        onClick={() => navigate(`/requests/${req.id}/edit`)}>
                        ✏ {m.edit}
                      </button>
                    )}
                    {canDelete && !isConfirming && (
                      <button className="mreq-action-btn mreq-action-delete"
                        onClick={() => setDeletingId(req.id)}>
                        🗑 {m.delete}
                      </button>
                    )}
                  </div>

                  {/* Inline delete confirmation */}
                  {isConfirming && (
                    <div className="mreq-confirm-delete">
                      <span>{m.confirmDelete}</span>
                      <button className="mreq-confirm-yes"
                        onClick={() => handleDelete(req.id)}
                        disabled={deleteLoading}>
                        {deleteLoading ? <span className="spinner" /> : '🗑'} {m.delete}
                      </button>
                      <button className="mreq-confirm-no"
                        onClick={() => setDeletingId(null)}
                        disabled={deleteLoading}>
                        {m.cancelDelete}
                      </button>
                    </div>
                  )}

                  {/* Comment count */}
                  {(req.commentaires?.length ?? 0) > 0 && (
                    <span className="mreq-comment-count">
                      💬 {req.commentaires.length}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mreq-pagination">
          <button className="mreq-page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}>
            {m.prev}
          </button>
          <span className="mreq-page-info">
            {m.page} {safePage} {m.of} {totalPages}
          </span>
          <button className="mreq-page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}>
            {m.next}
          </button>
        </div>
      )}

    </div>
  )
}

export default MyRequestsPage
