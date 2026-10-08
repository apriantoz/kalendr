// src/pages/JadwalTable.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  FileText,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';

export interface JadwalItem extends ScheduleItem {
  kode_mk?: string;
  nama_prodi?: string;
  tahun_ajaran?: string;
  tipe_semester?: string;
  catatan?: string;
  created_at?: string;
}

interface DropdownOption {
  id: number;
  nama: string;
}

type ViewMode = 'jadwal' | 'ruang';

const DAYS = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

const dayIndex: Record<string, number> = Object.fromEntries(
  DAYS.map((d, i) => [d, i])
);

export const JadwalTable: React.FC = () => {
  const { isAdmin } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const editIdParam = searchParams.get('edit');

  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [mkOptions, setMkOptions] = useState<DropdownOption[]>([]);
  const [ruangOptions, setRuangOptions] = useState<DropdownOption[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<DropdownOption[]>(
    []
  );

  const [activeSemesterId, setActiveSemesterId] = useState<number | null>(
    null
  );
  const [activeSemesterName, setActiveSemesterName] =
    useState('Semester aktif');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState('Semua Hari');
  const [roomFilter, setRoomFilter] = useState('Semua Ruang');

  const [viewMode, setViewMode] = useState<ViewMode>('jadwal');
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Conflict dialog
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedConflictItem, setSelectedConflictItem] =
    useState<JadwalItem | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [mkSearch, setMkSearch] = useState('');
  const [mkOpen, setMkOpen] = useState(false);

  const [formData, setFormData] = useState({
    mk_id: '',
    ruang_id: '',
    master_semester_id: '',
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '10:00',
    catatan: '',
  });

  const fetchMasterData = async () => {
    const [mkRes, roomRes, semRes] = await Promise.all([
      supabase.from('mk').select('*'),
      supabase.from('ruang').select('*'),
      supabase.from('master_semester').select('*'),
    ]);

    if (mkRes.error) throw mkRes.error;
    if (roomRes.error) throw roomRes.error;
    if (semRes.error) throw semRes.error;

    setMkOptions(
      (mkRes.data || []).map((x: any) => ({
        id: x.id,
        nama: x.nama_mk || x.nama || `MK ID ${x.id}`,
      }))
    );

    setRuangOptions(
      (roomRes.data || []).map((x: any) => ({
        id: x.id,
        nama: x.nama_ruang || x.nama || `Ruang ID ${x.id}`,
      }))
    );

    const semesters = semRes.data || [];

    setSemesterOptions(
      semesters.map((x: any) => ({
        id: x.id,
        nama:
          x.nama_semester ||
          x.semester ||
          x.nama ||
          [x.tahun_ajaran, x.tipe_semester]
            .filter(Boolean)
            .join(' ') ||
          `Semester ID ${x.id}`,
      }))
    );

    const active = semesters.find(
      (x: any) =>
        x.is_active === true ||
        x.aktif === true ||
        x.status === 'aktif'
    );

    const fallback = active || semesters[0];

    if (fallback) {
      setActiveSemesterId(fallback.id);

      setActiveSemesterName(
        fallback.nama_semester ||
          fallback.semester ||
          fallback.nama ||
          [fallback.tahun_ajaran, fallback.tipe_semester]
            .filter(Boolean)
            .join(' ') ||
          `Semester #${fallback.id}`
      );
    }
  };

  const fetchJadwal = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: qError } = await supabase
        .from('view_jadwal_detail')
        .select('*');

      if (qError) throw qError;

      setJadwalList(
        (data || []).map((x: any) => ({
          ...x,
          id: x.jadwal_id || x.id,
        }))
      );
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Gagal mengambil data jadwal.');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setError(null);

    try {
      await Promise.all([fetchJadwal(), fetchMasterData()]);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data.');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const getSemesterName = (item: JadwalItem) =>
    item.tahun_ajaran && item.tipe_semester
      ? `${item.tahun_ajaran} (${item.tipe_semester})`
      : item.master_semester_id
      ? `Semester #${item.master_semester_id}`
      : '-';

  const isConflict = (item: JadwalItem) => {
    const details = getBentrokDetails(item, jadwalList);

    return Boolean(item.is_bentrok || (details && details.length));
  };

  /**
   * Buka dialog detail semua jadwal yang bentrok
   */
  const openConflictDetails = (item: JadwalItem) => {
    setSelectedConflictItem(item);
    setShowConflictModal(true);
  };

  /**
   * Edit jadwal dari dialog bentrok.
   * Dialog bentrok ditutup terlebih dahulu agar tidak ada
   * dua modal bertumpuk.
   */
  const editConflictSchedule = (item: JadwalItem) => {
    setShowConflictModal(false);

    window.setTimeout(() => {
      openEdit(item);
    }, 80);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return jadwalList
      .filter((item) => {
        const text = [
          getMkName(item),
          getRuangName(item),
          item.kode_mk || '',
          item.nama_prodi || '',
          item.hari || '',
          getSemesterName(item),
          item.catatan || '',
        ]
          .join(' ')
          .toLowerCase();

        const matchesSearch = !q || text.includes(q);

        const matchesDay =
          dayFilter === 'Semua Hari' || item.hari === dayFilter;

        const matchesRoom =
          roomFilter === 'Semua Ruang' ||
          String(item.ruang_id) === roomFilter;

        return matchesSearch && matchesDay && matchesRoom;
      })
      .sort((a, b) => {
        const day =
          (dayIndex[a.hari || ''] ?? 9) -
          (dayIndex[b.hari || ''] ?? 9);

        return (
          day ||
          String(a.jam_mulai || '').localeCompare(
            String(b.jam_mulai || '')
          )
        );
      });
  }, [jadwalList, search, dayFilter, roomFilter]);

  const groupedByDay = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        items: filtered.filter((x) => x.hari === day),
      })).filter((g) => g.items.length),
    [filtered]
  );

  const roomsInUse = useMemo(
    () =>
      new Set(
        jadwalList
          .map((x) => x.ruang_id)
          .filter(Boolean)
      ).size,
    [jadwalList]
  );

  const totalConflict = useMemo(
    () => jadwalList.filter(isConflict).length,
    [jadwalList]
  );

  const roomGroups = useMemo(() => {
    const rooms =
      roomFilter !== 'Semua Ruang'
        ? ruangOptions.filter(
            (x) => String(x.id) === roomFilter
          )
        : ruangOptions;

    return rooms
      .map((room) => ({
        room,
        items: filtered.filter(
          (x) => Number(x.ruang_id) === room.id
        ),
      }))
      .filter((x) => x.items.length);
  }, [ruangOptions, filtered, roomFilter]);

  const openAdd = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormError('');
    setMkSearch('');
    setMkOpen(false);

    setFormData({
      mk_id: mkOptions[0]?.id
        ? String(mkOptions[0].id)
        : '',

      ruang_id:
        roomFilter !== 'Semua Ruang'
          ? roomFilter
          : ruangOptions[0]?.id
          ? String(ruangOptions[0].id)
          : '',

      master_semester_id: activeSemesterId
        ? String(activeSemesterId)
        : semesterOptions[0]?.id
        ? String(semesterOptions[0].id)
        : '',

      hari:
        dayFilter !== 'Semua Hari'
          ? dayFilter
          : 'Senin',

      jam_mulai: '08:00',
      jam_selesai: '10:00',
      catatan: '',
    });

    setShowModal(true);
  };

  const openEdit = (item: JadwalItem) => {
    const id = item.id || item.jadwal_id;

    if (!id) return;

    setIsEditing(true);
    setSelectedId(id);
    setFormError('');
    setMkSearch(getMkName(item));
    setMkOpen(false);

    setFormData({
      mk_id: String(item.mk_id ?? ''),
      ruang_id: String(item.ruang_id ?? ''),
      master_semester_id: String(
        item.master_semester_id ?? ''
      ),
      hari: item.hari || 'Senin',
      jam_mulai: item.jam_mulai || '08:00',
      jam_selesai: item.jam_selesai || '10:00',
      catatan: item.catatan || '',
    });

    setShowModal(true);
  };

  // Auto-open form Edit Jadwal ketika halaman dibuka
  // melalui /kelola-jadwal?edit=ID dari Dashboard.
  useEffect(() => {
    if (!editIdParam || !jadwalList.length) {
      return;
    }

    const editId = Number(editIdParam);

    if (!Number.isFinite(editId)) {
      setSearchParams({}, { replace: true });
      return;
    }

    const item = jadwalList.find(
      (x) => Number(x.id ?? x.jadwal_id) === editId
    );

    if (!item) {
      setSearchParams({}, { replace: true });
      return;
    }

    openEdit(item);
    setSearchParams({}, { replace: true });
  }, [jadwalList, editIdParam]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError('');

    if (
      !formData.mk_id ||
      !formData.ruang_id ||
      !formData.master_semester_id
    ) {
      return setFormError(
        'Mata kuliah, ruangan, dan semester wajib dipilih.'
      );
    }

    if (
      formData.jam_selesai <=
      formData.jam_mulai
    ) {
      return setFormError(
        'Jam selesai harus lebih besar dari jam mulai.'
      );
    }

    setSubmitting(true);

    const payload = {
      mk_id: Number(formData.mk_id),
      ruang_id: Number(formData.ruang_id),
      master_semester_id: Number(
        formData.master_semester_id
      ),
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

      await fetchJadwal();
    } catch (e: any) {
      setFormError(
        e.message || 'Gagal menyimpan jadwal.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    if (
      !window.confirm(
        'Apakah Anda yakin ingin menghapus jadwal ini?'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jadwal')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchJadwal();
    } catch (e: any) {
      alert(
        'Gagal menghapus data: ' + e.message
      );
    }
  };

  const selectedMk = mkOptions.find(
    (x) => String(x.id) === formData.mk_id
  );

  const filteredMkOptions = mkOptions.filter((x) =>
    x.nama
      .toLowerCase()
      .includes(mkSearch.toLowerCase())
  );

  const input =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

  const ScheduleRow = ({
    item,
  }: {
    item: JadwalItem;
  }) => {
    // const conflict = isConflict(item);

    // const details =
    //   getBentrokDetails(item, jadwalList) || [];

    // const conflictItems =
    //   details as unknown as JadwalItem[];

    // const firstConflict =
    //   conflictItems[0] || null;
    const conflict = isConflict(item);

const conflictItems =
  getBentrokDetails(item, jadwalList) || [];

const firstConflict =
  conflictItems[0] || null;

    const id =
      item.id || item.jadwal_id || 0;

    return (
      <div
        className={`group relative border-b border-slate-100 px-4 py-3.5 transition last:border-b-0 sm:px-5 ${
          conflict
            ? 'bg-red-50/45 hover:bg-red-50'
            : 'hover:bg-slate-50/80'
        }`}
      >
        <div className="grid grid-cols-[72px_1fr_auto] items-center gap-3 sm:grid-cols-[110px_1fr_250px_auto] sm:gap-4">

          {/* TIME */}
          <div className="self-start pt-0.5">
            <div
              className={`text-xs font-bold ${
                conflict
                  ? 'text-red-600'
                  : 'text-slate-700'
              }`}
            >
              {item.jam_mulai || '--:--'}
            </div>

            <div className="mt-0.5 text-[11px] text-slate-400">
              {item.jam_selesai || '--:--'}
            </div>
          </div>

          {/* MAIN INFO */}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  conflict
                    ? 'bg-red-100 text-red-600'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {getMkName(item)}
                </p>

                <p className="truncate text-[10px] font-medium text-slate-400">
                  {item.nama_prodi ||
                    'Prodi belum tersedia'}

                  {item.kode_mk &&
                    ` • ${item.kode_mk}`}
                </p>
              </div>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-9 text-[11px] text-slate-500">

              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                {getRuangName(item)}
              </span>

              <span className="hidden sm:inline">
                {getSemesterName(item)}
              </span>

              {item.catatan && (
                <span className="hidden max-w-[240px] truncate md:inline-flex md:items-center md:gap-1">
                  <FileText className="h-3 w-3 text-slate-300" />
                  {item.catatan}
                </span>
              )}
            </div>
          </div>

          {/* CONFLICT STATUS */}
          <div className="hidden sm:block">
            {conflict ? (
              <button
                type="button"
                onClick={() =>
                  openConflictDetails(item)
                }
                className="group/conflict w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-left transition hover:border-red-300 hover:bg-red-100 hover:shadow-sm"
                title="Klik untuk melihat seluruh jadwal yang bentrok"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-red-700">
                        Bentrok dengan
                      </span>

                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-red-400 transition group-hover/conflict:translate-x-0.5" />
                    </div>

                    {firstConflict ? (
                      <>
                        <p className="mt-0.5 truncate text-[11px] font-bold text-red-700">
                          {firstConflict.nama_prodi ||
                            'Prodi belum tersedia'}
                        </p>

                        <p className="truncate text-[10px] font-medium text-red-600">
                          {getMkName(firstConflict)}
                        </p>

                        {conflictItems.length > 1 && (
                          <p className="mt-0.5 text-[9px] font-semibold text-red-500">
                            +{conflictItems.length - 1}{' '}
                            jadwal lainnya
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-0.5 text-[10px] font-medium text-red-500">
                        Klik untuk melihat detail bentrok
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Aman
              </span>
            )}
          </div>

          {/* ACTIONS */}
          {isAdmin && (
            <div className="flex items-center justify-end gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => openEdit(item)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50"
                title="Edit"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => remove(id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                title="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* MOBILE CONFLICT */}
        {conflict && (
          <div className="mt-2 sm:hidden">
            <button
              type="button"
              onClick={() =>
                openConflictDetails(item)
              }
              className="flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-left transition hover:bg-red-100"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-extrabold uppercase tracking-wide text-red-600">
                  Bentrok dengan
                </p>

                {firstConflict ? (
                  <>
                    <p className="truncate text-[10px] font-bold text-red-700">
                      {firstConflict.nama_prodi ||
                        'Prodi belum tersedia'}
                      {' • '}
                      {getMkName(firstConflict)}
                    </p>

                    {conflictItems.length > 1 && (
                      <p className="text-[9px] font-medium text-red-500">
                        +{conflictItems.length - 1}{' '}
                        jadwal lainnya
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[10px] text-red-500">
                    Klik untuk melihat detail
                  </p>
                )}
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-red-400" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <CalendarDays className="h-4 w-4" />
              </span>

              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Schedule Workspace
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Kelola Jadwal
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Atur jadwal dengan cepat tanpa harus
              berhadapan dengan tabel yang terlalu padat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? 'animate-spin' : ''
                }`}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Jadwal
              </button>
            )}
          </div>
        </header>

        {/* TOOLBAR */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center">

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari mata kuliah, prodi, kode, ruang, atau catatan..."
              className={`${input} pl-9`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <select
              value={dayFilter}
              onChange={(e) =>
                setDayFilter(e.target.value)
              }
              className={`${input} min-w-0 sm:w-36`}
            >
              <option>Semua Hari</option>

              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <select
              value={roomFilter}
              onChange={(e) => {
                setRoomFilter(e.target.value);

                setSelectedRoom(
                  e.target.value === 'Semua Ruang'
                    ? null
                    : Number(e.target.value)
                );
              }}
              className={`${input} min-w-0 sm:w-44`}
            >
              <option>Semua Ruang</option>

              {ruangOptions.map((r) => (
                <option
                  key={r.id}
                  value={r.id}
                >
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode('jadwal')}
              className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                viewMode === 'jadwal'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Jadwal
            </button>

            <button
              type="button"
              onClick={() => setViewMode('ruang')}
              className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                viewMode === 'ruang'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Ruang
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <p className="text-[11px] font-medium text-slate-400">
              Semester aktif
            </p>

            <p className="mt-1 truncate text-sm font-bold text-slate-800">
              {activeSemesterName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <p className="text-[11px] font-medium text-slate-400">
              Jadwal tampil
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {filtered.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <p className="text-[11px] font-medium text-slate-400">
              Ruangan terpakai
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {roomsInUse}
            </p>
          </div>

          <div
            className={`rounded-2xl border bg-white p-3.5 shadow-sm ${
              totalConflict
                ? 'border-red-200'
                : 'border-slate-200'
            }`}
          >
            <p className="text-[11px] font-medium text-slate-400">
              Bentrok
            </p>

            <p
              className={`mt-1 text-xl font-bold ${
                totalConflict
                  ? 'text-red-600'
                  : 'text-slate-900'
              }`}
            >
              {totalConflict}
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">
                Gagal memuat data
              </p>

              <p className="mt-0.5 text-xs">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* MAIN WORKSPACE */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {viewMode === 'jadwal'
                  ? 'Jadwal Per Hari'
                  : 'Pemakaian Ruangan'}
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {viewMode === 'jadwal'
                  ? 'Urutan waktu otomatis dari pagi hingga sore.'
                  : 'Lihat kapan setiap ruangan digunakan.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <Clock className="h-3.5 w-3.5" />

              {filtered.length} jadwal · {roomsInUse}{' '}
              ruangan
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Memuat jadwal...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            /* EMPTY */
            <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CalendarDays className="h-7 w-7" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Tidak ada jadwal ditemukan
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Coba ubah pencarian atau filter. Jika
                belum ada jadwal, tambahkan jadwal baru.
              </p>

              {isAdmin &&
                !search &&
                dayFilter === 'Semua Hari' &&
                roomFilter === 'Semua Ruang' && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Jadwal
                  </button>
                )}
            </div>
          ) : viewMode === 'jadwal' ? (
            /* JADWAL VIEW */
            <div>
              {groupedByDay.map((group) => (
                <div
                  key={group.day}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 px-4 py-2.5 backdrop-blur sm:px-5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />

                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {group.day}
                      </span>
                    </div>

                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
                      {group.items.length} jadwal
                    </span>
                  </div>

                  {group.items.map((item) => (
                    <ScheduleRow
                      key={item.id || item.jadwal_id}
                      item={item}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            /* RUANG VIEW */
            <div>
              {roomGroups.map(({ room, items }) => (
                <div
                  key={room.id}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <div className="flex items-center justify-between bg-slate-50/95 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <MapPin className="h-4 w-4" />
                      </span>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {room.nama}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          {items.length} jadwal penggunaan
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRoomFilter(
                          String(room.id)
                        );
                        setSelectedRoom(room.id);
                      }}
                      className="hidden rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-indigo-600 sm:block"
                    >
                      Fokus ruang
                    </button>
                  </div>

                  {DAYS.map((day) => {
                    const dayItems = items.filter(
                      (x) => x.hari === day
                    );

                    return dayItems.length ? (
                      <div key={day}>
                        <div className="px-4 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:px-5">
                          {day}
                        </div>

                        {dayItems.map((item) => (
                          <ScheduleRow
                            key={
                              item.id ||
                              item.jadwal_id
                            }
                            item={item}
                          />
                        ))}
                      </div>
                    ) : null;
                  })}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ========================================================= */}
      {/* CONFLICT DETAIL MODAL                                     */}
      {/* ========================================================= */}
      {showConflictModal && selectedConflictItem && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowConflictModal(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-red-200 bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex items-start justify-between border-b border-red-100 bg-red-50/70 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-red-800">
                    Detail Jadwal Bentrok
                  </h2>

                  <p className="mt-0.5 text-xs text-red-500">
                    Jadwal berikut menggunakan ruangan
                    dan waktu yang saling bertabrakan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowConflictModal(false)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-400 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto">

              {/* SELECTED SCHEDULE */}
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Jadwal yang dipilih
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <BookOpen className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {getMkName(
                          selectedConflictItem
                        )}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                        {selectedConflictItem.nama_prodi ||
                          'Prodi belum tersedia'}

                        {selectedConflictItem.kode_mk &&
                          ` • ${selectedConflictItem.kode_mk}`}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedConflictItem.jam_mulai ||
                            '--:--'}{' '}
                          -{' '}
                          {selectedConflictItem.jam_selesai ||
                            '--:--'}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {getRuangName(
                            selectedConflictItem
                          )}
                        </span>

                        <span>
                          {selectedConflictItem.hari ||
                            '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONFLICT LIST */}
              <div className="px-5 py-4 sm:px-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Bentrok dengan
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Seluruh jadwal yang terdeteksi
                      bentrok dengan jadwal ini.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
                    {
                      (
                        getBentrokDetails(
                          selectedConflictItem,
                          jadwalList
                        ) || []
                      ).length
                    }{' '}
                    jadwal
                  </span>
                </div>

                {(
                  getBentrokDetails(
                    selectedConflictItem,
                    jadwalList
                  ) || []
                ).length > 0 ? (
                  <div className="space-y-2.5">
                    {(
                      getBentrokDetails(
                        selectedConflictItem,
                        jadwalList
                      ) || []
                    ).map((rawItem, index) => {
                      const conflictItem =
                        rawItem as unknown as JadwalItem;

                      const conflictId =
                        conflictItem.id ||
                        conflictItem.jadwal_id ||
                        index;

                      return (
                        <div
                          key={conflictId}
                          className="rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-red-200 hover:bg-red-50/30"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-800">
                                    {getMkName(
                                      conflictItem
                                    )}
                                  </p>

                                  <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                                    {conflictItem.nama_prodi ||
                                      'Prodi belum tersedia'}

                                    {conflictItem.kode_mk &&
                                      ` • ${conflictItem.kode_mk}`}
                                  </p>
                                </div>

                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      editConflictSchedule(
                                        conflictItem
                                      )
                                    }
                                    className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 text-[10px] font-bold text-indigo-600 transition hover:bg-indigo-100"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </button>
                                )}
                              </div>

                              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                                <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                    Hari & Waktu
                                  </p>

                                  <p className="mt-0.5 text-[10px] font-semibold text-slate-700">
                                    {conflictItem.hari ||
                                      '-'}{' '}
                                    ·{' '}
                                    {conflictItem.jam_mulai ||
                                      '--:--'}{' '}
                                    -{' '}
                                    {conflictItem.jam_selesai ||
                                      '--:--'}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                    Ruangan
                                  </p>

                                  <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-700">
                                    {getRuangName(
                                      conflictItem
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                    Semester
                                  </p>

                                  <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-700">
                                    {getSemesterName(
                                      conflictItem
                                    )}
                                  </p>
                                </div>

                                {conflictItem.catatan && (
                                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                                      Catatan
                                    </p>

                                    <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-700">
                                      {
                                        conflictItem.catatan
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <AlertTriangle className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      Detail bentrok tidak ditemukan
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Status bentrok tersedia dari database,
                      tetapi detail jadwal terkait tidak
                      dikembalikan oleh helper.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setShowConflictModal(false)
                }
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT MODAL                                          */}
      {/* ========================================================= */}
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

            {/* MODAL HEADER */}
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

                  <p className="text-xs text-slate-400">
                    Atur mata kuliah, ruang, waktu,
                    dan semester.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">

                {formError && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* AKADEMIK */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-slate-800">
                    Informasi Akademik
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Pilih mata kuliah, ruangan, dan semester.
                  </p>
                </div>

                {/* MK SEARCH */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Mata Kuliah
                  </label>

                  <div className="relative">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        required
                        value={
                          mkOpen
                            ? mkSearch
                            : selectedMk?.nama || ''
                        }
                        onFocus={() => {
                          setMkOpen(true);
                          setMkSearch(
                            selectedMk?.nama || ''
                          );
                        }}
                        onChange={(e) => {
                          setMkSearch(
                            e.target.value
                          );
                          setMkOpen(true);
                        }}
                        placeholder="Cari mata kuliah..."
                        className={`${input} pl-9 pr-9`}
                      />

                      <ChevronDown
                        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition ${
                          mkOpen
                            ? 'rotate-180'
                            : ''
                        }`}
                      />
                    </div>

                    {mkOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onMouseDown={() =>
                            setMkOpen(false)
                          }
                        />

                        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                          {filteredMkOptions.length ? (
                            filteredMkOptions.map(
                              (opt) => (
                                <button
                                  type="button"
                                  key={opt.id}
                                  onMouseDown={(e) =>
                                    e.preventDefault()
                                  }
                                  onClick={() => {
                                    setFormData(
                                      (f) => ({
                                        ...f,
                                        mk_id:
                                          String(
                                            opt.id
                                          ),
                                      })
                                    );

                                    setMkSearch(
                                      opt.nama
                                    );

                                    setMkOpen(false);
                                  }}
                                  className={`w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-indigo-50 ${
                                    String(opt.id) ===
                                    formData.mk_id
                                      ? 'bg-indigo-50 font-semibold text-indigo-700'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {opt.nama}
                                </button>
                              )
                            )
                          ) : (
                            <div className="px-3 py-4 text-center text-xs text-slate-400">
                              Mata kuliah tidak
                              ditemukan.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ROOM + SEMESTER */}
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Ruangan
                    </label>

                    <select
                      required
                      value={formData.ruang_id}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          ruang_id:
                            e.target.value,
                        }))
                      }
                      className={input}
                    >
                      <option
                        value=""
                        disabled
                      >
                        -- Pilih Ruang --
                      </option>

                      {ruangOptions.map((x) => (
                        <option
                          key={x.id}
                          value={x.id}
                        >
                          {x.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Semester
                    </label>

                    <select
                      required
                      value={
                        formData.master_semester_id
                      }
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          master_semester_id:
                            e.target.value,
                        }))
                      }
                      className={input}
                    >
                      <option
                        value=""
                        disabled
                      >
                        -- Pilih Semester --
                      </option>

                      {semesterOptions.map(
                        (x) => (
                          <option
                            key={x.id}
                            value={x.id}
                          >
                            {x.nama}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* TIME */}
                <div className="mb-5 border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-slate-800">
                    Waktu Perkuliahan
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Tentukan hari dan rentang waktu.
                  </p>
                </div>

                <div className="mb-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Hari
                    </label>

                    <select
                      value={formData.hari}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          hari: e.target.value,
                        }))
                      }
                      className={input}
                    >
                      {DAYS.map((d) => (
                        <option key={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Jam Mulai
                    </label>

                    <input
                      required
                      type="time"
                      value={formData.jam_mulai}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          jam_mulai:
                            e.target.value,
                        }))
                      }
                      className={input}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Jam Selesai
                    </label>

                    <input
                      required
                      type="time"
                      value={formData.jam_selesai}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          jam_selesai:
                            e.target.value,
                        }))
                      }
                      className={input}
                    />
                  </div>
                </div>

                {/* NOTES */}
                <div className="border-t border-slate-100 pt-5">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Catatan{' '}
                    <span className="font-normal text-slate-400">
                      (opsional)
                    </span>
                  </label>

                  <textarea
                    rows={3}
                    value={formData.catatan}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        catatan:
                          e.target.value,
                      }))
                    }
                    placeholder="Tambahkan informasi tambahan..."
                    className={`${input} resize-none`}
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
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