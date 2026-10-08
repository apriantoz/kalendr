// src/components/dashboard/ActiveSemesterCard.tsx

import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActiveSemesterCardProps {
  activeSemester: string;
}

export const ActiveSemesterCard: React.FC<ActiveSemesterCardProps> = ({
  activeSemester,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-bold text-slate-900">Semester Aktif</h2>
        <p className="mt-0.5 text-xs text-slate-500">Konfigurasi akademik saat ini</p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tahun Akademik</p>
              <p className="mt-1 truncate text-lg font-bold text-slate-900">{activeSemester}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Semester yang sedang digunakan
          </div>
        </div>

        <Link
          to="/master-semester"
          className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
        >
          <span>Kelola semester</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
