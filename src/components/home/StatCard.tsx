import React from 'react'

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  danger?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  danger = false,
}) => (
  <div
    className={`rounded-xl border bg-white p-4 shadow-sm ${
      danger ? 'border-red-200' : 'border-slate-200'
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p
          className={`mt-1 text-2xl font-bold tracking-tight ${
            danger && value > 0 ? 'text-red-600' : 'text-slate-900'
          }`}
        >
          {value}
        </p>
      </div>
      <div
        className={`rounded-lg p-2.5 ${
          danger && value > 0
            ? 'bg-red-50 text-red-600'
            : 'bg-indigo-50 text-indigo-600'
        }`}
      >
        {icon}
      </div>
    </div>
  </div>
)