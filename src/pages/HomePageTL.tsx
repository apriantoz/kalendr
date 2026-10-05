// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import {
  getBentrokDetails,
  getMkName,
  getRuangName,
  type ScheduleItem
} from '@/utils/scheduleHelpers';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export interface JadwalPublicItem extends ScheduleItem {
  kode_mk?: string;
  tahun_ajaran?: string;
  tipe_semester?: string;
  catatan?: string;
}

export const HomePage: React.FC = () => {
  const [jadwalList, setJadwalList] = useState<JadwalPublicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHari, setSelectedHari] = useState<string>('Semua');
  const [selectedRuang, setSelectedRuang] = useState<string>('Semua');

  // List Ruangan unik untuk filter dropdown
  const [ruangList, setRuangList] = useState<string[]>([]);

  // Fetch Jadwal Publik
  const fetchJadwalPublik = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('view_jadwal_detail')
        .select('*')
        .order('hari', { ascending: true })
        .order('jam_mulai', { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        ...item,
        id: item.jadwal_id || item.id,
      }));

      setJadwalList(formattedData);

      const uniqueRuang = Array.from(
        new Set(formattedData.map((i) => i.nama_ruang).filter(Boolean))
      ) as string[];

      setRuangList(uniqueRuang);
    } catch (err: any) {
      console.error('Error fetching public schedule:', err);
      setError('Gagal memuat jadwal perkuliahan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwalPublik();
  }, []);

  // Filter Data
  const filteredJadwal = jadwalList.filter((item) => {
    if (selectedHari !== 'Semua' && item.hari !== selectedHari) {
      return false;
    }

    if (selectedRuang !== 'Semua' && item.nama_ruang !== selectedRuang) {
      return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();

      const matchMk = getMkName(item).toLowerCase().includes(q);
      const matchKode = item.kode_mk?.toLowerCase().includes(q);
      const matchRuang = getRuangName(item).toLowerCase().includes(q);
      const matchCatatan = item.catatan?.toLowerCase().includes(q);

      return matchMk || matchKode || matchRuang || matchCatatan;
    }

    return true;
  });

  const hariOptions = [
    'Semua',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Minggu'
  ];

  /*
   * Urutan hari agar timeline tetap konsisten.
   */
  const hariOrder: Record<string, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
    Minggu: 7,
  };

  /*
   * Kelompokkan jadwal berdasarkan hari.
   */
  const groupedJadwal = filteredJadwal.reduce(
    (groups, item) => {
      const hari = item.hari || 'Hari Tidak Diketahui';

      if (!groups[hari]) {
        groups[hari] = [];
      }

      groups[hari].push(item);

      return groups;
    },
    {} as Record<string, JadwalPublicItem[]>
  );

  /*
   * Urutkan hari dan jadwal berdasarkan jam.
   */
  const sortedHari = Object.keys(groupedJadwal).sort((a, b) => {
    return (hariOrder[a] || 99) - (hariOrder[b] || 99);
  });

  sortedHari.forEach((hari) => {
    groupedJadwal[hari].sort((a, b) => {
      return String(a.jam_mulai || '').localeCompare(
        String(b.jam_mulai || '')
      );
    });
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">

      {/* =========================================================
          HERO
      ========================================================== */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Sistem Informasi Penjadwalan Perkuliahan
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Jadwal Kuliah & Kegiatan Akademik
            </h1>

            <p className="text-indigo-100 text-sm sm:text-base max-w-2xl">
              Cek alokasi ruangan, jam kuliah, dan status perkuliahan secara
              terupdate dan transparan tanpa perlu login.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-center">
            <GraduationCap className="w-10 h-10 text-yellow-300" />

            <div className="text-left">
              <span className="text-xs uppercase font-semibold tracking-wider text-indigo-200">
                Total Jadwal
              </span>

              <p className="text-2xl font-bold text-white">
                {jadwalList.length} Sesi
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {/* =======================================================
            FILTER
        ======================================================== */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

            {/* Search */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Cari mata kuliah, kode, atau ruangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Hari */}
            <div className="md:col-span-3">
              <select
                value={selectedHari}
                onChange={(e) => setSelectedHari(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                {hariOptions.map((h) => (
                  <option key={h} value={h}>
                    Hari: {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Ruangan */}
            <div className="md:col-span-3">
              <select
                value={selectedRuang}
                onChange={(e) => setSelectedRuang(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="Semua">
                  Ruangan: Semua
                </option>

                {ruangList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <div className="md:col-span-1 flex justify-end">
              <button
                onClick={fetchJadwalPublik}
                className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition w-full md:w-auto flex items-center justify-center"
                title="Refresh Data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loading ? 'animate-spin' : ''
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* =======================================================
            ERROR
        ======================================================== */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* =======================================================
            TIMELINE
        ======================================================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">

          {loading ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />

              <p className="text-sm font-medium">
                Memuat jadwal kuliah terbaru...
              </p>
            </div>

          ) : filteredJadwal.length === 0 ? (

            <div className="p-16 text-center text-slate-500">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />

              <p className="font-semibold text-slate-700">
                Tidak ada jadwal ditemukan
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Coba sesuaikan kata kunci atau filter pencarian Anda.
              </p>
            </div>

          ) : (

            <div className="space-y-12">

              {sortedHari.map((hari, hariIndex) => (
                <section key={hari}>

                  {/* =================================================
                      HEADER HARI
                  ================================================== */}
                  <div className="flex items-center gap-4 mb-6">

                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {hari}
                      </h2>

                      <p className="text-xs text-slate-400">
                        {groupedJadwal[hari].length} sesi perkuliahan
                      </p>
                    </div>

                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* =================================================
                      TIMELINE ITEMS
                  ================================================== */}
                  <div className="relative ml-5 sm:ml-7">

                    {/* Vertical Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />

                    <div className="space-y-6">

                      {groupedJadwal[hari].map((item) => {

                        const itemId =
                          item.id ||
                          item.jadwal_id ||
                          `${hari}-${item.jam_mulai}-${getMkName(item)}`;

                        const bentrokDetails =
                          getBentrokDetails(item, jadwalList);

                        const isBentrok =
                          item.is_bentrok ||
                          (bentrokDetails &&
                            bentrokDetails.length > 0);

                        return (
                          <div
                            key={itemId}
                            className="relative pl-8 sm:pl-12"
                          >

                            {/* Timeline Dot */}
                            <div
                              className={`absolute left-0 top-6 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                                isBentrok
                                  ? 'bg-red-500'
                                  : 'bg-indigo-500'
                              }`}
                            />

                            {/* Time */}
                            <div className="mb-2 flex flex-wrap items-center gap-2">

                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                  isBentrok
                                    ? 'text-red-600'
                                    : 'text-indigo-600'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />

                                {item.jam_mulai} - {item.jam_selesai}
                              </span>

                              {isBentrok && (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                  <AlertTriangle className="w-3 h-3" />
                                  Bentrok
                                </span>
                              )}

                            </div>

                            {/* =================================================
                                SCHEDULE CARD
                            ================================================== */}
                            <div
                              className={`rounded-2xl border p-5 transition-all ${
                                isBentrok
                                  ? 'bg-red-50/70 border-red-200 hover:border-red-300 hover:shadow-md'
                                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'
                              }`}
                            >

                              {/* Header Card */}
                              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                                <div className="flex gap-3 min-w-0">

                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                      isBentrok
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-indigo-50 text-indigo-600'
                                    }`}
                                  >
                                    <BookOpen className="w-5 h-5" />
                                  </div>

                                  <div className="min-w-0">

                                    <h3
                                      className={`font-bold text-base sm:text-lg leading-snug ${
                                        isBentrok
                                          ? 'text-red-900'
                                          : 'text-slate-900'
                                      }`}
                                    >
                                      {getMkName(item)}
                                    </h3>

                                    {item.kode_mk && (
                                      <p className="text-xs text-slate-400 mt-1">
                                        Kode: {item.kode_mk}
                                      </p>
                                    )}

                                  </div>
                                </div>

                                {/* Status */}
                                <div className="shrink-0">

                                  {isBentrok ? (

                                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-full font-bold border border-red-200">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      Jadwal Bentrok
                                    </span>

                                  ) : (

                                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-medium border border-emerald-200">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Terjadwal
                                    </span>

                                  )}

                                </div>

                              </div>

                              {/* Info Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

                                {/* Waktu */}
                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-3">
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                  </div>

                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                      Waktu
                                    </p>

                                    <p className="text-xs font-semibold text-slate-700">
                                      {item.jam_mulai} - {item.jam_selesai}
                                    </p>
                                  </div>
                                </div>

                                {/* Ruangan */}
                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-3">
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                  </div>

                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                      Ruangan
                                    </p>

                                    <p className="text-xs font-semibold text-slate-700">
                                      {getRuangName(item)}
                                    </p>
                                  </div>
                                </div>

                                {/* Semester */}
                                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-3">
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                    <GraduationCap className="w-4 h-4 text-purple-500" />
                                  </div>

                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                      Akademik
                                    </p>

                                    <p className="text-xs font-semibold text-slate-700">
                                      {item.tahun_ajaran &&
                                      item.tipe_semester
                                        ? `${item.tahun_ajaran} (${item.tipe_semester})`
                                        : 'Akademik'}
                                    </p>
                                  </div>
                                </div>

                              </div>

                              {/* Bentrok Details */}
                              {isBentrok &&
                                bentrokDetails &&
                                bentrokDetails.length > 0 && (

                                  <div className="mt-4 bg-red-100/70 border border-red-200 rounded-xl p-4">

                                    <div className="flex items-center gap-2 text-xs font-bold text-red-800 mb-3">
                                      <AlertTriangle className="w-4 h-4" />
                                      Bentrok dengan:
                                    </div>

                                    <div className="space-y-2">

                                      {bentrokDetails.map((b, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-white/70 border border-red-200 rounded-lg px-3 py-2"
                                        >
                                          <p className="text-xs font-semibold text-red-900">
                                            {b.mk}
                                          </p>

                                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-red-600">
                                            <span className="flex items-center gap-1">
                                              <MapPin className="w-3 h-3" />
                                              {b.ruang}
                                            </span>

                                            <span className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {b.jam}
                                            </span>
                                          </div>
                                        </div>
                                      ))}

                                    </div>
                                  </div>
                                )}

                              {/* Catatan */}
                              {item.catatan && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                                    Catatan
                                  </p>

                                  <p className="text-xs text-slate-500 leading-relaxed">
                                    {item.catatan}
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>

                  {/* Divider antar hari */}
                  {hariIndex < sortedHari.length - 1 && (
                    <div className="mt-10 border-b border-dashed border-slate-200" />
                  )}

                </section>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
