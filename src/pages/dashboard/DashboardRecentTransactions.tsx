const recentTransactions = [
  { name: 'Jagarnath S.', date: '24.05.2023', amount: '$124.97', status: 'Paid' },
  { name: 'Anand G.', date: '23.05.2023', amount: '$55.42', status: 'Pending' },
  { name: 'Kartik S.', date: '23.05.2023', amount: '$89.90', status: 'Paid' },
  { name: 'Rakesh S.', date: '22.05.2023', amount: '$144.94', status: 'Pending' },
  { name: 'Anup S.', date: '22.05.2023', amount: '$70.52', status: 'Paid' },
  { name: 'Jimmy P.', date: '22.05.2023', amount: '$70.52', status: 'Paid' },
];

export default function DashboardRecentTransactions() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 lg:col-span-1">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="px-5 sm:px-2 py-3 font-medium">Name</th>
                <th className="px-2 py-3 font-medium">Date</th>
                <th className="px-2 py-3 font-medium">Amount</th>
                <th className="px-5 sm:px-2 py-3 font-medium text-right sm:text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {recentTransactions.map((tx, i) => (
                <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-5 sm:px-2 py-3.5 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{tx.name}</td>
                  <td className="px-2 py-3.5 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{tx.date}</td>
                  <td className="px-2 py-3.5 text-zinc-900 dark:text-zinc-100 font-medium whitespace-nowrap">{tx.amount}</td>
                  <td className="px-5 sm:px-2 py-3.5 whitespace-nowrap text-right sm:text-left">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${
                        tx.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' 
                          : 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
