import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Clock,
  Trash2,
  Circle,
  X,
  Pencil,
  Layers,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

// ─── helpers ────────────────────────────────────────────────────────────────

const getUserId = () =>
  sessionStorage.getItem('userId') || localStorage.getItem('userId');

const authHeaders = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// FIX: Normalize whatever ID field the API returns into a consistent `id` field.
// APIs commonly use `session_id`, `id`, `uuid`, or `pk` — this handles all of them.
const normalizeSession = (s) => ({
  ...s,
  id: s.id ?? s.session_id ?? s.uuid ?? s.pk ?? null,
});

// ─── Modal ───────────────────────────────────────────────────────────────────

const SessionModal = ({ mode, initial, onClose, onSave, saving }) => {
  const [name, setName] = useState(initial?.session_name ?? '');
  const [description, setDescription] = useState(initial?.session_description ?? '');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Session name is required.';
    else if (name.trim().length > 255) e.name = 'Maximum 255 characters.';
    if (description.length > 1000) e.description = 'Maximum 1000 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ session_name: name.trim(), session_description: description.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="font-black text-lg text-slate-900">
            {mode === 'create' ? 'New Session' : 'Edit Session'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Session Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Academic Research"
              maxLength={255}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.name}</p>}
            <p className="mt-1 text-right text-[11px] text-slate-400">{name.length}/255</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description <span className="text-slate-400 font-medium">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this session for?"
              maxLength={1000}
              rows={3}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none ${
                errors.description ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle size={12}/>{errors.description}</p>}
            <p className="mt-1 text-right text-[11px] text-slate-400">{description.length}/1000</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm ──────────────────────────────────────────────────────────

