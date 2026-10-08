import React from 'react'
import { Search, RefreshCw } from 'lucide-react'

export const LoadingState = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-xl border border-slate-100 p-4"
        >
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-slate-100" />
              <div className="h-3 w-1/4 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 h-12 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  </div>
)

interface EmptyStateProps {
  hasFilters: boolean
  onReset: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasFilters,
  onReset,
}) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <Search size={24} />
    </div>
    <h3 className="mt-4 text-lg font-bold text-slate-900">
      Jadwal tidak ditemukan
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {hasFilters
        ? 'Coba ubah kata kunci atau filter yang digunakan untuk menemukan jadwal lainnya.'
        : 'Belum ada jadwal yang tersedia untuk ditampilkan.'}
    </p>
    {hasFilters && (
      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <RefreshCw size={15} />
        Reset Filter
      </button>
    )}
  </div>
)