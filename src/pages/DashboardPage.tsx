// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  getBentrokDetails, 
  getMkName, 
  getRuangName, 
  type ScheduleItem 
} from '@/utils/scheduleHelpers';
import { 
  Calendar, 
  BookOpen, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  ArrowRight, 
  Loader2, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);
  const [totalMk, setTotalMk] = useState<number>(0);
  const [totalRuang, setTotalRuang] = useState<number>(0);
  const [activeSemester, setActiveSemester] = useState<string>('Memuat...');

  // Fetch Semua Data Ringkasan
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Jadwal & View Bentrok
      const { data: jadwalData } = await supabase
        .from('view_jadwal_detail')
        .select('*');

      const formattedJadwal = (jadwalData || []).map((item: any) => ({
        ...item,
        id: item.jadwal_id || item.id,
      }));
      setScheduleList(formattedJadwal);

      // 2. Fetch Total Mata Kuliah
      const { count: mkCount } = await supabase
        .from('mk')
        .select('*', { count: 'exact', head: true });
      setTotalMk(mkCount || 0);

      // 3. Fetch Total Ruangan
      const { count: ruangCount } = await supabase
        .from('ruang')
        .select('*', { count: 'exact', head: true });
      setTotalRuang(ruangCount || 0);

      // 4. Fetch Semester Aktif
      const { data: semData } = await supabase
        .from('master_semester')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (semData) {
        setActiveSemester(`${semData.tahun_ajaran} (${semData.tipe_semester})`);
      } else {
        setActiveSemester('Belum Diset');
      }

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter khusus jadwal yang mengalami bentrok
  const bentrokList = scheduleList.filter((item) => {
    const details = getBentrokDetails(item, scheduleList);
    return item.is_bentrok || (details && details.length > 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Selamat Datang, Admin! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan status jadwal perkuliahan, alokasi ruangan, dan konflik jadwal akademik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/jadwal"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Kelola Jadwal
          </Link>
        </div>
      </div>

      {/* Grid Statistik Kartu Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Jadwal */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Jadwal</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{scheduleList.length}</p>
            <span className="text-xs text-slate-500 mt-0.5 inline-block">Sesi terdaftar</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Status Bentrok */}
        <div className={`bg-white rounded-2xl border p-5 shadow-xs flex items-center justify-between ${
          bentrokList.length > 0 ? 'border-red-200 bg-red-50/20' : 'border-slate-200/80'
        }`}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Bentrok</span>
            <p className={`text-2xl font-extrabold mt-1 ${bentrokList.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {bentrokList.length} Sesi
            </p>
            <span className="text-xs text-slate-500 mt-0.5 inline-block">
              {bentrokList.length > 0 ? 'Perlu tindakan revisi' : 'Semua jadwal aman'}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${
            bentrokList.length > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {bentrokList.length > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          </div>
        </div>

        {/* Total Mata Kuliah */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mata Kuliah</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalMk}</p>
            <span className="text-xs text-slate-500 mt-0.5 inline-block">Master data MK</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Semester Aktif */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Semester Aktif</span>
            <p className="text-lg font-bold text-slate-900 mt-1 truncate max-w-[140px]">{activeSemester}</p>
            <span className="text-xs text-slate-500 mt-0.5 inline-block">Tahun Akademik</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Bagian Perhatian Khusus: Daftar Jadwal Bentrok */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-slate-900">Perhatian: Jadwal Bentrok Khusus ({bentrokList.length})</h2>
          </div>
          <Link to="/jadwal" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Lihat Semua Tabel <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <span className="text-xs">Memuat data bentrok...</span>
          </div>
        ) : bentrokList.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada konflik jadwal!</p>
            <p className="text-xs text-slate-400 mt-0.5">Semua alokasi waktu dan ruangan teratur dengan baik.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bentrokList.slice(0, 5).map((item) => {
              const itemId = item.id || item.jadwal_id || 0;
              const details = getBentrokDetails(item, scheduleList);

              return (
                <div key={itemId} className="p-4 hover:bg-red-50/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                      <BookOpen className="w-4 h-4 text-red-600" />
                      {getMkName(item)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.hari}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.jam_mulai} - {item.jam_selesai}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> {getRuangName(item)}
                      </span>
                    </div>
                  </div>

                  {details && details.length > 0 && (
                    <div className="text-xs bg-red-100/80 border border-red-200 text-red-700 p-2.5 rounded-xl max-w-md">
                      <span className="font-bold block text-red-800">Bertabrakan dengan:</span>
                      {details.map((b, idx) => (
                        <div key={idx} className="leading-tight mt-0.5">
                          • {b.mk} ({b.ruang}) - ⏱ {b.jam}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Akses Pintas (Quick Shortcuts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/jadwal"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mt-4 group-hover:text-indigo-600 transition">Kelola Jadwal</h3>
          <p className="text-xs text-slate-500 mt-1">Tambah, ubah, atau atur alokasi jam dan ruangan perkuliahan.</p>
        </Link>

        <Link
          to="/master-semester"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition group"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit group-hover:bg-amber-600 group-hover:text-white transition">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mt-4 group-hover:text-amber-600 transition">Master Semester</h3>
          <p className="text-xs text-slate-500 mt-1">Atur semester aktif dan format otomatis tahun akademik.</p>
        </Link>

        <Link
          to="/"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition">Lihat Tampilan Publik</h3>
          <p className="text-xs text-slate-500 mt-1">Cek tampilan jadwal kuliah sebagaimana yang dilihat oleh mahasiswa.</p>
        </Link>
      </div>
    </div>
  );
};