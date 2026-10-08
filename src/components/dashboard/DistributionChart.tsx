// src/components/dashboard/DistributionChart.tsx

import React from 'react';
import { Calendar } from 'lucide-react';

interface DistributionChartProps {
  scheduleByDay: Record<string, number>;
  dayOrder: string[];
  dayShort: Record<string, string>;
  maxDayCount: number;
  loading: boolean;
  safeScheduleCount: number;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  scheduleByDay,
  dayOrder,
  dayShort,
  maxDayCount,
  loading,
  safeScheduleCount,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-bold text-slate-900">
            Distribusi Jadwal
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Jumlah sesi berdasarkan hari
          </p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
          <Calendar className="h-4 w-4" />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {dayOrder.map((day) => {
            const count = scheduleByDay[day];
            const height = count === 0
              ? 8
              : Math.max(18, Math.round((count / maxDayCount) * 100));

            return (
              <div key={day} className="flex min-w-0 flex-col items-center">
                <div className="flex h-36 w-full items-end justify-center rounded-xl bg-slate-50 p-2">
                  <div
                    className={`w-full max-w-8 rounded-lg transition-all ${
                      count > 0 ? 'bg-indigo-500' : 'bg-slate-200'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${count} jadwal`}
                  />
                </div>
                <span className="mt-2 text-[11px] font-semibold text-slate-500 sm:hidden">
                  {dayShort[day]}
                </span>
                <span className="mt-2 hidden text-[11px] font-semibold text-slate-500 sm:inline">
                  {day}
                </span>
                <span className="mt-0.5 text-xs font-bold text-slate-800">
                  {loading ? '—' : count}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Ada jadwal
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-200" />
            Tidak ada jadwal
          </span>
          <span className="ml-auto font-medium text-slate-600">
            {safeScheduleCount} sesi aman
          </span>
        </div>
      </div>
    </div>
  );
};