const DeleteConfirm = ({ session, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
          <Trash2 size={18} className="text-rose-600" />
        </div>
        <div>
          <h2 className="font-black text-slate-900">Delete Session</h2>
          <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        Are you sure you want to delete <span className="font-bold text-slate-900">{session.session_name}</span>?
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {deleting && <Loader2 size={14} className="animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const SessionManagement = () => {
  const userId = getUserId();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Active session — single source of truth from GET /current-session
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSessionLoading, setActiveSessionLoading] = useState(true);

  // FIX: Store the ID being activated as a stable primitive (string | null)
  const [activating, setActivating] = useState(null);

  // ── Fetch sessions ──────────────────────────────────────────────────────
  const fetchSessions = useCallback(async (currentPage = 1) => {
    if (!userId) {
      setError('User not authenticated. Please sign in.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = API_ENDPOINTS.listSessions(userId, currentPage, PAGE_SIZE);
      const res = await fetch(url, { headers: authHeaders() });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }
      const data = await res.json();

      if (Array.isArray(data)) {
        setSessions(data.map(normalizeSession));
        setTotalCount(data.length);
      } else if (data.sessions) {
        setSessions((data.sessions ?? []).map(normalizeSession));
        setTotalCount(data.total ?? 0);
      } else {
        setSessions((data.results ?? []).map(normalizeSession));
        setTotalCount(data.count ?? 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ── Fetch active session ───────────────────────────────────────────────
  const fetchActiveSession = useCallback(async () => {
    if (!userId) return;
    setActiveSessionLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.getActiveSession(userId), { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setActiveSessionId(data.current_session_id ? String(data.current_session_id) : null);
    } catch {
      setActiveSessionId(null);
    } finally {
      setActiveSessionLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions(page);
    fetchActiveSession();
  }, [fetchSessions, fetchActiveSession, page]);

  // ── Create ──────────────────────────────────────────────────────────────
  const handleCreate = async (body) => {
    setSaving(true);
    setApiError(null);
    try {
      const res = await fetch(API_ENDPOINTS.createSession(userId), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }
      const newSession = normalizeSession(await res.json());
      setModal(null);
      // Optimistically prepend the new session and bump count
      setSessions((prev) => [newSession, ...prev]);
      setTotalCount((prev) => prev + 1);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Update ──────────────────────────────────────────────────────────────
  const handleUpdate = async (body) => {
    setSaving(true);
    setApiError(null);

    // FIX: Capture the target session id before closing the modal
    const targetId = String(modal.session.id);
    const updatePayload = { ...body };

    try {
      const res = await fetch(API_ENDPOINTS.updateSession(userId, modal.session.id), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updatePayload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }
      const updated = await res.json().catch(() => null);
      const normalizedUpdated = updated ? normalizeSession(updated) : null;

      setModal(null);

      // FIX: Update only the specific session in local state — no full refetch
      setSessions((prev) =>
        prev.map((s) =>
          String(s.id) === targetId
            ? { ...s, ...updatePayload, ...(normalizedUpdated ?? {}) }
            : s
        )
      );
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    // Guard: prevent deleting the active session
    if (String(deleteTarget.id) === activeSessionId) {
      setApiError('Cannot delete the active session. Please deactivate it first.');
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);

    // FIX: Capture target id before async work
    const targetId = String(deleteTarget.id);

    try {
      const res = await fetch(API_ENDPOINTS.deleteSession(userId, deleteTarget.id), {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }

      setDeleteTarget(null);

      // FIX: Remove only the deleted session from local state — no full refetch
      setSessions((prev) => prev.filter((s) => String(s.id) !== targetId));
      setTotalCount((prev) => {
        const newTotal = prev - 1;
        // Adjust page if needed
        const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
        return newTotal;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle Active Status via PATCH /active-session ─────────────────────
  const handleToggleActive = async (sessionId) => {
    // FIX: Normalise to string once and reuse — prevents type-mismatch across comparisons
    const idStr = String(sessionId);

    // Guard: don't allow concurrent toggles
    if (activating === idStr) return;

    // If this session is already active, deactivate (set null); otherwise activate it
    const isCurrentlyActive = activeSessionId === idStr;
    const newActiveId = isCurrentlyActive ? null : idStr;

    // Optimistic update
    setActiveSessionId(newActiveId);
    setActivating(idStr);
    setApiError(null);

    try {
      const res = await fetch(API_ENDPOINTS.updateActiveSession(userId), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ session_id: newActiveId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Revert on failure
        setActiveSessionId(activeSessionId);
        throw new Error(data.detail || `Error ${res.status}`);
      }

      // Sync with server response
      const data = await res.json().catch(() => null);
      if (data?.current_session_id !== undefined) {
        setActiveSessionId(data.current_session_id ? String(data.current_session_id) : null);
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      // FIX: Always clear activating so the button re-enables
      setActivating(null);
    }
  };

  // ── Filtered sessions (client-side search on current page) ──────────────
  // Derive is_active from activeSessionId so the UI always reflects server state
  const sessionsWithActive = sessions.map((s) => ({
    ...s,
    is_active: String(s.id) === activeSessionId,
  }));

  const filteredUnsorted = search.trim()
    ? sessionsWithActive.filter(
        (s) =>
          s.id != null &&
          (s.session_name?.toLowerCase().includes(search.toLowerCase()) ||
          s.session_description?.toLowerCase().includes(search.toLowerCase()))
      )
    : sessionsWithActive.filter((s) => s.id != null);

  // Sort active session first
  const filtered = [...filteredUnsorted].sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Modals */}
      {modal && (
        <SessionModal
          mode={modal.mode}
          initial={modal.session}
          saving={saving}
          onClose={() => { setModal(null); setApiError(null); }}
          onSave={modal.mode === 'create' ? handleCreate : handleUpdate}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          session={deleteTarget}
          deleting={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Session Contexts</h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
          Manage how your activity is grouped and shared
        </p>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl px-4 py-3">
          <AlertCircle size={16} className="flex-shrink-0" />
          {apiError}
          <button onClick={() => setApiError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sessions..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <button
              onClick={() => { setApiError(null); setModal({ mode: 'create' }); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Plus size={18} /> New
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm font-medium">Loading sessions…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <AlertCircle size={32} className="text-rose-400" />
              <p className="text-sm font-medium text-slate-600">{error}</p>
              <button onClick={() => fetchSessions(page)} className="text-xs font-bold text-indigo-600 hover:underline">
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <Layers size={36} className="text-slate-300" />
              <p className="text-sm font-bold text-slate-500">
                {search ? 'No sessions match your search.' : 'No sessions yet.'}
              </p>
              {!search && (
                <button
                  onClick={() => { setApiError(null); setModal({ mode: 'create' }); }}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                >
                  Create your first session
                </button>
              )}
            </div>
          )}

          {/* Session Cards */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {filtered.map((session) => {
                // FIX: Derive a stable string key once per card render
                const sessionIdStr = String(session.id);
                const isActivating = activating === sessionIdStr;

                return (
                  <div
                    key={sessionIdStr}
                    className={`bg-white rounded-2xl p-4 sm:p-6 transition-all group ${
                      session.is_active
                        ? 'border-2 border-indigo-500 shadow-md'
                        : 'border border-slate-200 hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex gap-4 w-full sm:w-auto">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                          session.is_active
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400'
                        }`}>
                          <Layers size={26} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">
                            {session.session_name}
                          </h3>
                          {session.session_description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{session.session_description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Clock size={13} />
                              {formatDate(session.updated_at || session.created_at)}
                            </span>
                            <span className={`flex items-center gap-1.5 ${
                              session.is_active ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              <Circle size={7} fill="currentColor" className={
                                session.is_active ? 'text-emerald-400' : 'text-slate-300'
                              } />
                              {session.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                        <button
                          title={session.is_active ? 'Deactivate session' : 'Activate session'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(session.id);
                          }}
                          // FIX: Disable only this card's button, not all buttons
                          disabled={isActivating}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            session.is_active
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isActivating && <Loader2 size={12} className="animate-spin" />}
                          {session.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          title="Edit session"
                          onClick={(e) => {
                            e.stopPropagation();
                            setApiError(null);
                            // FIX: Spread session into a fresh object to avoid stale reference
                            setModal({ mode: 'edit', session: { ...session } });
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Delete session"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Prevent deleting active session
                            if (session.is_active) {
                              setApiError('Cannot delete the active session. Please deactivate it first.');
                              return;
                            }
                            // FIX: Spread session into a fresh object to avoid stale reference
                            setDeleteTarget({ ...session });
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && !search && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400 font-medium">
                Page {page} of {totalPages} · {totalCount} session{totalCount !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Quick Create CTA */}
          {!loading && !error && (
            <button
              onClick={() => { setApiError(null); setModal({ mode: 'create' }); }}
              className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:border-indigo-300 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} className="text-indigo-500" />
              </div>
              <span className="text-slate-900 font-bold">Add Custom Context</span>
              <p className="text-slate-400 text-xs mt-1">Create a new container to isolate specific AI workflows.</p>
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4 text-slate-900">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Sessions</span>
                <span className="font-black text-slate-900">{totalCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Current Page</span>
                <span className="font-black text-slate-900">{page} / {totalPages}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-medium">Active Session</span>
                {activeSessionLoading ? (
                  <Loader2 size={13} className="animate-spin text-slate-400" />
                ) : activeSessionId ? (
                  <span className="font-bold text-emerald-600 truncate max-w-[120px]" title={
                    sessions.find((s) => String(s.id) === activeSessionId)?.session_name ?? activeSessionId
                  }>
                    {sessions.find((s) => String(s.id) === activeSessionId)?.session_name ?? activeSessionId}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">None</span>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => fetchSessions(page)}
                  className="w-full py-2.5 text-indigo-600 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Loader2 size={13} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;