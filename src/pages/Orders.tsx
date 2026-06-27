import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ClipboardList, Loader2, AlertCircle, Search,
  ChevronLeft, ChevronRight, Trash2, Eye, X, Package,
} from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchOrders, deleteOrder, clearDeleteError,
  type Order,
} from '@/store/ordersSlice';
import DeleteModal from '@/components/modals/DeleteModal';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  shipped:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  delivered:  'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  cancelled:  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  completed:  'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
};

function statusColor(status?: string) {
  if (!status) return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
  return STATUS_COLORS[status.toLowerCase()] ?? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
}

function getOrderName(order: Order) {
  const first = order.firstName ?? '';
  const last  = order.lastName  ?? '';
  const full  = [first, last].filter(Boolean).join(' ');
  return full || order.userName || `#${order.id}`;
}

function getTotal(order: Order) {
  const t = order.totalAmount ?? order.totalPrice;
  if (t === undefined || t === null) return '—';
  return `$${Number(t).toFixed(2)}`;
}

function getDate(order: Order) {
  const raw = order.createdAt ?? order.orderDate;
  if (!raw) return '—';
  try { return new Date(raw).toLocaleDateString(); } catch { return raw; }
}

/* ── Order Detail Modal ─────────────────────────────────── */
function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const items = order.items ?? order.orderItems ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-[15px]">Order #{order.orderNumber ?? order.id}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{getDate(order)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Customer</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{getOrderName(order)}</p>
              {order.phoneNumber && <p className="text-zinc-500 text-xs mt-0.5">{order.phoneNumber}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Status</p>
              <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold', statusColor(order.status))}>
                {order.status ?? 'Unknown'}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Total</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{getTotal(order)}</p>
            </div>
          </div>

          {items.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Items</p>
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500">Product</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-zinc-500">Qty</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-zinc-500">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {items.map((item, i) => (
                      <tr key={item.id ?? i}>
                        <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200">{item.productName}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-500">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-zinc-800 dark:text-zinc-200">${Number(item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────── */
function Pagination({ page, totalPages, loading, onPage }: {
  page: number; totalPages: number; loading: boolean; onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  if (totalPages <= 5)              { for (let i = 1; i <= totalPages; i++) pages.push(i); }
  else if (page <= 3)               pages.push(1, 2, 3, 4, 5);
  else if (page >= totalPages - 2)  { for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i); }
  else                              { for (let i = page - 2; i <= page + 2; i++) pages.push(i); }
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1 || loading}
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)}
          className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors',
            p === page ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800')}>
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages || loading}
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function Orders() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, total, loading, error, deleteLoading, deleteError } = useSelector((s: RootState) => s.orders);

  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [toDelete,    setToDelete]    = useState<Order | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (p: number) => dispatch(fetchOrders({ PageNumber: p, PageSize: PAGE_SIZE }));

  useEffect(() => { load(1); }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1), 400);
  };

  const handlePage = (p: number) => { setPage(p); load(p); };

  const handleDelete = async () => {
    if (!toDelete) return;
    const res = await dispatch(deleteOrder(toDelete.id));
    if (deleteOrder.fulfilled.match(res)) setToDelete(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filtered = search
    ? orders.filter(o =>
        getOrderName(o).toLowerCase().includes(search.toLowerCase()) ||
        String(o.id).includes(search) ||
        (o.orderNumber ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (o.status ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Orders</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} total orders</p>
        </div>
      </div>

      <div className="relative w-72 mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by customer, order #, status..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all"
        />
      </div>

      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={15} /> {deleteError}
          <button onClick={() => dispatch(clearDeleteError())} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <AlertCircle size={28} className="text-red-500 mb-3" />
            <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
            <button onClick={() => load(page)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium dark:bg-red-500/10 dark:text-red-400">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              <ClipboardList size={32} className="text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {search ? 'No orders match your search' : 'No orders yet'}
            </p>
            {search && (
              <button onClick={() => handleSearch('')} className="mt-2 text-xs text-indigo-500 hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
              <tr>
                <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">#</th>
                <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">Order</th>
                <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">Customer</th>
                <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide hidden md:table-cell">Total</th>
                <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filtered.map((order, idx) => (
                <tr key={order.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5 text-zinc-400 dark:text-zinc-500 text-xs">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Package size={14} className="text-indigo-500" />
                      </div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-[13px]">
                        #{order.orderNumber ?? order.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200 text-[13px]">{getOrderName(order)}</p>
                    {order.phoneNumber && <p className="text-xs text-zinc-400 mt-0.5">{order.phoneNumber}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 hidden md:table-cell text-[13px]">
                    {getDate(order)}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold', statusColor(order.status))}>
                      {order.status ?? 'Unknown'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-zinc-900 dark:text-zinc-100 hidden md:table-cell text-[13px]">
                    {getTotal(order)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="p-1.5 rounded text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        title="View details"
                      >
                        <Eye size={15} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => { setToDelete(order); dispatch(clearDeleteError()); }}
                        disabled={deleteLoading}
                        className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                        title="Delete"
                      >
                        {deleteLoading && toDelete?.id === order.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Trash2 size={15} strokeWidth={2} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page <span className="font-medium text-zinc-700 dark:text-zinc-300">{page}</span> of {totalPages} · {total} orders
          </p>
          <Pagination page={page} totalPages={totalPages} loading={loading} onPage={handlePage} />
        </div>
      )}

      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}

      {toDelete && (
        <DeleteModal
          productName={`Order #${toDelete.orderNumber ?? toDelete.id}`}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
