// src/pages/JadwalTable.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';

import {
  getBentrokDetails,
  getMkName,
  getRuangName,
  type ScheduleItem,
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
  Search,
  ChevronDown,
  GraduationCap,
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
  kode?: string;
}

interface ActiveSemester {
  id: number;
  tahun_ajaran?: string;
  tipe_semester?: string;
  is_active?: boolean;
}

type SortField =
  | 'mk'
  | 'hari'
  | 'jam_mulai'
  | 'ruang'
  | 'semester';

type SortOrder = 'asc' | 'desc';

export const JadwalTable: React.FC = () => {
  const { isAdmin } = useAuth();

  // =========================================================
  // DATA
  // =========================================================

  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // SORTING
  // =========================================================

  const [sortField, setSortField] =
    useState<SortField>('hari');

  const [sortOrder, setSortOrder] =
    useState<SortOrder>('asc');

  // =========================================================
  // MASTER DATA
  // =========================================================

  const [mkOptions, setMkOptions] =
    useState<DropdownOption[]>([]);

  const [ruangOptions, setRuangOptions] =
    useState<DropdownOption[]>([]);

  const [activeSemester, setActiveSemester] =
    useState<ActiveSemester | null>(null);

  // =========================================================
  // MODAL
  // =========================================================

  const [showModal, setShowModal] =
    useState<boolean>(false);

  const [isEditing, setIsEditing] =
    useState<boolean>(false);

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [submitting, setSubmitting] =
    useState<boolean>(false);

  // =========================================================
  // FORM
  // =========================================================

  const [formData, setFormData] = useState({
    mk_id: '',
    ruang_id: '',
    master_semester_id: '',
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '10:00',
    catatan: '',
  });

  // =========================================================
  // COMBOBOX MATA KULIAH
  // =========================================================

  const [mkSearch, setMkSearch] =
    useState<string>('');

  const [showMkDropdown, setShowMkDropdown] =
    useState<boolean>(false);

  const [mkHighlightIndex, setMkHighlightIndex] =
    useState<number>(0);

  const mkComboboxRef =
    useRef<HTMLDivElement | null>(null);

  // =========================================================
  // HELPERS
  // =========================================================

  const getSemesterName = (item: JadwalItem) => {
    if (
      item.tahun_ajaran &&
      item.tipe_semester
    ) {
      return `${item.tahun_ajaran} (${item.tipe_semester})`;
    }

    return item.master_semester_id
      ? `Semester #${item.master_semester_id}`
      : '-';
  };

  const formatSemester = (
    semester: ActiveSemester | null
  ) => {
    if (!semester) {
      return 'Belum ada semester aktif';
    }

    const tahun = semester.tahun_ajaran || '';
    const tipe = semester.tipe_semester || '';

    if (tahun && tipe) {
      return `${tahun} (${tipe})`;
    }

    return tahun || tipe || `Semester #${semester.id}`;
  };

  const hariUrutan: Record<string, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
    Minggu: 7,
  };

  // =========================================================
  // FILTER COMBOBOX MK
  // =========================================================

  const filteredMkOptions = useMemo(() => {
    const keyword = mkSearch
      .trim()
      .toLowerCase();

    if (!keyword) {
      return mkOptions.slice(0, 50);
    }

    return mkOptions
      .filter((item) => {
        const nama =
          item.nama.toLowerCase();

        const kode =
          item.kode?.toLowerCase() || '';

        return (
          nama.includes(keyword) ||
          kode.includes(keyword)
        );
      })
      .slice(0, 50);
  }, [mkOptions, mkSearch]);

  // =========================================================
  // FETCH MASTER DATA
  // =========================================================

  const fetchMasterData = async () => {
    try {
      const [
        mkRes,
        ruangRes,
        semRes,
      ] = await Promise.all([
        supabase
          .from('mk')
          .select('*'),

        supabase
          .from('ruang')
          .select('*'),

        supabase
          .from('master_semester')
          .select('*')
          .eq('is_active', true)
          .maybeSingle(),
      ]);

      // -----------------------------
      // Mata Kuliah
      // -----------------------------

      if (mkRes.error) {
        console.error(
          'Error fetching MK:',
          mkRes.error
        );
      }

      if (mkRes.data) {
        const mappedMk =
          mkRes.data.map((item: any) => ({
            id: item.id,
            nama:
              item.nama_mk ||
              item.nama ||
              `MK ID ${item.id}`,
            kode:
              item.kode_mk ||
              item.kode ||
              item.kode_matakuliah ||
              '',
          }));

        mappedMk.sort((a, b) =>
          a.nama.localeCompare(
            b.nama,
            'id'
          )
        );

        setMkOptions(mappedMk);
      }

      // -----------------------------
      // Ruangan
      // -----------------------------

      if (ruangRes.error) {
        console.error(
          'Error fetching ruang:',
          ruangRes.error
        );
      }

      if (ruangRes.data) {
        const mappedRuang =
          ruangRes.data.map((item: any) => ({
            id: item.id,
            nama:
              item.nama_ruang ||
              item.nama ||
              `Ruang ID ${item.id}`,
          }));

        mappedRuang.sort((a, b) =>
          a.nama.localeCompare(
            b.nama,
            'id'
          )
        );

        setRuangOptions(mappedRuang);
      }

      // -----------------------------
      // Semester Aktif
      // -----------------------------

      if (semRes.error) {
        console.error(
          'Error fetching semester aktif:',
          semRes.error
        );

        setActiveSemester(null);
      } else {
        setActiveSemester(
          semRes.data || null
        );
      }
    } catch (err) {
      console.error(
        'Error fetching master data:',
        err
      );
    }
  };

  // =========================================================
  // FETCH JADWAL
  // =========================================================

  const fetchJadwal = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data,
        error,
      } = await supabase
        .from('view_jadwal_detail')
        .select('*');

      if (error) {
        throw error;
      }

      const formattedData =
        (data || []).map(
          (item: any) => ({
            ...item,
            id:
              item.jadwal_id ||
              item.id,
          })
        );

      setJadwalList(
        formattedData
      );
    } catch (err: any) {
      console.error(
        'Error fetching jadwal:',
        err
      );

      setError(
        err.message ||
          'Gagal mengambil data jadwal.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchJadwal();
    fetchMasterData();
  }, []);

  // =========================================================
  // CLICK OUTSIDE COMBOBOX
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        mkComboboxRef.current &&
        !mkComboboxRef.current.contains(
          event.target as Node
        )
      ) {
        setShowMkDropdown(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // SORTING
  // =========================================================

  const handleSort = (
    field: SortField
  ) => {
    if (sortField === field) {
      setSortOrder(
        sortOrder === 'asc'
          ? 'desc'
          : 'asc'
      );
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedJadwalList = useMemo(() => {
    return [...jadwalList].sort(
      (a, b) => {
        let valA: any = '';
        let valB: any = '';

        if (sortField === 'mk') {
          valA =
            getMkName(a).toLowerCase();

          valB =
            getMkName(b).toLowerCase();
        }

        if (sortField === 'hari') {
          valA =
            hariUrutan[
              a.hari || 'Senin'
            ] || 8;

          valB =
            hariUrutan[
              b.hari || 'Senin'
            ] || 8;
        }

        if (
          sortField ===
          'jam_mulai'
        ) {
          valA =
            a.jam_mulai ||
            '00:00';

          valB =
            b.jam_mulai ||
            '00:00';
        }

        if (sortField === 'ruang') {
          valA =
            getRuangName(
              a
            ).toLowerCase();

          valB =
            getRuangName(
              b
            ).toLowerCase();
        }

        if (
          sortField ===
          'semester'
        ) {
          valA =
            getSemesterName(
              a
            ).toLowerCase();

          valB =
            getSemesterName(
              b
            ).toLowerCase();
        }

        if (valA < valB) {
          return sortOrder ===
            'asc'
            ? -1
            : 1;
        }

        if (valA > valB) {
          return sortOrder ===
            'asc'
            ? 1
            : -1;
        }

        return 0;
      }
    );
  }, [
    jadwalList,
    sortField,
    sortOrder,
  ]);

  // =========================================================
  // PILIH MATA KULIAH
  // =========================================================

  const handleSelectMk = (
    option: DropdownOption
  ) => {
    setFormData((prev) => ({
      ...prev,
      mk_id: String(option.id),
    }));

    setMkSearch(option.nama);
    setShowMkDropdown(false);
    setMkHighlightIndex(0);
  };

  // =========================================================
  // KEYBOARD COMBOBOX
  // =========================================================

  const handleMkKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!showMkDropdown) {
      if (
        e.key === 'ArrowDown' ||
        e.key === 'Enter'
      ) {
        e.preventDefault();
        setShowMkDropdown(true);
      }

      return;
    }

    if (
      e.key === 'ArrowDown'
    ) {
      e.preventDefault();

      setMkHighlightIndex(
        (prev) =>
          Math.min(
            prev + 1,
            filteredMkOptions.length - 1
          )
      );
    }

    if (
      e.key === 'ArrowUp'
    ) {
      e.preventDefault();

      setMkHighlightIndex(
        (prev) =>
          Math.max(prev - 1, 0)
      );
    }

    if (
      e.key === 'Enter'
    ) {
      e.preventDefault();

      const selected =
        filteredMkOptions[
          mkHighlightIndex
        ];

      if (selected) {
        handleSelectMk(
          selected
        );
      }
    }

    if (
      e.key === 'Escape'
    ) {
      e.preventDefault();
      setShowMkDropdown(false);
    }
  };

  // =========================================================
  // TAMBAH
  // =========================================================

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);

    setMkSearch('');
    setShowMkDropdown(false);
    setMkHighlightIndex(0);

    setFormData({
      mk_id: '',
      ruang_id:
        ruangOptions[0]?.id
          ? String(
              ruangOptions[0].id
            )
          : '',
      master_semester_id:
        activeSemester?.id
          ? String(
              activeSemester.id
            )
          : '',
      hari: 'Senin',
      jam_mulai: '08:00',
      jam_selesai: '10:00',
      catatan: '',
    });

    setShowModal(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleOpenEditModal = (
    item: JadwalItem
  ) => {
    setIsEditing(true);

    const itemId =
      item.id ||
      item.jadwal_id;

    if (!itemId) {
      return;
    }

    setSelectedId(itemId);

    const selectedMk =
      mkOptions.find(
        (mk) =>
          String(mk.id) ===
          String(item.mk_id)
      );

    setMkSearch(
      selectedMk?.nama ||
        getMkName(item) ||
        ''
    );

    setShowMkDropdown(false);
    setMkHighlightIndex(0);

    setFormData({
      mk_id: String(
        item.mk_id
      ),
      ruang_id: String(
        item.ruang_id
      ),
      master_semester_id:
        String(
          item.master_semester_id
        ),
      hari:
        item.hari ||
        'Senin',
      jam_mulai:
        item.jam_mulai ||
        '08:00',
      jam_selesai:
        item.jam_selesai ||
        '10:00',
      catatan:
        item.catatan || '',
    });

    setShowModal(true);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!formData.mk_id) {
      alert(
        'Silakan pilih Mata Kuliah terlebih dahulu.'
      );
      return;
    }

    if (!formData.ruang_id) {
      alert(
        'Silakan pilih Ruangan terlebih dahulu.'
      );
      return;
    }

    if (
      !formData.master_semester_id
    ) {
      alert(
        'Semester belum tersedia. Silakan aktifkan semester terlebih dahulu di Master Semester.'
      );
      return;
    }

    setSubmitting(true);

    const payload = {
      mk_id: Number(
        formData.mk_id
      ),

      ruang_id: Number(
        formData.ruang_id
      ),

      master_semester_id:
        Number(
          formData.master_semester_id
        ),

      hari: formData.hari,

      jam_mulai:
        formData.jam_mulai,

      jam_selesai:
        formData.jam_selesai,

      catatan:
        formData.catatan || null,
    };

    try {
      if (
        isEditing &&
        selectedId
      ) {
        const {
          error,
        } = await supabase
          .from('jadwal')
          .update(payload)
          .eq(
            'id',
            selectedId
          );

        if (error) {
          throw error;
        }
      } else {
        const {
          error,
        } = await supabase
          .from('jadwal')
          .insert([
            payload,
          ]);

        if (error) {
          throw error;
        }
      }

      setShowModal(false);

      await fetchJadwal();
    } catch (err: any) {
      alert(
        'Gagal menyimpan data: ' +
          err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    id: number
  ) => {
    if (
      !window.confirm(
        'Apakah Anda yakin ingin menghapus jadwal ini?'
      )
    ) {
      return;
    }

    try {
      const {
        error,
      } = await supabase
        .from('jadwal')
        .delete()
        .eq(
          'id',
          id
        );

      if (error) {
        throw error;
      }

      await fetchJadwal();
    } catch (err: any) {
      alert(
        'Gagal menghapus data: ' +
          err.message
      );
    }
  };

  // =========================================================
  // STATISTIK
  // =========================================================

  const totalBentrok =
    jadwalList.filter(
      (item) => {
        const details =
          getBentrokDetails(
            item,
            jadwalList
          );

        return (
          item.is_bentrok ||
          (details &&
            details.length >
              0)
        );
      }
    ).length;

  const totalAman =
    Math.max(
      jadwalList.length -
        totalBentrok,
      0
    );

  // =========================================================
  // SORT ICON
  // =========================================================

  const renderSortIcon = (
    field: SortField
  ) => {
    if (
      sortField !== field
    ) {
      return (
        <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
      );
    }

    return sortOrder ===
      'asc' ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-indigo-600" />
    );
  };

  // =========================================================
  // CLASS
  // =========================================================

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

  const labelClass =
    'mb-1.5 block text-xs font-semibold text-slate-600';

  // =========================================================
  // RENDER
  // =========================================================

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
                Kelola jadwal perkuliahan,
                ruangan, waktu, semester,
                serta pantau potensi bentrok
                secara langsung.
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
                  className={`h-4 w-4 ${
                    loading
                      ? 'animate-spin'
                      : ''
                  }`}
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={
                    handleOpenAddModal
                  }
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
            ACTIVE SEMESTER INFO
        ====================================================== */}

        <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                Semester Aktif
              </p>

              <p className="mt-0.5 text-sm font-bold text-slate-900">
                {formatSemester(
                  activeSemester
                )}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Jadwal baru otomatis
                menggunakan semester ini.
              </p>
            </div>

            {!activeSemester && (
              <div className="ml-auto hidden rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 sm:block">
                Aktifkan semester terlebih dahulu
              </div>
            )}
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

          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Jadwal
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Klik nama kolom untuk
                mengurutkan data.
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
          ) : jadwalList.length ===
            0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Calendar className="h-7 w-7" />
              </div>

              <p className="font-semibold text-slate-800">
                Belum ada jadwal
                perkuliahan
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                {isAdmin
                  ? 'Klik tombol "Tambah Jadwal" untuk membuat jadwal perkuliahan baru.'
                  : 'Belum ada data jadwal yang tersedia saat ini.'}
              </p>

              {isAdmin && (
                <button
                  type="button"
                  onClick={
                    handleOpenAddModal
                  }
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
                      onClick={() =>
                        handleSort('mk')
                      }
                      className="group cursor-pointer whitespace-nowrap px-5 py-3.5 transition hover:bg-slate-100"
                    >
                      Mata Kuliah
                      {renderSortIcon(
                        'mk'
                      )}
                    </th>

                    <th
                      onClick={() =>
                        handleSort('hari')
                      }
                      className="group cursor-pointer whitespace-nowrap px-5 py-3.5 transition hover:bg-slate-100"
                    >
                      Hari & Waktu
                      {renderSortIcon(
                        'hari'
                      )}
                    </th>

                    <th
                      onClick={() =>
                        handleSort('ruang')
                      }
                      className="group cursor-pointer whitespace-nowrap px-5 py-3.5 transition hover:bg-slate-100"
                    >
                      Ruang
                      {renderSortIcon(
                        'ruang'
                      )}
                    </th>

                    <th
                      onClick={() =>
                        handleSort(
                          'semester'
                        )
                      }
                      className="group cursor-pointer whitespace-nowrap px-5 py-3.5 transition hover:bg-slate-100"
                    >
                      Semester
                      {renderSortIcon(
                        'semester'
                      )}
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

                  {sortedJadwalList.map(
                    (item) => {
                      const itemId =
                        item.id ||
                        item.jadwal_id ||
                        0;

                      const bentrokDetails =
                        getBentrokDetails(
                          item,
                          jadwalList
                        );

                      const isBentrok =
                        item.is_bentrok ||
                        (bentrokDetails &&
                          bentrokDetails.length >
                            0);

                      return (
                        <tr
                          key={itemId}
                          className={`group transition-colors ${
                            isBentrok
                              ? 'bg-red-50/50 hover:bg-red-50'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >

                          {/* MK */}

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
                                  {getMkName(
                                    item
                                  )}
                                </p>

                                {item.kode_mk && (
                                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                    {item.kode_mk}
                                  </p>
                                )}
                              </div>

                            </div>
                          </td>

                          {/* HARI */}

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
                                  {item.jam_mulai}{' '}
                                  —{' '}
                                  {item.jam_selesai}
                                </span>
                              </div>

                            </div>
                          </td>

                          {/* RUANG */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <MapPin className="h-3.5 w-3.5" />
                              </div>

                              <span className="text-xs font-medium text-slate-700">
                                {getRuangName(
                                  item
                                )}
                              </span>
                            </div>
                          </td>

                          {/* SEMESTER */}

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700">
                              {getSemesterName(
                                item
                              )}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">
                            {isBentrok ? (
                              <div className="min-w-[190px]">

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  Bentrok
                                </span>

                                {bentrokDetails &&
                                  bentrokDetails.length >
                                    0 && (
                                    <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-2.5">
                                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-red-800">
                                        Bentrok dengan
                                      </p>

                                      <div className="space-y-1.5">
                                        {bentrokDetails.map(
                                          (
                                            b,
                                            idx
                                          ) => (
                                            <div
                                              key={
                                                idx
                                              }
                                              className="text-[11px] leading-4 text-red-700"
                                            >
                                              <span className="font-semibold">
                                                {
                                                  b.mk
                                                }
                                              </span>

                                              <span className="text-red-500">
                                                {' '}
                                                ·{' '}
                                                {
                                                  b.ruang
                                                }
                                              </span>

                                              <div className="font-medium text-red-600">
                                                {
                                                  b.jam
                                                }
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

                          {/* CATATAN */}

                          <td className="px-5 py-4">
                            <div className="flex max-w-[220px] items-start gap-2">
                              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />

                              <span
                                className="truncate text-xs text-slate-500"
                                title={
                                  item.catatan ||
                                  undefined
                                }
                              >
                                {item.catatan ||
                                  '-'}
                              </span>
                            </div>
                          </td>

                          {/* ACTION */}

                          {isAdmin && (
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenEditModal(
                                      item
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                                  title="Edit jadwal"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      itemId
                                    )
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
                    }
                  )}

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
            if (
              e.target ===
              e.currentTarget
            ) {
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

                  <p className="mt-0.5 text-xs text-slate-400">
                    Lengkapi informasi jadwal
                    perkuliahan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
            >
              <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">

                {/* =================================================
                    AKADEMIK
                ================================================== */}

                <div className="mb-6">

                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Informasi Akademik
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Pilih mata kuliah dan
                      ruangan yang sesuai.
                    </p>
                  </div>

                  {/* =================================================
                      COMBOBOX MATA KULIAH
                  ================================================== */}

                  <div
                    ref={
                      mkComboboxRef
                    }
                    className="relative mb-4"
                  >
                    <label
                      className={
                        labelClass
                      }
                    >
                      Mata Kuliah
                    </label>

                    <div className="relative">

                      <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={mkSearch}
                        placeholder="Ketik nama atau kode mata kuliah..."
                        onFocus={() => {
                          setShowMkDropdown(
                            true
                          );
                        }}
                        onChange={(e) => {
                          setMkSearch(
                            e.target.value
                          );

                          setFormData(
                            (prev) => ({
                              ...prev,
                              mk_id: '',
                            })
                          );

                          setMkHighlightIndex(
                            0
                          );

                          setShowMkDropdown(
                            true
                          );
                        }}
                        onKeyDown={
                          handleMkKeyDown
                        }
                        className={`${inputClass} pl-10 pr-10`}
                      />

                      <ChevronDown
                        className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform ${
                          showMkDropdown
                            ? 'rotate-180'
                            : ''
                        }`}
                      />

                    </div>

                    {/* DROPDOWN */}

                    {showMkDropdown && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">

                        <div className="border-b border-slate-100 bg-slate-50/80 px-3.5 py-2">
                          <p className="text-[11px] font-semibold text-slate-500">
                            {mkSearch
                              ? `${filteredMkOptions.length} hasil ditemukan`
                              : 'Pilih mata kuliah'}
                          </p>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-1.5">

                          {filteredMkOptions.length ===
                          0 ? (
                            <div className="px-4 py-8 text-center">
                              <Search className="mx-auto h-5 w-5 text-slate-300" />

                              <p className="mt-2 text-xs font-semibold text-slate-600">
                                Mata kuliah
                                tidak ditemukan
                              </p>

                              <p className="mt-1 text-[11px] text-slate-400">
                                Coba gunakan
                                kata kunci
                                lain.
                              </p>
                            </div>
                          ) : (
                            filteredMkOptions.map(
                              (
                                option,
                                index
                              ) => {
                                const isSelected =
                                  String(
                                    option.id
                                  ) ===
                                  String(
                                    formData.mk_id
                                  );

                                const isHighlighted =
                                  index ===
                                  mkHighlightIndex;

                                return (
                                  <button
                                    key={
                                      option.id
                                    }
                                    type="button"
                                    onMouseEnter={() =>
                                      setMkHighlightIndex(
                                        index
                                      )
                                    }
                                    onMouseDown={(
                                      e
                                    ) => {
                                      e.preventDefault();
                                      handleSelectMk(
                                        option
                                      );
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                                      isHighlighted
                                        ? 'bg-indigo-50'
                                        : 'hover:bg-slate-50'
                                    }`}
                                  >

                                    <div
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-slate-100 text-slate-500'
                                      }`}
                                    >
                                      <BookOpen className="h-3.5 w-3.5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-semibold text-slate-800">
                                        {
                                          option.nama
                                        }
                                      </p>

                                      {option.kode && (
                                        <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                          {
                                            option.kode
                                          }
                                        </p>
                                      )}
                                    </div>

                                    {isSelected && (
                                      <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
                                    )}

                                  </button>
                                );
                              }
                            )
                          )}

                        </div>

                        <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-2">
                          <p className="text-[10px] text-slate-400">
                            Gunakan ↑ ↓ untuk
                            navigasi dan Enter
                            untuk memilih.
                          </p>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* =================================================
                      RUANG & SEMESTER
                  ================================================== */}

                  <div className="grid gap-4 sm:grid-cols-2">

                    {/* RUANG */}

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        Ruangan
                      </label>

                      <select
                        required
                        value={
                          formData.ruang_id
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              ruang_id:
                                e.target
                                  .value,
                            }
                          )
                        }
                        className={
                          inputClass
                        }
                      >
                        <option
                          value=""
                          disabled
                        >
                          -- Pilih Ruang --
                        </option>

                        {ruangOptions.map(
                          (opt) => (
                            <option
                              key={
                                opt.id
                              }
                              value={
                                opt.id
                              }
                            >
                              {
                                opt.nama
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* SEMESTER AKTIF */}

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        Semester
                      </label>

                      <div
                        className={`flex min-h-[42px] items-center gap-3 rounded-xl border px-3.5 py-2.5 ${
                          activeSemester
                            ? 'border-indigo-100 bg-indigo-50/70'
                            : 'border-amber-200 bg-amber-50'
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            activeSemester
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          <GraduationCap className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-xs font-bold ${
                              activeSemester
                                ? 'text-indigo-800'
                                : 'text-amber-800'
                            }`}
                          >
                            {isEditing
                              ? getSemesterName(
                                  jadwalList.find(
                                    (
                                      item
                                    ) =>
                                      (
                                        item.id ||
                                        item.jadwal_id
                                      ) ===
                                      selectedId
                                  ) ||
                                    ({
                                      master_semester_id:
                                        Number(
                                          formData.master_semester_id
                                        ),
                                    } as JadwalItem)
                                )
                              : formatSemester(
                                  activeSemester
                                )}
                          </p>

                          <p
                            className={`text-[10px] ${
                              activeSemester
                                ? 'text-indigo-500'
                                : 'text-amber-600'
                            }`}
                          >
                            {isEditing
                              ? 'Semester jadwal ini'
                              : 'Otomatis dari semester aktif'}
                          </p>
                        </div>
                      </div>

                      {!activeSemester &&
                        !isEditing && (
                          <p className="mt-1.5 text-[10px] font-medium text-amber-600">
                            Belum ada semester aktif.
                            Atur di Master Semester
                            terlebih dahulu.
                          </p>
                        )}
                    </div>

                  </div>
                </div>

                {/* DIVIDER */}

                <div className="mb-6 border-t border-slate-100" />

                {/* =================================================
                    WAKTU
                ================================================== */}

                <div className="mb-6">

                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Waktu Perkuliahan
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Tentukan hari dan rentang
                      waktu perkuliahan.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">

                    {/* HARI */}

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        Hari
                      </label>

                      <select
                        value={
                          formData.hari
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              hari:
                                e.target
                                  .value,
                            }
                          )
                        }
                        className={
                          inputClass
                        }
                      >
                        {[
                          'Senin',
                          'Selasa',
                          'Rabu',
                          'Kamis',
                          'Jumat',
                          'Sabtu',
                          'Minggu',
                        ].map(
                          (hari) => (
                            <option
                              key={hari}
                              value={hari}
                            >
                              {hari}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* JAM MULAI */}

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        Jam Mulai
                      </label>

                      <input
                        type="time"
                        required
                        value={
                          formData.jam_mulai
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              jam_mulai:
                                e.target
                                  .value,
                            }
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </div>

                    {/* JAM SELESAI */}

                    <div>
                      <label
                        className={
                          labelClass
                        }
                      >
                        Jam Selesai
                      </label>

                      <input
                        type="time"
                        required
                        value={
                          formData.jam_selesai
                        }
                        onChange={(e) =>
                          setFormData(
                            {
                              ...formData,
                              jam_selesai:
                                e.target
                                  .value,
                            }
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </div>

                  </div>
                </div>

                {/* DIVIDER */}

                <div className="mb-6 border-t border-slate-100" />

                {/* =================================================
                    CATATAN
                ================================================== */}

                <div>

                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Catatan
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Tambahkan informasi tambahan
                      jika diperlukan.
                    </p>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Contoh: Dosen berhalangan hadir, diganti praktikum..."
                    value={
                      formData.catatan
                    }
                    onChange={(e) =>
                      setFormData(
                        {
                          ...formData,
                          catatan:
                            e.target
                              .value,
                        }
                      )
                    }
                    className={`${inputClass} resize-none`}
                  />

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !formData.mk_id ||
                    !formData.ruang_id ||
                    !formData.master_semester_id
                  }
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