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
  ArrowDown
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

  // State Sorting
  const [sortField, setSortField] = useState<SortField>('hari');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // State Option untuk Select Form
  const [mkOptions, setMkOptions] = useState<DropdownOption[]>([]);
  const [ruangOptions, setRuangOptions] = useState<DropdownOption[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<DropdownOption[]>([]);

  // State Modal Form
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

  // Helper Ambil Nama Semester
  const getSemesterName = (item: JadwalItem) => {
    if (item.tahun_ajaran && item.tipe_semester) {
      return `${item.tahun_ajaran} (${item.tipe_semester})`;
    }
    return item.master_semester_id ? `Semester #${item.master_semester_id}` : '-';
  };

  // Urutan Hari untuk Sorting Logis (Senin - Minggu)
  const hariUrutan: Record<string, number> = {
    'Senin': 1,
    'Selasa': 2,
    'Rabu': 3,
    'Kamis': 4,
    'Jumat': 5,
    'Sabtu': 6,
    'Minggu': 7,
  };

  // Fetch Data Master (MK, Ruang, Semester) untuk Dropdown Form Input
  const fetchMasterData = async () => {
    try {
      const [mkRes, ruangRes, semRes] = await Promise.all([
        supabase.from('mk').select('*'),
        supabase.from('ruang').select('*'),
        supabase.from('master_semester').select('*'),
      ]);

      if (mkRes.data) {
        setMkOptions(mkRes.data.map((item: any) => ({
          id: item.id,
          nama: item.nama_mk || item.nama || `MK ID ${item.id}`,
        })));
      }

      if (ruangRes.data) {
        setRuangOptions(ruangRes.data.map((item: any) => ({
          id: item.id,
          nama: item.nama_ruang || item.nama || `Ruang ID ${item.id}`,
        })));
      }

      if (semRes.data) {
        setSemesterOptions(semRes.data.map((item: any) => ({
          id: item.id,
          nama: item.nama_semester || item.semester || item.nama || `Semester ID ${item.id}`,
        })));
      }
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  // Fetch Data Jadwal dari View view_jadwal_detail
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

  // Handle Trigger Sorting Header Click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Data yang sudah di-sort menggunakan useMemo
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

  // Open Modal Tambah
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      mk_id: mkOptions[0]?.id ? String(mkOptions[0].id) : '',
      ruang_id: ruangOptions[0]?.id ? String(ruangOptions[0].id) : '',
      master_semester_id: semesterOptions[0]?.id ? String(semesterOptions[0].id) : '',
      hari: 'Senin',
      jam_mulai: '08:00',
      jam_selesai: '10:00',
      catatan: '',
    });
    setShowModal(true);
  };

  // Open Modal Edit
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

  // Handle Form Submit
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

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      const { error } = await supabase.from('jadwal').delete().eq('id', id);
      if (error) throw error;
      fetchJadwal();
    } catch (err: any) {
      alert('Gagal menghapus data: ' + err.message);
    }
  };

  // Menghitung statistik bentrok
  const totalBentrok = jadwalList.filter((item) => {
    const details = getBentrokDetails(item, jadwalList);
    return item.is_bentrok || (details && details.length > 0);
  }).length;

  // Helper render ikon sorting di header
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 inline ml-1 transition opacity-0 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 inline ml-1" />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Kelola Jadwal Perkuliahan</h1>
            {totalBentrok > 0 && (
              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                {totalBentrok} Jadwal Bentrok
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Daftar perkuliahan beserta ruangan, alokasi waktu, dan pendeteksi bentrok.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchJadwal}
            className="p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Jadwal
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm">Memuat data jadwal...</p>
          </div>
        ) : jadwalList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700">Belum ada jadwal perkuliahan</p>
            <p className="text-xs text-gray-400 mt-1">
              {isAdmin ? 'Klik tombol "Tambah Jadwal" untuk membuat agenda baru.' : 'Silakan cek kembali nanti.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs border-b border-gray-200 select-none">
                <tr>
                  <th 
                    onClick={() => handleSort('mk')} 
                    className="px-6 py-4 cursor-pointer group hover:bg-gray-100 transition"
                  >
                    Mata Kuliah / Kegiatan {renderSortIcon('mk')}
                  </th>
                  <th 
                    onClick={() => handleSort('hari')} 
                    className="px-6 py-4 cursor-pointer group hover:bg-gray-100 transition"
                  >
                    Hari & Waktu {renderSortIcon('hari')}
                  </th>
                  <th 
                    onClick={() => handleSort('ruang')} 
                    className="px-6 py-4 cursor-pointer group hover:bg-gray-100 transition"
                  >
                    Ruang {renderSortIcon('ruang')}
                  </th>
                  <th 
                    onClick={() => handleSort('semester')} 
                    className="px-6 py-4 cursor-pointer group hover:bg-gray-100 transition"
                  >
                    Semester {renderSortIcon('semester')}
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Catatan</th>
                  {isAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedJadwalList.map((item) => {
                  const itemId = item.id || item.jadwal_id || 0;
                  
                  // Deteksi detail bentrok terpusat
                  const bentrokDetails = getBentrokDetails(item, jadwalList);
                  const isBentrok = item.is_bentrok || (bentrokDetails && bentrokDetails.length > 0);

                  return (
                    <tr
                      key={itemId}
                      className={`transition ${
                        isBentrok ? 'bg-red-50/70 hover:bg-red-100/70 border-l-4 border-l-red-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          <BookOpen className={`w-4 h-4 ${isBentrok ? 'text-red-600' : 'text-indigo-600'}`} />
                          {getMkName(item)}
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800">
                          <Calendar className={`w-3.5 h-3.5 ${isBentrok ? 'text-red-500' : 'text-indigo-500'}`} />
                          {item.hari}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className={`w-3.5 h-3.5 ${isBentrok ? 'text-red-400' : 'text-indigo-400'}`} />
                          {item.jam_mulai} - {item.jam_selesai}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {getRuangName(item)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium">
                          {getSemesterName(item)}
                        </span>
                      </td>

                      {/* Kolom Badge Status Bentrok */}
                      <td className="px-6 py-4">
                        {isBentrok ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold border border-red-300 shadow-sm">
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
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">
                            Aman
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                        {item.catatan || '-'}
                      </td>

                      {isAdmin && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(itemId)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {isEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select MK */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mata Kuliah
                </label>
                <select
                  required
                  value={formData.mk_id}
                  onChange={(e) => setFormData({ ...formData, mk_id: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="" disabled>-- Pilih Mata Kuliah --</option>
                  {mkOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Ruang & Semester */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ruangan
                  </label>
                  <select
                    required
                    value={formData.ruang_id}
                    onChange={(e) => setFormData({ ...formData, ruang_id: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="" disabled>-- Pilih Ruang --</option>
                    {ruangOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    required
                    value={formData.master_semester_id}
                    onChange={(e) => setFormData({ ...formData, master_semester_id: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="" disabled>-- Pilih Semester --</option>
                    {semesterOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hari & Jam */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hari
                  </label>
                  <select
                    value={formData.hari}
                    onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.jam_mulai}
                    onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.jam_selesai}
                    onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Dosen berhalangan hadir diganti praktikum..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};