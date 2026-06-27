import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Loader2, Trash2, Search, Users as UsersIcon,
  AlertCircle, ChevronLeft, ChevronRight,
  LayoutGrid, List, Mail, Phone,
} from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import { fetchUsers, deleteUser, clearDeleteError, getUserId, type User } from '@/store/usersSlice';
import DeleteModal from '@/components/modals/DeleteModal';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

function UserAvatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const initials = [user.firstName, user.lastName]
    .filter(Boolean).map(n => n![0]).join('').toUpperCase()
    || user.userName?.[0]?.toUpperCase() || '?';

  const cls = size === 'lg'
    ? 'w-14 h-14 text-lg'
    : size === 'sm'
    ? 'w-8 h-8 text-xs'
    : 'w-10 h-10 text-sm';

  if (user.imageUrl) {
    return <img src={user.imageUrl} alt={user.userName} className={cn(cls, 'rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0')} />;
  }
  return (
    <div className={cn(cls, 'rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shrink-0')}>
      {initials}
    </div>
  );
}

function Pagination({ page, totalPages, loading, onPage }: { page: number; totalPages: number; loading: boolean; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (page <= 3) {
    pages.push(1, 2, 3, 4, 5);
  } else if (page >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    for (let i = page - 2; i <= page + 2; i++) pages.push(i);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1 || loading}
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={cn(
            'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
            p === page
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages || loading}
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, total, loading, error, deleteLoading, deleteError } = useSelector((s: RootState) => s.users);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'table' | 'card'>('table');
  const [toDelete, setToDelete] = useState<User | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (p: number, q: string) => {
    dispatch(fetchUsers({ UserName: q || undefined, PageNumber: p, PageSize: PAGE_SIZE }));
  };

  useEffect(() => { load(1, ''); }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, val), 400);
  };

  const handlePage = (p: number) => {
    setPage(p);
    load(p, search);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const res = await dispatch(deleteUser(toDelete));
    if (deleteUser.fulfilled.match(res)) {
      setToDelete(null);
      load(page, search);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
      <UsersIcon size={36} className="mb-3 opacity-30" />
      <p className="text-sm font-medium">No users found</p>
    </div>
  );

  const errorState = (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <AlertCircle size={28} className="text-red-500 mb-3" />
      <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
      <button onClick={() => load(1, search)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium dark:bg-red-500/10 dark:text-red-400">
        Retry
      </button>
    </div>
  );

  const loadingState = (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-indigo-600 mb-3" />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Users</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{total} total users</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setView('table')}
            className={cn('p-2 rounded-md transition-colors', view === 'table' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200')}
            title="Table view"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView('card')}
            className={cn('p-2 rounded-md transition-colors', view === 'card' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200')}
            title="Card view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-72 mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all"
        />
      </div>

      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={15} /> {deleteError}
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {loading ? loadingState : error ? errorState : users.length === 0 ? emptyState : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">#</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">User</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide hidden lg:table-cell">Phone</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {users.map((user, idx) => (
                  <tr key={getUserId(user)} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-400 dark:text-zinc-500 text-xs">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="sm" />
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[13px]">
                            {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.userName}
                          </p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">@{user.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 hidden md:table-cell text-[13px]">
                      {user.email ?? <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 hidden lg:table-cell text-[13px]">
                      {user.phoneNumber ?? <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => { setToDelete(user); dispatch(clearDeleteError()); }}
                        disabled={deleteLoading}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                      >
                        {deleteLoading && toDelete && getUserId(toDelete) === getUserId(user)
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Trash2 size={15} strokeWidth={2} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CARD VIEW */}
      {view === 'card' && (
        <>
          {loading ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">{loadingState}</div>
          ) : error ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">{errorState}</div>
          ) : users.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">{emptyState}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={getUserId(user)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="lg" />
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-[14px] leading-tight">
                          {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.userName}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">@{user.userName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setToDelete(user); dispatch(clearDeleteError()); }}
                      disabled={deleteLoading}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {deleteLoading && toDelete && getUserId(toDelete) === getUserId(user)
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} strokeWidth={2} />}
                    </button>
                  </div>

                  <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    <div className="flex items-center gap-2 text-[12px] text-zinc-500 dark:text-zinc-400">
                      <Mail size={12} className="shrink-0 text-zinc-400" />
                      <span className="truncate">{user.email ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-zinc-500 dark:text-zinc-400">
                      <Phone size={12} className="shrink-0 text-zinc-400" />
                      <span>{user.phoneNumber ?? '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-5 px-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page <span className="font-medium text-zinc-700 dark:text-zinc-300">{page}</span> of {totalPages} · {total} users
          </p>
          <Pagination page={page} totalPages={totalPages} loading={loading} onPage={handlePage} />
        </div>
      )}

      {toDelete && (
        <DeleteModal
          productName={[toDelete.firstName, toDelete.lastName].filter(Boolean).join(' ') || toDelete.userName}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
