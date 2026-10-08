import React from 'react'
import { AlertCircle, Clock3, DoorOpen, GraduationCap } from 'lucide-react'
import { type JadwalPublicItem } from '@/types/schedule'
import {
  getBentrokDetails,
  getMkName,
  getRuangName,
} from '@/utils/scheduleHelpers'

// Helper internal untuk komponen jadwal
const formatTime = (time?: string | null) =>
  time ? String(time).slice(0, 5) : '-'

const getSemesterLabel = (item: JadwalPublicItem) => {
  if (!item.tahun_ajaran && !item.tipe_semester) return '-'
  return [item.tahun_ajaran, item.tipe_semester].filter(Boolean).join(' • ')
}

const getInitials = (name?: string) => {
  if (!name) return 'MK'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

const getProdiName = (item: JadwalPublicItem) =>
  item.nama_prodi || 'Prodi belum tersedia'

const getConflictLabel = (item: JadwalPublicItem) => {
  const prodi = getProdiName(item)
  const mk = getMkName(item)
  return `${prodi} • ${mk}`
}

interface ScheduleProps {
  item: JadwalPublicItem
  jadwalList: JadwalPublicItem[]
}

export const PublicScheduleRow: React.FC<ScheduleProps> = ({
  item,
  jadwalList,
}) => {
  const conflicts = getBentrokDetails(item, jadwalList) ?? []
  const namaMk = getMkName(item) || 'Mata Kuliah'
  const namaProdi = getProdiName(item)
  const namaRuang = getRuangName(item) || '-'

  return (
    <tr className="group transition hover:bg-slate-50/70">
      <td className="px-5 py-4 align-top">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
            {getInitials(namaMk)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{namaMk}</p>
            {item.kode_mk && (
              <p className="mt-1 text-xs font-medium text-slate-400">
                {item.kode_mk}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <div className="flex items-start gap-2">
          <GraduationCap size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <p className="text-sm font-medium leading-5 text-slate-700">
            {namaProdi}
          </p>
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <div className="flex items-start gap-2">
          <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <p className="font-semibold text-slate-800">{item.hari || '-'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {formatTime(item.jam_mulai)} – {formatTime(item.jam_selesai)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <DoorOpen size={16} className="text-slate-400" />
          {namaRuang}
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {getSemesterLabel(item)}
        </span>
      </td>
      <td className="px-5 py-4 align-top">
        {conflicts.length > 0 ? (
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
              <AlertCircle size={13} />
              Bentrok
            </span>
            <div className="max-w-56 space-y-1">
              {conflicts.slice(0, 2).map((conflictItem, index) => (
                <p
                  key={`${conflictItem.id ?? conflictItem.jadwal_id}-${index}`}
                  className="text-xs leading-4 text-red-600"
                >
                  {getConflictLabel(conflictItem)}
                </p>
              ))}
              {conflicts.length > 2 && (
                <p className="text-xs font-semibold text-red-500">
                  +{conflicts.length - 2} bentrok lainnya
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Terjadwal
          </span>
        )}
      </td>
      <td className="max-w-55 px-5 py-4 align-top">
        <p className="text-sm leading-5 text-slate-500">{item.catatan || '-'}</p>
      </td>
    </tr>
  )
}

export const PublicScheduleCard: React.FC<ScheduleProps> = ({
  item,
  jadwalList,
}) => {
  const conflicts = getBentrokDetails(item, jadwalList) ?? []
  const namaMk = getMkName(item) || 'Mata Kuliah'
  const namaProdi = getProdiName(item)
  const namaRuang = getRuangName(item) || '-'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">
          {getInitials(namaMk)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold leading-5 text-slate-900">
                {namaMk}
              </h3>
              {item.kode_mk && (
                <p className="mt-1 text-xs font-medium text-slate-400">
                  {item.kode_mk}
                </p>
              )}
              <p className="mt-1 truncate text-xs font-medium text-indigo-600">
                {namaProdi}
              </p>
            </div>
            {conflicts.length > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                <AlertCircle size={12} />
                Bentrok
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Terjadwal
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Hari
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {item.hari || '-'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Waktu
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {formatTime(item.jam_mulai)} – {formatTime(item.jam_selesai)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-sm text-slate-600">
        <DoorOpen size={16} className="shrink-0 text-slate-400" />
        <span className="truncate">{namaRuang}</span>
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-xs text-slate-500">
        <GraduationCap size={15} className="shrink-0 text-slate-400" />
        <span className="truncate">{getSemesterLabel(item)}</span>
      </div>

      {item.catatan && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs leading-5 text-slate-500">{item.catatan}</p>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-red-700">Bentrok dengan</p>
              <div className="mt-1.5 space-y-1">
                {conflicts.map((conflictItem, index) => (
                  <p
                    key={`${conflictItem.id ?? conflictItem.jadwal_id}-${index}`}
                    className="text-xs leading-5 text-red-700"
                  >
                    • {getConflictLabel(conflictItem)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}