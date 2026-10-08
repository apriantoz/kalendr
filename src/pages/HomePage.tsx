import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/utils/supabase'
import {
  AlertCircle,
  CalendarDays,
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
} from '@/utils/scheduleHelpers'

import { type JadwalPublicItem, type MasterSemester } from '@/types/schedule'
import { StatCard } from '@/components/home/StatCard'
import { FilterSelect } from '@/components/home/FilterSelect'
import { LoadingState, EmptyState } from '@/components/home/States'
import {
  PublicScheduleRow,
  PublicScheduleCard,
} from '@/components/home/ScheduleItems'

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const HARI_OPTIONS = ['Semua', ...HARI_ORDER]

const getHariIndex = (hari?: string) => {
  const index = HARI_ORDER.indexOf(hari || '')
  return index === -1 ? 99 : index
}

const getSemesterLabel = (item: JadwalPublicItem) => {
  if (!item.tahun_ajaran && !item.tipe_semester) return '-'
  return [item.tahun_ajaran, item.tipe_semester].filter(Boolean).join(' • ')
}

const getProdiName = (item: JadwalPublicItem) =>
  item.nama_prodi || 'Prodi belum tersedia'

export const HomePage: React.FC = () => {
  const [jadwalList, setJadwalList] = useState<JadwalPublicItem[]>([])
  const [activeSemester, setActiveSemester] = useState<MasterSemester | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHari, setSelectedHari] = useState('Semua')
  const [selectedRuang, setSelectedRuang] = useState('Semua')
  const [selectedSemester, setSelectedSemester] = useState('Semua')

  const fetchJadwalPublik = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const [jadwalResult, semesterResult] = await Promise.all([
        supabase.from('view_jadwal_detail').select('*'),
        supabase
          .from('master_semester')
          .select('id, tahun_ajaran, tipe_semester, is_active')
          .eq('is_active', true)
          .maybeSingle(),
      ])

      if (jadwalResult.error) throw jadwalResult.error

      const formattedData = ((jadwalResult.data || []) as JadwalPublicItem[])
        .map((item) => ({ ...item, id: item.jadwal_id ?? item.id }))
        .sort((a, b) => {
          const hariDiff = getHariIndex(a.hari) - getHariIndex(b.hari)
          if (hariDiff !== 0) return hariDiff
          return String(a.jam_mulai || '').localeCompare(String(b.jam_mulai || ''))
        })

      setJadwalList(formattedData)

      if (!semesterResult.error) {
        const semester = (semesterResult.data as MasterSemester | null) || null
        setActiveSemester(semester)
        if (semester && !selectedSemester) {
          setSelectedSemester(
            [semester.tahun_ajaran, semester.tipe_semester].filter(Boolean).join(' • '),
          )
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat jadwal.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchJadwalPublik()
  }, [])

  const activeSemesterLabel = useMemo(() => {
    if (!activeSemester) return ''
    return [activeSemester.tahun_ajaran, activeSemester.tipe_semester]
      .filter(Boolean)
      .join(' • ')
  }, [activeSemester])

  useEffect(() => {
    if (activeSemesterLabel && selectedSemester === 'Semua') {
      setSelectedSemester(activeSemesterLabel)
    }
  }, [activeSemesterLabel, selectedSemester])

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
      const namaProdi = getProdiName(item)
      const namaRuang = getRuangName(item) || ''
      const semester = getSemesterLabel(item)
      const matchesHari = selectedHari === 'Semua' || item.hari === selectedHari
      const matchesRuang = selectedRuang === 'Semua' || namaRuang === selectedRuang
      const matchesSemester = selectedSemester === 'Semua' || semester === selectedSemester
      const searchableText = [namaMk, item.kode_mk, namaProdi, namaRuang, semester, item.catatan]
        .join(' ')
        .toLowerCase()

      return matchesHari && matchesRuang && matchesSemester && (!keyword || searchableText.includes(keyword))
    })
  }, [jadwalList, searchQuery, selectedHari, selectedRuang, selectedSemester])

  const stats = useMemo(() => {
    const rooms = new Set(
      filteredJadwal.map((item) => getRuangName(item)).filter((value) => value && value !== '-'),
    )
    const days = new Set(filteredJadwal.map((item) => item.hari).filter(Boolean))
    const conflicts = filteredJadwal.filter(
      (item) => (getBentrokDetails(item, jadwalList) ?? []).length > 0,
    ).length

    return { total: filteredJadwal.length, rooms: rooms.size, days: days.size, conflicts }
  }, [filteredJadwal, jadwalList])

  const jadwalHariIni = useMemo(() => {
    const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date())
    return filteredJadwal.filter((item) => item.hari?.toLowerCase() === today.toLowerCase())
  }, [filteredJadwal])

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    selectedHari !== 'Semua' ||
    selectedRuang !== 'Semua' ||
    selectedSemester !== 'Semua'

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedHari('Semua')
    setSelectedRuang('Semua')
    setSelectedSemester(activeSemesterLabel || 'Semua')
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
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
              <span className="block text-indigo-600">dengan cepat.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Cari mata kuliah, program studi, ruangan, atau waktu perkuliahan tanpa perlu login.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-600">
                <GraduationCap size={16} className="text-indigo-600" />
                {activeSemester ? `${activeSemester.tahun_ajaran} • ${activeSemester.tipe_semester}` : 'Semester aktif belum diset'}
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-slate-600">
                <CalendarDays size={16} className="text-indigo-600" />
                {stats.total} jadwal tersedia
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Jadwal" value={stats.total} icon={<CalendarDays size={18} />} />
            <StatCard label="Ruangan" value={stats.rooms} icon={<DoorOpen size={18} />} />
            <StatCard label="Hari Aktif" value={stats.days} icon={<Clock3 size={18} />} />
            <StatCard label="Bentrok" value={stats.conflicts} danger={stats.conflicts > 0} icon={<AlertCircle size={18} />} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Cari jadwal</label>
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mata kuliah, kode, prodi, ruangan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-11 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FilterSelect label="Hari" value={selectedHari} options={HARI_OPTIONS} onChange={setSelectedHari} />
            <FilterSelect label="Ruangan" value={selectedRuang} options={['Semua', ...ruangList]} onChange={setSelectedRuang} />
            <FilterSelect label="Semester" value={selectedSemester} options={['Semua', ...semesterList]} onChange={setSelectedSemester} />
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-800">{filteredJadwal.length}</span> dari {jadwalList.length} jadwal
            </p>
            <div className="flex flex-wrap gap-2">
              {hasFilters && (
                <button onClick={resetFilters} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                  <X size={15} /> Reset
                </button>
              )}
              <button
                onClick={() => fetchJadwalPublik(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>
        </section>

        {!hasFilters && jadwalHariIni.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Fokus hari ini</p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Jadwal Hari Ini</h2>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {jadwalHariIni.slice(0, 6).map((item) => (
                <PublicScheduleCard key={`today-${item.id}`} item={item} jadwalList={jadwalList} />
              ))}
            </div>
          </section>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Gagal memuat jadwal</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <section className="mt-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daftar jadwal</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Semua Jadwal</h2>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredJadwal.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onReset={resetFilters} />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                        <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Mata Kuliah</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Program Studi</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Hari & Waktu</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Ruangan</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Semester</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                        <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredJadwal.map((item) => (
                        <PublicScheduleRow key={item.id} item={item} jadwalList={jadwalList} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid gap-3 lg:hidden">
                {filteredJadwal.map((item) => (
                  <PublicScheduleCard key={item.id} item={item} jadwalList={jadwalList} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}