// src/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  getBentrokDetails,
  getMkName,
  getRuangName,
  type ScheduleItem,
} from '@/utils/scheduleHelpers';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DAY_ORDER = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

const DAY_SHORT: Record<string, string> = {
  Senin: 'Sen',
  Selasa: 'Sel',
  Rabu: 'Rab',
  Kamis: 'Kam',
  Jumat: 'Jum',
  Sabtu: 'Sab',
  Minggu: 'Min',
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);
  const [totalMk, setTotalMk] = useState(0);
  const [totalRuang, setTotalRuang] = useState(0);
  const [activeSemester, setActiveSemester] = useState('Memuat...');
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        { data: jadwalData, error: jadwalError },
        { count: mkCount, error: mkError },
        { count: ruangCount, error: ruangError },
        { data: semData, error: semError },
      ] = await Promise.all([
        supabase.from('view_jadwal_detail').select('*'),
        supabase.from('mk').select('*', { count: 'exact', head: true }),
        supabase.from('ruang').select('*', { count: 'exact', head: true }),
        supabase
          .from('master_semester')
          .select('*')
          .eq('is_active', true)
          .maybeSingle(),
      ]);

      if (jadwalError) throw jadwalError;
      if (mkError) throw mkError;
      if (ruangError) throw ruangError;
      if (semError) throw semError;

      const formattedJadwal = (jadwalData || []).map((item: any) => ({
        ...item,
        id: item.jadwal_id || item.id,
      }));

      setScheduleList(formattedJadwal);
      setTotalMk(mkCount || 0);
      setTotalRuang(ruangCount || 0);

      if (semData) {
        setActiveSemester(
          `${semData.tahun_ajaran} (${semData.tipe_semester})`
        );
      } else {
        setActiveSemester('Belum Diset');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Data dashboard gagal dimuat. Silakan coba refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const bentrokList = useMemo(
    () =>
      scheduleList.filter((item) => {
        const details = getBentrokDetails(item, scheduleList);
        return item.is_bentrok || (details && details.length > 0);
      }),
    [scheduleList]
  );

  const scheduleByDay = useMemo(() => {
    const counts: Record<string, number> = {};

    DAY_ORDER.forEach((day) => {
      counts[day] = 0;
    });

    scheduleList.forEach((item) => {
      if (item.hari && counts[item.hari] !== undefined) {
        counts[item.hari] += 1;
      }
    });

    return counts;
  }, [scheduleList]);

  const maxDayCount = Math.max(...Object.values(scheduleByDay), 1);

  const safeScheduleCount = Math.max(
    scheduleList.length - bentrokList.length,
    0
  );

  const firstName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Admin';

  return (
    <div className="min-h-full bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-50 blur-2xl" />
          <div className="absolute right-20 -bottom-24 h-40 w-40 rounded-full bg-blue-50 blur-2xl" />

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
                Pantau jadwal perkuliahan, alokasi ruangan, dan konflik
                akademik dari satu tempat.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchDashboardData}
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

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Jadwal
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {loading ? '—' : scheduleList.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sesi perkuliahan terdaftar
                </p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border bg-white p-5 shadow-sm ${
              bentrokList.length > 0
                ? 'border-red-200'
                : 'border-slate-200/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Jadwal Bentrok
                </p>
                <p
                  className={`mt-2 text-3xl font-bold tracking-tight ${
                    bentrokList.length > 0
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {loading ? '—' : bentrokList.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {bentrokList.length > 0
                    ? 'Perlu diperiksa'
                    : 'Semua jadwal aman'}
                </p>
              </div>
              <div
                className={`rounded-xl p-3 ${
                  bentrokList.length > 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {bentrokList.length > 0 ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Mata Kuliah
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {loading ? '—' : totalMk}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Data master mata kuliah
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ruangan
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {loading ? '—' : totalRuang}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Ruangan tersedia di master data
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_0.8fr]">
          {/* Weekly distribution */}
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
                {DAY_ORDER.map((day) => {
                  const count = scheduleByDay[day];
                  const height =
                    count === 0
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
                        {DAY_SHORT[day]}
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

          {/* Semester */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="font-bold text-slate-900">Semester Aktif</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Konfigurasi akademik saat ini
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tahun Akademik
                    </p>
                    <p className="mt-1 truncate text-lg font-bold text-slate-900">
                      {activeSemester}
                    </p>
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
        </section>

        {/* Conflict section */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-xl p-2 ${
                  bentrokList.length > 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {bentrokList.length > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Pemeriksaan Jadwal
                </h2>
                <p className="text-xs text-slate-500">
                  {bentrokList.length > 0
                    ? `${bentrokList.length} sesi membutuhkan perhatian`
                    : 'Tidak ditemukan konflik pada jadwal'}
                </p>
              </div>
            </div>

            <Link
              to="/kelola-jadwal"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Lihat semua jadwal
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-36 items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                Memeriksa konflik...
              </div>
            </div>
          ) : bentrokList.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
              <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                Semua jadwal aman
              </p>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                Tidak ada bentrok waktu atau ruangan yang terdeteksi pada data
                jadwal saat ini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bentrokList.slice(0, 5).map((item) => {
                const itemId = item.id || item.jadwal_id || 0;
                const details = getBentrokDetails(item, scheduleList);

                return (
                  <div
                    key={itemId}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-red-50/30 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-red-500" />
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {getMkName(item)}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {item.hari}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {item.jam_mulai} - {item.jam_selesai}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-red-400" />
                          {getRuangName(item)}
                        </span>
                      </div>
                    </div>

                    {details && details.length > 0 && (
                      <div className="w-full rounded-xl border border-red-100 bg-red-50/70 px-3 py-2.5 text-xs text-red-700 lg:max-w-md">
                        <p className="font-semibold text-red-800">
                          Bertabrakan dengan
                        </p>
                        {details.slice(0, 2).map((b, idx) => (
                          <p key={idx} className="mt-1 leading-4">
                            • {b.mk} ({b.ruang}) · {b.jam}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {bentrokList.length > 5 && (
                <div className="bg-slate-50 px-5 py-3 text-center text-xs text-slate-500 sm:px-6">
                  Menampilkan 5 dari {bentrokList.length} jadwal bentrok.
                  <Link
                    to="/kelola-jadwal"
                    className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Periksa semuanya
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Akses Cepat</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Menu yang paling sering digunakan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/kelola-jadwal"
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <Calendar className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">
                Kelola Jadwal
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Tambah, ubah, dan atur alokasi waktu serta ruangan perkuliahan.
              </p>
            </Link>

            <Link
              to="/master-semester"
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white">
                  <Layers className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-500" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">
                Master Semester
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Atur semester aktif dan konfigurasi tahun akademik.
              </p>
            </Link>

            <Link
              to="/"
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900">
                Tampilan Publik
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Lihat jadwal seperti yang ditampilkan kepada mahasiswa.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};