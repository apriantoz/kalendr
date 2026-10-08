// src/pages/DashboardPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';

import {
  getBentrokDetails,
  type ScheduleItem,
} from '@/utils/scheduleHelpers';

import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Layers,
  MapPin,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

// Sub-components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { DistributionChart } from '@/components/dashboard/DistributionChart';
import { ConflictResolver } from '@/components/dashboard/ConflictResolver';
import { ConflictDialog } from '@/components/dashboard/ConflictDialog';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActiveSemesterCard } from '@/components/dashboard/ActiveSemesterCard';

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
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([]);
  const [totalMk, setTotalMk] = useState(0);
  const [totalRuang, setTotalRuang] = useState(0);
  const [activeSemester, setActiveSemester] =
    useState('Memuat...');
  const [error, setError] = useState('');

  /**
   * Jadwal bentrok yang sedang dipilih
   * untuk ditampilkan di dialog.
   */
  const [selectedConflict, setSelectedConflict] =
    useState<ScheduleItem | null>(null);

  /**
   * =========================================================
   * FETCH DASHBOARD DATA
   * =========================================================
   */
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
        supabase
          .from('view_jadwal_detail')
          .select('*'),

        supabase
          .from('mk')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('ruang')
          .select('*', {
            count: 'exact',
            head: true,
          }),

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

      /**
       * view_jadwal_detail menggunakan jadwal_id.
       * Normalisasi menjadi id agar helper konsisten.
       */
      const formattedJadwal: ScheduleItem[] = (
        jadwalData || []
      ).map((item: any) => ({
        ...item,
        id: item.jadwal_id ?? item.id,
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
      console.error(
        'Error fetching dashboard stats:',
        err
      );

      setError(
        'Data dashboard gagal dimuat. Silakan coba refresh.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * =========================================================
   * DETEKSI SEMUA JADWAL BENTROK
   * =========================================================
   */
  const bentrokList = useMemo(() => {
    return scheduleList.filter((item) => {
      const details = getBentrokDetails(
        item,
        scheduleList
      );

      return Boolean(
        details && details.length > 0
      );
    });
  }, [scheduleList]);

  /**
   * =========================================================
   * DISTRIBUSI JADWAL PER HARI
   * =========================================================
   */
  const scheduleByDay = useMemo(() => {
    const counts: Record<string, number> = {};

    DAY_ORDER.forEach((day) => {
      counts[day] = 0;
    });

    scheduleList.forEach((item) => {
      const normalizedDay =
        item.hari?.trim();

      if (
        normalizedDay &&
        counts[normalizedDay] !== undefined
      ) {
        counts[normalizedDay] += 1;
      }
    });

    return counts;
  }, [scheduleList]);

  const maxDayCount = Math.max(
    ...Object.values(scheduleByDay),
    1
  );

  const safeScheduleCount = Math.max(
    scheduleList.length -
      bentrokList.length,
    0
  );

  /**
   * =========================================================
   * NAMA ADMIN
   * =========================================================
   */
  const firstName =
    user?.user_metadata?.full_name?.split(
      ' '
    )[0] ||
    user?.email?.split('@')[0] ||
    'Admin';

  /**
   * =========================================================
   * OPEN / CLOSE CONFLICT DIALOG
   * =========================================================
   */
  const openConflictDialog = (
    item: ScheduleItem
  ) => {
    setSelectedConflict(item);
  };

  const closeConflictDialog = () => {
    setSelectedConflict(null);
  };

  /**
   * Buka jadwal yang dipilih langsung di form Edit
   * pada halaman Kelola Jadwal.
   */
  const editScheduleFromDashboard = (
    item: ScheduleItem
  ) => {
    const id = item.id ?? item.jadwal_id;

    if (!id) return;

    setSelectedConflict(null);
    navigate(`/kelola-jadwal?edit=${id}`);
  };

  /**
   * Semua jadwal yang bentrok dengan jadwal
   * yang sedang dipilih.
   */
  const selectedConflictDetails =
    selectedConflict
      ? getBentrokDetails(
          selectedConflict,
          scheduleList
        ) || []
      : [];

  return (
    <div className="min-h-full bg-slate-50/60">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <DashboardHeader
          firstName={firstName}
          loading={loading}
          onRefresh={fetchDashboardData}
        />

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* MAIN STATISTICS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Jadwal"
            value={loading ? '—' : scheduleList.length}
            description="Sesi perkuliahan terdaftar"
            icon={Calendar}
          />

          <StatCard
            title="Jadwal Bentrok"
            value={loading ? '—' : bentrokList.length}
            description={bentrokList.length > 0 ? 'Perlu diperiksa' : 'Semua jadwal aman'}
            icon={bentrokList.length > 0 ? AlertTriangle : CheckCircle2}
            colorClass={bentrokList.length > 0 ? 'text-red-600' : 'text-emerald-600'}
            bgColorClass={bentrokList.length > 0 ? 'bg-red-50' : 'bg-emerald-50'}
            borderColorClass={bentrokList.length > 0 ? 'border-red-200' : 'border-slate-200/80'}
            valueColorClass={bentrokList.length > 0 ? 'text-red-600' : 'text-emerald-600'}
          />

          <StatCard
            title="Mata Kuliah"
            value={loading ? '—' : totalMk}
            description="Data master mata kuliah"
            icon={BookOpen}
            colorClass="text-blue-600"
            bgColorClass="bg-blue-50"
          />

          <StatCard
            title="Ruangan"
            value={loading ? '—' : totalRuang}
            description="Ruangan tersedia di master data"
            icon={MapPin}
            colorClass="text-amber-600"
            bgColorClass="bg-amber-50"
          />
        </section>

        {/* OVERVIEW */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_0.8fr]">
          <DistributionChart
            scheduleByDay={scheduleByDay}
            dayOrder={DAY_ORDER}
            dayShort={DAY_SHORT}
            maxDayCount={maxDayCount}
            loading={loading}
            safeScheduleCount={safeScheduleCount}
          />

        <ActiveSemesterCard activeSemester={activeSemester} />
      </section>

      <ConflictResolver

          loading={loading}
          bentrokList={bentrokList}
          scheduleList={scheduleList}
          onOpenDialog={openConflictDialog}
        />

        <QuickActions />
      </div>

      {selectedConflict && (
        <ConflictDialog
          selectedConflict={selectedConflict}
          conflictDetails={selectedConflictDetails}
          onClose={closeConflictDialog}
          onEdit={editScheduleFromDashboard}
        />
      )}
    </div>
  );
};