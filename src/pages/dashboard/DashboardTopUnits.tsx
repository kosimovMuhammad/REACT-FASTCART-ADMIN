import { Loader2 } from 'lucide-react';
import type { Product } from '@/store/productsSlice';

interface DashboardTopUnitsProps {
  products: Product[];
  loading: boolean;
}

export default function DashboardTopUnits({ products, loading }: DashboardTopUnitsProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 lg:col-span-1">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Top Products by Units Sold</h3>
      </div>
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="px-5 sm:px-2 py-3 font-medium">Name</th>
                <th className="px-2 py-3 font-medium">Price</th>
                <th className="px-5 sm:px-2 py-3 font-medium text-right sm:text-left">Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-2 py-8 text-center">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                  </td>
                </tr>
              ) : (
                products.slice(0, 5).map((p, i) => {
                  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];
                  const color = colors[i % colors.length];
                  const percent = Math.min(100, (p.quantity / 200) * 100);
                  
                  return (
                    <tr key={p.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 sm:px-2 py-3.5 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${color}`} />
                          {p.productName}
                        </div>
                      </td>
                      <td className="px-2 py-3.5 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">${p.price.toFixed(2)}</td>
                      <td className="px-5 sm:px-2 py-3.5 whitespace-nowrap">
                        <div className="flex items-center justify-end sm:justify-start gap-3">
                          <div className="hidden sm:block flex-1 max-w-[100px] h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
                          </div>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.quantity}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
