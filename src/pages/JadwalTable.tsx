// src/pages/JadwalTable.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  getBentrokDetails,
  getMkName,
  getRuangName,
  type ScheduleItem
} from '@/utils/scheduleHelpers';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  X,
  Save,
  FileText,
} from 'lucide-react';

export interface JadwalItem extends ScheduleItem {
  kode_mk?: string;
  tahun_ajaran?: string;
  tipe_semester?: string;
  catatan?: string;
  created_at?: string;
}

interface DropdownOption {
  id: number;
  nama: string;
}

type SortField = 'mk' | 'hari' | 'jam_mulai' | 'ruang' | 'semester';
type SortOrder = 'asc' | 'desc';

export const JadwalTable: React.FC = () => {
  const { isAdmin } = useAuth();

  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('hari');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Master data
  const [mkOptions, setMkOptions] = useState<DropdownOption[]>([]);
  const [ruangOptions, setRuangOptions] = useState<DropdownOption[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<DropdownOption[]>([]);

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    mk_id: '',
    ruang_id: '',
    master_semester_id: '',
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '10:00',
    catatan: '',
  });

  const [submitting, setSubmitting] = useState<boolean>(false);

  // Helper semester
  const getSemesterName = (item: JadwalItem) => {
    if (item.tahun_ajaran && item.tipe_semester) {
      return `${item.tahun_ajaran} (${item.tipe_semester})`;
    }

    return item.master_semester_id
      ? `Semester #${item.master_semester_id}`
      : '-';
  };

  // Urutan hari
  const hariUrutan: Record<string, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
    Minggu: 7,
  };

  // Fetch master data
  const fetchMasterData = async () => {
    try {
      const [mkRes, ruangRes, semRes] = await Promise.all([
        supabase.from('mk').select('*'),
        supabase.from('ruang').select('*'),
        supabase.from('master_semester').select('*'),
      ]);

      if (mkRes.data) {
        setMkOptions(
          mkRes.data.map((item: any) => ({
            id: item.id,
            nama: item.nama_mk || item.nama || `MK ID ${item.id}`,
          }))
        );
      }

      if (ruangRes.data) {
        setRuangOptions(
          ruangRes.data.map((item: any) => ({
            id: item.id,
            nama: item.nama_ruang || item.nama || `Ruang ID ${item.id}`,
          }))
        );
      }

      if (semRes.data) {
        setSemesterOptions(
          semRes.data.map((item: any) => ({
            id: item.id,
            nama:
              item.nama_semester ||
              item.semester ||
              item.nama ||
              `Semester ID ${item.id}`,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  // Fetch jadwal
  const fetchJadwal = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('view_jadwal_detail')
        .select('*');

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        ...item,
        id: item.jadwal_id || item.id,
      }));

      setJadwalList(formattedData);
    } catch (err: any) {
      console.error('Error fetching jadwal:', err);
      setError(err.message || 'Gagal mengambil data jadwal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
    fetchMasterData();
  }, []);

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedJadwalList = useMemo(() => {
    return [...jadwalList].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'mk') {
        valA = getMkName(a).toLowerCase();
        valB = getMkName(b).toLowerCase();
      } else if (sortField === 'hari') {
        valA = hariUrutan[a.hari || 'Senin'] || 8;
        valB = hariUrutan[b.hari || 'Senin'] || 8;
      } else if (sortField === 'jam_mulai') {
        valA = a.jam_mulai || '00:00';
        valB = b.jam_mulai || '00:00';
      } else if (sortField === 'ruang') {
        valA = getRuangName(a).toLowerCase();
        valB = getRuangName(b).toLowerCase();
      } else if (sortField === 'semester') {
        valA = getSemesterName(a).toLowerCase();
        valB = getSemesterName(b).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;

      return 0;
    });
  }, [jadwalList, sortField, sortOrder]);

  // Tambah
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);

    setFormData({
      mk_id: mkOptions[0]?.id ? String(mkOptions[0].id) : '',
      ruang_id: ruangOptions[0]?.id ? String(ruangOptions[0].id) : '',
      master_semester_id: semesterOptions[0]?.id
        ? String(semesterOptions[0].id)
        : '',
      hari: 'Senin',
      jam_mulai: '08:00',
      jam_selesai: '10:00',
      catatan: '',
    });

    setShowModal(true);
  };

  // Edit
  const handleOpenEditModal = (item: JadwalItem) => {
    setIsEditing(true);

    const itemId = item.id || item.jadwal_id;

    if (!itemId) return;

    setSelectedId(itemId);

    setFormData({
      mk_id: String(item.mk_id),
      ruang_id: String(item.ruang_id),
      master_semester_id: String(item.master_semester_id),
      hari: item.hari || 'Senin',
      jam_mulai: item.jam_mulai || '08:00',
      jam_selesai: item.jam_selesai || '10:00',
      catatan: item.catatan || '',
    });

    setShowModal(true);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      mk_id: Number(formData.mk_id),
      ruang_id: Number(formData.ruang_id),
      master_semester_id: Number(formData.master_semester_id),
      hari: formData.hari,
      jam_mulai: formData.jam_mulai,
      jam_selesai: formData.jam_selesai,
      catatan: formData.catatan || null,
    };

    try {
      if (isEditing && selectedId) {
        const { error } = await supabase
          .from('jadwal')
          .update(payload)
          .eq('id', selectedId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('jadwal')
          .insert([payload]);

        if (error) throw error;
      }

      setShowModal(false);
      fetchJadwal();
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jadwal')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchJadwal();
    } catch (err: any) {
      alert('Gagal menghapus data: ' + err.message);
    }
  };

  // Statistik bentrok
  const totalBentrok = jadwalList.filter((item) => {
    const details = getBentrokDetails(item, jadwalList);

    return item.is_bentrok || (details && details.length > 0);
  }).length;

  const totalAman = Math.max(jadwalList.length - totalBentrok, 0);

  // Sorting icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
      );
    }

    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-indigo-600" />
    );
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

  const labelClass =
    'mb-1.5 block text-xs font-semibold text-slate-600';

  return (
    <div className="min-h-full bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Calendar className="h-4 w-4" />
                </span>

                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Manajemen Akademik
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Kelola Jadwal Perkuliahan
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                Kelola jadwal perkuliahan, ruangan, waktu, semester,
                serta pantau potensi bentrok secara langsung.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchJadwal}
                disabled={loading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh Data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Jadwal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ====================================================== */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Jadwal
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {jadwalList.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Jadwal Aman
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {totalAman}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border bg-white p-4 shadow-sm ${
              totalBentrok > 0
                ? 'border-red-200'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Jadwal Bentrok
                </p>

                <p
                  className={`mt-1 text-2xl font-bold tracking-tight ${
                    totalBentrok > 0
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}
                >
                  {totalBentrok}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  totalBentrok > 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">
                Gagal memuat jadwal
              </p>

              <p className="mt-0.5 text-xs text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            TABLE CARD
        ====================================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Jadwal
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Klik nama kolom untuk mengurutkan data.
              </p>
            </div>

            {totalBentrok > 0 && (
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {totalBentrok} perlu diperiksa
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Memuat data jadwal...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Mohon tunggu sebentar.
              </p>
            </div>
          ) : jadwalList.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Calendar className="h-7 w-7" />
              </div>

              <p className="font-semibold text-slate-800">
                Belum ada jadwal perkuliahan
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                {isAdmin
                  ? 'Klik tombol "Tambah Jadwal" untuk membuat jadwal perkuliahan baru.'
                  : 'Belum ada data jadwal yang tersedia saat ini.'}
              </p>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Jadwal
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">

                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">

                    <th
                      onClick={() => handleSort('mk')}
                      className="group cursor-pointer whitespace-nowrap px-5 py-3.5 transition hover:bg-slate-100"
                    >
                      Mata Kuliah
                      {renderSortIcon('mk')}
                    </th>

                    <th
                      onClick={() => handleSort('hari')}
                      className="group cursor-pointer whitespace-nowrap px-5 py-3.5 transition hover:bg-slate-100"
                    >
                      Hari & Waktu
                      {renderSortIcon('hari')}
                    </th>

                    <th
                      onClick={() => handleSort('ruang')}
                      className="group cursor-pointer whitespace-nowrap px-5 py-3.5 transition hover:bg-slate-100"
                    >
                      Ruang
                      {renderSortIcon('ruang')}
                    </th>

                    <th
                      onClick={() => handleSort('semester')}
                      className="group cursor-pointer whitespace-nowrap px-5 py-3.5 transition hover:bg-slate-100"
                    >
                      Semester
                      {renderSortIcon('semester')}
                    </th>

                    <th className="whitespace-nowrap px-5 py-3.5">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-5 py-3.5">
                      Catatan
                    </th>

                    {isAdmin && (
                      <th className="whitespace-nowrap px-5 py-3.5 text-center">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {sortedJadwalList.map((item) => {
                    const itemId = item.id || item.jadwal_id || 0;

                    const bentrokDetails = getBentrokDetails(
                      item,
                      jadwalList
                    );

                    const isBentrok =
                      item.is_bentrok ||
                      (bentrokDetails &&
                        bentrokDetails.length > 0);

                    return (
                      <tr
                        key={itemId}
                        className={`group transition-colors ${
                          isBentrok
                            ? 'bg-red-50/50 hover:bg-red-50'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >

                        {/* Mata Kuliah */}
                        <td className="px-5 py-4">
                          <div className="flex min-w-[220px] items-start gap-3">

                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                isBentrok
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-indigo-50 text-indigo-600'
                              }`}
                            >
                              <BookOpen className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="font-semibold leading-5 text-slate-800">
                                {getMkName(item)}
                              </p>

                              {item.kode_mk && (
                                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                  {item.kode_mk}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Hari & Waktu */}
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">

                            <div className="flex items-center gap-2">
                              <Calendar
                                className={`h-3.5 w-3.5 ${
                                  isBentrok
                                    ? 'text-red-500'
                                    : 'text-indigo-500'
                                }`}
                              />

                              <span className="text-xs font-semibold text-slate-700">
                                {item.hari}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock
                                className={`h-3.5 w-3.5 ${
                                  isBentrok
                                    ? 'text-red-400'
                                    : 'text-slate-400'
                                }`}
                              />

                              <span className="text-xs text-slate-500">
                                {item.jam_mulai} — {item.jam_selesai}
                              </span>
                            </div>

                          </div>
                        </td>

                        {/* Ruang */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>

                            <span className="text-xs font-medium text-slate-700">
                              {getRuangName(item)}
                            </span>
                          </div>
                        </td>

                        {/* Semester */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700">
                            {getSemesterName(item)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {isBentrok ? (
                            <div className="min-w-[190px]">

                              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                                <AlertTriangle className="h-3 w-3" />
                                Bentrok
                              </span>

                              {bentrokDetails &&
                                bentrokDetails.length > 0 && (
                                  <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-2.5">
                                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-red-800">
                                      Bentrok dengan
                                    </p>

                                    <div className="space-y-1.5">
                                      {bentrokDetails.map(
                                        (b, idx) => (
                                          <div
                                            key={idx}
                                            className="text-[11px] leading-4 text-red-700"
                                          >
                                            <span className="font-semibold">
                                              {b.mk}
                                            </span>

                                            <span className="text-red-500">
                                              {' '}
                                              · {b.ruang}
                                            </span>

                                            <div className="font-medium text-red-600">
                                              {b.jam}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Aman
                            </span>
                          )}
                        </td>

                        {/* Catatan */}
                        <td className="px-5 py-4">
                          <div className="flex max-w-[220px] items-start gap-2">
                            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />

                            <span
                              className="truncate text-xs text-slate-500"
                              title={item.catatan || undefined}
                            >
                              {item.catatan || '-'}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        {isAdmin && (
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEditModal(item)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                                title="Edit jadwal"
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(itemId)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                title="Hapus jadwal"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>
                          </td>
                        )}

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MODAL
      ====================================================== */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {isEditing ? (
                    <Edit className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isEditing
                      ? 'Edit Jadwal'
                      : 'Tambah Jadwal Baru'}
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Lengkapi informasi jadwal perkuliahan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>

              <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">

                {/* Section: Akademik */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Informasi Akademik
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Pilih mata kuliah dan semester yang sesuai.
                    </p>
                  </div>

                  {/* MK */}
                  <div className="mb-4">
                    <label className={labelClass}>
                      Mata Kuliah
                    </label>

                    <select
                      required
                      value={formData.mk_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mk_id: e.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="" disabled>
                        -- Pilih Mata Kuliah --
                      </option>

                      {mkOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ruang & Semester */}
                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <label className={labelClass}>
                        Ruangan
                      </label>

                      <select
                        required
                        value={formData.ruang_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ruang_id: e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        <option value="" disabled>
                          -- Pilih Ruang --
                        </option>

                        {ruangOptions.map((opt) => (
                          <option
                            key={opt.id}
                            value={opt.id}
                          >
                            {opt.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Semester
                      </label>

                      <select
                        required
                        value={formData.master_semester_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            master_semester_id:
                              e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        <option value="" disabled>
                          -- Pilih Semester --
                        </option>

                        {semesterOptions.map((opt) => (
                          <option
                            key={opt.id}
                            value={opt.id}
                          >
                            {opt.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>

                {/* Divider */}
                <div className="mb-6 border-t border-slate-100" />

                {/* Section: Waktu */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Waktu Perkuliahan
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Tentukan hari dan rentang waktu perkuliahan.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">

                    <div>
                      <label className={labelClass}>
                        Hari
                      </label>

                      <select
                        value={formData.hari}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hari: e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        {[
                          'Senin',
                          'Selasa',
                          'Rabu',
                          'Kamis',
                          'Jumat',
                          'Sabtu',
                          'Minggu',
                        ].map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Jam Mulai
                      </label>

                      <input
                        type="time"
                        required
                        value={formData.jam_mulai}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jam_mulai: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Jam Selesai
                      </label>

                      <input
                        type="time"
                        required
                        value={formData.jam_selesai}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jam_selesai: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                  </div>
                </div>

                {/* Divider */}
                <div className="mb-6 border-t border-slate-100" />

                {/* Section: Catatan */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Catatan
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Tambahkan informasi tambahan jika diperlukan.
                    </p>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Contoh: Dosen berhalangan hadir, diganti praktikum..."
                    value={formData.catatan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        catatan: e.target.value,
                      })
                    }
                    className={`${inputClass} resize-none`}
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditing
                        ? 'Simpan Perubahan'
                        : 'Tambah Jadwal'}
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalTable;