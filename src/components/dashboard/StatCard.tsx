// src/components/dashboard/StatCard.tsx

import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  colorClass?: string;
  bgColorClass?: string;
  borderColorClass?: string;
  valueColorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  colorClass = 'text-indigo-600',
  bgColorClass = 'bg-indigo-50',
  borderColorClass = 'border-slate-200/80',
  valueColorClass = 'text-slate-900',
}) => {
  return (
    <div className={`rounded-2xl border ${borderColorClass} bg-white p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${valueColorClass}`}>
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${bgColorClass} ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
