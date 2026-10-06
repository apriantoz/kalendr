import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/utils/supabase'
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Clock3,
  DoorOpen,
  GraduationCap,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import {
  getBentrokDetails,
  getMkName,
  getRuangName,
  type ScheduleItem,
} from '@/utils/scheduleHelpers'

interface JadwalPublicItem extends ScheduleItem {
  kode_mk?: string
  tahun_ajaran?: string
  tipe_semester?: string
  catatan?: string
}

interface MasterSemester {
  id: number
  tahun_ajaran: string
  tipe_semester: string
  is_active: boolean
}

const HARI_ORDER = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
]

const HARI_OPTIONS = ['Semua', ...HARI_ORDER]

const getHariIndex = (hari?: string) => {
  const index = HARI_ORDER.indexOf(hari || '')
  return index === -1 ? 99 : index
}

const formatTime = (time?: string | null) =>
  time ? String(time).slice(0, 5) : '-'

const getSemesterLabel = (item: JadwalPublicItem) => {
  if (!item.tahun_ajaran && !item.tipe_semester) return '-'

  return [item.tahun_ajaran, item.tipe_semester]
    .filter(Boolean)
    .join(' • ')
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

export const HomePage: React.FC = () => {
  const [jadwalList, setJadwalList] = useState<JadwalPublicItem[]>([])
  const [activeSemester, setActiveSemester] =
    useState<MasterSemester | null>(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHari, setSelectedHari] = useState('Semua')
  const [selectedRuang, setSelectedRuang] = useState('Semua')
  const [selectedSemester, setSelectedSemester] = useState('Semua')

  const fetchJadwalPublik = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const [jadwalResult, semesterResult] = await Promise.all([
        supabase
          .from('view_jadwal_detail')
          .select('*'),

        supabase
          .from('master_semester')
          .select('id, tahun_ajaran, tipe_semester, is_active')
          .eq('is_active', true)
          .maybeSingle(),
      ])

      if (jadwalResult.error) {
        throw jadwalResult.error
      }

      const formattedData = (
        (jadwalResult.data || []) as JadwalPublicItem[]
      )
        .map((item) => ({
          ...item,
          id: item.jadwal_id || item.id,
        }))
        .sort((a, b) => {
          const hariDiff =
            getHariIndex(a.hari) - getHariIndex(b.hari)

          if (hariDiff !== 0) return hariDiff

          return String(a.jam_mulai || '').localeCompare(
            String(b.jam_mulai || ''),
          )
        })

      setJadwalList(formattedData)

      if (!semesterResult.error) {
        setActiveSemester(
          (semesterResult.data as MasterSemester | null) || null,
        )
      }
    } catch (err: any) {
      console.error('Error fetching public schedule:', err)
      setError(err?.message || 'Gagal memuat jadwal.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchJadwalPublik()
  }, [])

  const ruangList = useMemo(() => {
    return Array.from(
      new Set(
        jadwalList
          .map((item) => getRuangName(item))
          .filter((value) => value && value !== '-'),
      ),
    ).sort((a, b) => a.localeCompare(b))
  }, [jadwalList])

  const semesterList = useMemo(() => {
    return Array.from(
      new Set(
        jadwalList
          .map((item) => getSemesterLabel(item))
          .filter((value) => value && value !== '-'),
      ),
    )
  }, [jadwalList])

  const filteredJadwal = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return jadwalList.filter((item) => {
      const namaMk = getMkName(item) || ''
      const namaRuang = getRuangName(item) || ''
      const semester = getSemesterLabel(item)
      const catatan = item.catatan || ''
      const kodeMk = item.kode_mk || ''

      const matchesHari =
        selectedHari === 'Semua' || item.hari === selectedHari

      const matchesRuang =
        selectedRuang === 'Semua' ||
        namaRuang === selectedRuang

      const matchesSemester =
        selectedSemester === 'Semua' ||
        semester === selectedSemester

      const searchableText = [
        namaMk,
        kodeMk,
        namaRuang,
        semester,
        catatan,
      ]
        .join(' ')
        .toLowerCase()

      return (
        matchesHari &&
        matchesRuang &&
        matchesSemester &&
        (!keyword || searchableText.includes(keyword))
      )
    })
  }, [
    jadwalList,
    searchQuery,
    selectedHari,
    selectedRuang,
    selectedSemester,
  ])

  const stats = useMemo(() => {
    const rooms = new Set(
      jadwalList
        .map((item) => getRuangName(item))
        .filter((value) => value && value !== '-'),
    )

    const days = new Set(
      jadwalList.map((item) => item.hari).filter(Boolean),
    )

    const conflicts = jadwalList.filter(
      (item) =>
        (getBentrokDetails(item, jadwalList) ?? []).length > 0,
    ).length

    return {
      total: jadwalList.length,
      rooms: rooms.size,
      days: days.size,
      conflicts,
    }
  }, [jadwalList])

  const jadwalHariIni = useMemo(() => {
    const today = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
    }).format(new Date())

    return jadwalList.filter(
      (item) =>
        item.hari?.toLowerCase() === today.toLowerCase(),
    )
  }, [jadwalList])

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    selectedHari !== 'Semua' ||
    selectedRuang !== 'Semua' ||
    selectedSemester !== 'Semua'

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedHari('Semua')
    setSelectedRuang('Semua')
    setSelectedSemester('Semua')
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-14 lg:pt-14">
          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles size={14} />
              Jadwal Akademik
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Temukan jadwal kuliah
              <span className="block text-indigo-600">
                dengan cepat.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Cari mata kuliah, ruangan, atau waktu perkuliahan
              tanpa perlu login. Semua jadwal tersedia dalam satu
              tempat.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">

              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-600">
                <GraduationCap
                  size={16}
                  className="text-indigo-600"
                />

                {activeSemester
                  ? `${activeSemester.tahun_ajaran} • ${activeSemester.tipe_semester}`
                  : 'Semester aktif belum diset'}
              </div>

              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-600">
                <CalendarDays
                  size={16}
                  className="text-indigo-600"
                />
                {stats.total} jadwal tersedia
              </div>

            </div>
          </div>

          {/* STATISTICS */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">

            <StatCard
              label="Total Jadwal"
              value={stats.total}
              icon={<CalendarDays size={18} />}
            />

            <StatCard
              label="Ruangan"
              value={stats.rooms}
              icon={<DoorOpen size={18} />}
            />

            <StatCard
              label="Hari Aktif"
              value={stats.days}
              icon={<Clock3 size={18} />}
            />

            <StatCard
              label="Bentrok"
              value={stats.conflicts}
              danger={stats.conflicts > 0}
              icon={<AlertCircle size={18} />}
            />

          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* SEARCH & FILTER */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Cari jadwal
            </label>

            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Cari mata kuliah, kode, ruangan, atau catatan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Hapus pencarian"
                >
                  <X size={16} />
                </button>
              )}

            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            <FilterSelect
              label="Hari"
              value={selectedHari}
              options={HARI_OPTIONS}
              onChange={setSelectedHari}
            />

            <FilterSelect
              label="Ruangan"
              value={selectedRuang}
              options={['Semua', ...ruangList]}
              onChange={setSelectedRuang}
            />

            <FilterSelect
              label="Semester"
              value={selectedSemester}
              options={['Semua', ...semesterList]}
              onChange={setSelectedSemester}
            />

          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-500">
              Menampilkan{' '}
              <span className="font-semibold text-slate-800">
                {filteredJadwal.length}
              </span>{' '}
              dari {jadwalList.length} jadwal
            </p>

            <div className="flex flex-wrap gap-2">

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={15} />
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={() => fetchJadwalPublik(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing ? 'animate-spin' : ''
                  }
                />
                Refresh
              </button>

            </div>
          </div>
        </section>

        {/* JADWAL HARI INI */}
        {!hasFilters && jadwalHariIni.length > 0 && (
          <section className="mt-6">

            <div className="mb-3 flex items-end justify-between gap-3">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Fokus hari ini
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  Jadwal Hari Ini
                </h2>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {jadwalHariIni.length} sesi
              </span>

            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

              {jadwalHariIni.slice(0, 6).map((item) => (
                <PublicScheduleCard
                  key={`today-${item.id}`}
                  item={item}
                  jadwalList={jadwalList}
                />
              ))}

            </div>
          </section>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <p className="font-semibold">
                Gagal memuat jadwal
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ALL SCHEDULE */}
        <section className="mt-6">

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Daftar jadwal
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Semua Jadwal
            </h2>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredJadwal.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onReset={resetFilters}
            />
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-245">

                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-left">

                        <TableHeader>
                          Mata Kuliah
                        </TableHeader>

                        <TableHeader>
                          Hari & Waktu
                        </TableHeader>

                        <TableHeader>
                          Ruangan
                        </TableHeader>

                        <TableHeader>
                          Semester
                        </TableHeader>

                        <TableHeader>
                          Status
                        </TableHeader>

                        <TableHeader>
                          Catatan
                        </TableHeader>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredJadwal.map((item) => (
                        <PublicScheduleRow
                          key={item.id}
                          item={item}
                          jadwalList={jadwalList}
                        />
                      ))}

                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE / TABLET */}
              <div className="grid gap-3 lg:hidden">

                {filteredJadwal.map((item) => (
                  <PublicScheduleCard
                    key={item.id}
                    item={item}
                    jadwalList={jadwalList}
                  />
                ))}

              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

