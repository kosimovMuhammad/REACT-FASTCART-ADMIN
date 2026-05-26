import { cn } from "@/lib/utils";
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg
}: StatCardProps) {
  return (
    <div className={cn('flex', 'items-center', 'gap-4', 'bg-white', 'dark:bg-zinc-900', 'rounded-xl', 'border', 'border-zinc-200', 'dark:border-zinc-800', 'shadow-sm', 'p-5', 'sm:p-6', 'transition-transform', 'hover:scale-[1.02]', 'duration-200')}>
      <div 
        className={cn('w-12', 'h-12', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'shrink-0')} 
        style={{ 
          backgroundColor: bg,
        }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className={cn('text-sm', 'font-medium', 'text-zinc-500', 'dark:text-zinc-400', 'mb-1')}>{label}</p>
        <p className={cn('text-2xl', 'font-bold', 'text-zinc-900', 'dark:text-white')}>{value}</p>
      </div>
    </div>
  );
}