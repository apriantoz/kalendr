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
  Sparkles
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

  // Fetch Jadwal Publik dari View view_jadwal_detail
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

      // Ambil daftar ruangan unik
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

  // Filter Data Berdasarkan Input User
  const filteredJadwal = jadwalList.filter((item) => {
    // Filter Hari
    if (selectedHari !== 'Semua' && item.hari !== selectedHari) return false;

    // Filter Ruangan
    if (selectedRuang !== 'Semua' && item.nama_ruang !== selectedRuang) return false;

    // Filter Pencarian Kata Kunci
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

  const hariOptions = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Hero Section */}
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
              Cek alokasi ruangan, jam kuliah, dan status perkuliahan secara terupdate dan transparan tanpa perlu login.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-center">
            <GraduationCap className="w-10 h-10 text-yellow-300" />
            <div className="text-left">
              <span className="text-xs uppercase font-semibold tracking-wider text-indigo-200">Total Jadwal</span>
              <p className="text-2xl font-bold text-white">{jadwalList.length} Sesi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Card Panel Filter Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Input Pencarian */}
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

            {/* Filter Hari */}
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

            {/* Filter Ruangan */}
            <div className="md:col-span-3">
              <select
                value={selectedRuang}
                onChange={(e) => setSelectedRuang(e.target.value)}
                className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="Semua">Ruangan: Semua</option>
                {ruangList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <div className="md:col-span-1 flex justify-end">
              <button
                onClick={fetchJadwalPublik}
                className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition w-full md:w-auto flex items-center justify-center"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

          </div>
        </div>

        {/* Status Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Tabel Data Jadwal */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
              <p className="text-sm font-medium">Memuat jadwal kuliah terbaru...</p>
            </div>
          ) : filteredJadwal.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">Tidak ada jadwal ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">
                Coba sesuaikan kata kunci atau filter pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Mata Kuliah / Kegiatan</th>
                    <th className="px-6 py-4">Hari & Waktu</th>
                    <th className="px-6 py-4">Ruangan</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4">Status Ruang</th>
                    <th className="px-6 py-4">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJadwal.map((item) => {
                    const itemId = item.id || item.jadwal_id || 0;
                    
                    // Menggunakan helper terpusat
                    const bentrokDetails = getBentrokDetails(item, jadwalList);
                    const isBentrok = item.is_bentrok || (bentrokDetails && bentrokDetails.length > 0);

                    return (
                      <tr
                        key={itemId}
                        className={`transition ${
                          isBentrok ? 'bg-red-50/60 hover:bg-red-100/60 border-l-4 border-l-red-500' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Mata Kuliah */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5 font-semibold text-slate-900">
                            <BookOpen className={`w-4 h-4 ${isBentrok ? 'text-red-600' : 'text-indigo-600'}`} />
                            <div>
                              <span>{getMkName(item)}</span>
                              {item.kode_mk && (
                                <span className="block text-xs font-normal text-slate-400">
                                  Kode: {item.kode_mk}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Hari & Waktu */}
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                            <Calendar className={`w-3.5 h-3.5 ${isBentrok ? 'text-red-500' : 'text-indigo-500'}`} />
                            {item.hari}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className={`w-3.5 h-3.5 ${isBentrok ? 'text-red-400' : 'text-indigo-400'}`} />
                            {item.jam_mulai} - {item.jam_selesai}
                          </div>
                        </td>

                        {/* Ruangan */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            {getRuangName(item)}
                          </div>
                        </td>

                        {/* Semester / Th. Ajaran */}
                        <td className="px-6 py-4">
                          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium border border-indigo-100">
                            {item.tahun_ajaran && item.tipe_semester
                              ? `${item.tahun_ajaran} (${item.tipe_semester})`
                              : 'Akademik'}
                          </span>
                        </td>

                        {/* Status Ruang & Bentrok */}
                        <td className="px-6 py-4">
                          {isBentrok ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold border border-red-300 shadow-xs">
                                <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                Bentrok
                              </span>
                              {bentrokDetails && bentrokDetails.length > 0 && (
                                <div className="text-[11px] text-red-700 bg-red-100/80 p-2 rounded-lg border border-red-200 mt-1 max-w-xs space-y-1">
                                  <span className="font-semibold block text-red-800">Bentrok dengan:</span>
                                  {bentrokDetails.map((b, idx) => (
                                    <div key={idx} className="leading-tight">
                                      • <strong>{b.mk}</strong> ({b.ruang}) <br />
                                      <span className="text-red-600 font-medium">⏱ {b.jam}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                              Terjadwal
                            </span>
                          )}
                        </td>

                        {/* Catatan */}
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                          {item.catatan || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};