const StatCard = ({
  label,
  value,
  icon,
  danger = false,
}: {
  label: string
  value: number
  icon: React.ReactNode
  danger?: boolean
}) => (
  <div
    className={`rounded-xl border bg-white p-4 shadow-sm ${
      danger
        ? 'border-red-200'
        : 'border-slate-200'
    }`}
  >
    <div className="flex items-center justify-between gap-3">

      <div>
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p
          className={`mt-1 text-2xl font-bold tracking-tight ${
            danger && value > 0
              ? 'text-red-600'
              : 'text-slate-900'
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

const TableHeader = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
    {children}
  </th>
)

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) => (
  <label className="block">

    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>

    <div className="relative">

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

    </div>
  </label>
)

const PublicScheduleRow = ({
  item,
  jadwalList,
}: {
  item: JadwalPublicItem
  jadwalList: JadwalPublicItem[]
}) => {
  const conflicts = getBentrokDetails(item, jadwalList) ?? []

  const conflictNames = conflicts
    .map((conflictItem: any) => conflictItem.mk || getMkName(conflictItem))
    .filter(Boolean)
    .join(', ')

  const namaMk =
    getMkName(item) || 'Mata Kuliah'

  const namaRuang =
    getRuangName(item) || '-'

  return (
    <tr className="group transition hover:bg-slate-50/70">

      <td className="px-5 py-4 align-top">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
            {getInitials(namaMk)}
          </div>

          <div className="min-w-0">

            <p className="font-semibold text-slate-900">
              {namaMk}
            </p>

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

          <Clock3
            size={16}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <div>

            <p className="font-semibold text-slate-800">
              {item.hari || '-'}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {formatTime(item.jam_mulai)} –{' '}
              {formatTime(item.jam_selesai)}
            </p>

          </div>
        </div>
      </td>

      <td className="px-5 py-4 align-top">

        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">

          <DoorOpen
            size={16}
            className="text-slate-400"
          />

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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">

            <AlertCircle size={13} />

            Bentrok
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            Terjadwal
          </span>
        )}

      </td>

      <td className="max-w-55 px-5 py-4 align-top">

        <p className="text-sm leading-5 text-slate-500">
          {item.catatan || '-'}
        </p>

        {conflicts.length > 0 && (
          <p className="mt-2 text-xs font-medium text-red-600">
            Bentrok dengan: {conflictNames}
          </p>
        )}

      </td>
    </tr>
  )
}

const PublicScheduleCard = ({
  item,
  jadwalList,
}: {
  item: JadwalPublicItem
  jadwalList: JadwalPublicItem[]
}) => {
  const conflicts = getBentrokDetails(item, jadwalList) ?? []

  const conflictNames = conflicts
    .map((conflictItem: any) => conflictItem.mk || getMkName(conflictItem))
    .filter(Boolean)
    .join(', ')

  const namaMk =
    getMkName(item) || 'Mata Kuliah'

  const namaRuang =
    getRuangName(item) || '-'

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
            {formatTime(item.jam_mulai)} –{' '}
            {formatTime(item.jam_selesai)}
          </p>

        </div>

      </div>

      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-sm text-slate-600">

        <DoorOpen
          size={16}
          className="shrink-0 text-slate-400"
        />

        <span className="truncate">
          {namaRuang}
        </span>

      </div>

      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-xs text-slate-500">

        <GraduationCap
          size={15}
          className="shrink-0 text-slate-400"
        />

        <span className="truncate">
          {getSemesterLabel(item)}
        </span>

      </div>

      {item.catatan && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs leading-5 text-slate-500">
            {item.catatan}
          </p>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">

          <AlertCircle
            size={14}
            className="mt-0.5 shrink-0"
          />

          <span>
            Bentrok dengan: {conflictNames}
          </span>

        </div>
      )}

    </article>
  )
}

const LoadingState = () => (
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

const EmptyState = ({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean
  onReset: () => void
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