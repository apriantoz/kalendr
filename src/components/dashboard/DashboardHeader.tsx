// src/components/dashboard/DashboardHeader.tsx

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  firstName: string;
  loading: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  firstName,
  loading,
  onRefresh,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-50 blur-2xl" />
      <div className="absolute -bottom-24 right-20 h-40 w-40 rounded-full bg-blue-50 blur-2xl" />

      <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Dashboard Akademik
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Selamat datang, {firstName} 👋
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Pantau jadwal perkuliahan, alokasi ruangan, dan konflik akademik dari satu tempat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh data"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/kelola-jadwal"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Kelola Jadwal
          </Link>
        </div>
      </div>
    </section>
  );
};
