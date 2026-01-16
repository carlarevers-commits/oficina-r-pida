import { cn } from '@/lib/utils';
import { StatusOS } from '@/types/os';

interface StatusBadgeProps {
  status: StatusOS;
  className?: string;
}

const statusConfig: Record<StatusOS, { label: string; classes: string }> = {
  aberta: {
    label: 'Aberta',
    classes: 'bg-info/20 text-info border-info/30',
  },
  em_execucao: {
    label: 'Em Execução',
    classes: 'bg-warning/20 text-warning border-warning/30',
  },
  finalizada: {
    label: 'Finalizada',
    classes: 'bg-success/20 text-success border-success/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
