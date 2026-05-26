import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { month: 'Jan', value: 8 },
  { month: 'Feb', value: 14 },
  { month: 'Mar', value: 10 },
  { month: 'Apr', value: 22 },
  { month: 'May', value: 40 },
  { month: 'Jun', value: 35 },
  { month: 'Jul', value: 48 },
  { month: 'Aug', value: 44 },
  { month: 'Sep', value: 30 },
  { month: 'Oct', value: 34 },
  { month: 'Nov', value: 28 },
  { month: 'Dec', value: 32 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3 py-2 rounded-lg shadow-lg border border-zinc-800 dark:border-zinc-200 text-sm">
        <p className="font-semibold">{payload[0].value * 21} Orders</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs">{label}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardChart() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 lg:col-span-2">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Sales Revenue</h3>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} className="dark:stroke-zinc-800" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a1a1aa', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={3}
              fill="url(#salesGradient)"
              dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
