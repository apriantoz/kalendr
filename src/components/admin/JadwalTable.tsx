import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Building2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type {
  JadwalItem,
  OptionMK,
  OptionRuang,
  OptionMasterSemester,
} from './JadwalFormModal';
import { Button } from '../ui/button';

interface JadwalTableProps {
  jadwalList: JadwalItem[];
  listMK: OptionMK[];
  listRuang: OptionRuang[];
  listMasterSemester: OptionMasterSemester[];
  onAddClick: () => void;
  onEditClick: (item: JadwalItem) => void;
  onDeleteSuccess: (id: number) => void;
}

const HARI_LIST = ['Semua Hari', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const JadwalTable: React.FC<JadwalTableProps> = ({
  jadwalList,
  listMK,
  listRuang,
  listMasterSemester,
  onAddClick,
  onEditClick,
  onDeleteSuccess,
}) => {
  // Filter States
  const activeSemesterDefault = listMasterSemester.find((s) => s.is_active)?.id || listMasterSemester[0]?.id || 0;
  
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(activeSemesterDefault);
  const [selectedHari, setSelectedHari] = useState<string>('Semua Hari');
  const [selectedRuangId, setSelectedRuangId] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Delete Modal State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Helper Maps untuk Fast Lookup
  const mkMap = useMemo(() => new Map(listMK.map((m) => [m.id, m])), [listMK]);
  const ruangMap = useMemo(() => new Map(listRuang.map((r) => [r.id, r])), [listRuang]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return jadwalList.filter((item) => {
      // 1. Filter Semester
      if (selectedSemesterId && item.master_semester_id !== selectedSemesterId) {
        return false;
      }

      // 2. Filter Hari
      if (selectedHari !== 'Semua Hari' && item.hari !== selectedHari) {
        return false;
      }

      // 3. Filter Ruangan
      if (selectedRuangId !== 'ALL' && item.ruang_id !== selectedRuangId) {
        return false;
      }

      // 4. Search Query (Nama MK / Kode MK / Catatan)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const mk = mkMap.get(item.mk_id);
        const namaMk = mk?.nama_mk?.toLowerCase() || '';
        const kodeMk = mk?.kode_mk?.toLowerCase() || '';
        const catatan = item.catatan?.toLowerCase() || '';

        return namaMk.includes(query) || kodeMk.includes(query) || catatan.includes(query);
      }

      return true;
    });
  }, [jadwalList, selectedSemesterId, selectedHari, selectedRuangId, searchQuery, mkMap]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);

    try {
      // TODO: Replace dengan Supabase Delete Client
      // await supabase.from('jadwal').delete().eq('id', deletingId);
      
      console.log('Jadwal dihapus dari Supabase ID:', deletingId);
      await new Promise((res) => setTimeout(res, 600));

      onDeleteSuccess(deletingId);
      setDeletingId(null);
    } catch (error) {
      console.error('Gagal menghapus jadwal:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Controls: Search, Filter, & Add Button */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari mata kuliah, kode MK, atau catatan..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onAddClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Jadwal</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          
          {/* Filter Periode Semester */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-xl">
            <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-medium">Periode:</span>
            <select
              value={selectedSemesterId}
              onChange={(e) => {
                setSelectedSemesterId(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-white focus:outline-none font-semibold w-full cursor-pointer"
            >
              {listMasterSemester.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.tipe_semester} {s.tahun_ajaran} {s.is_active ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Hari */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-xl">
            <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-medium">Hari:</span>
            <select
              value={selectedHari}
              onChange={(e) => {
                setSelectedHari(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white focus:outline-none font-semibold w-full cursor-pointer"
            >
              {HARI_LIST.map((h) => (
                <option key={h} value={h} className="bg-slate-900 text-white">
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Ruangan */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-xl">
            <Building2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-medium">Ruang:</span>
            <select
              value={selectedRuangId}
              onChange={(e) => {
                setSelectedRuangId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-white focus:outline-none font-semibold w-full font-mono cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Ruangan</option>
              {listRuang.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                  {r.nama_ruang}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Mata Kuliah</th>
                <th className="py-3.5 px-4">Hari & Jam</th>
                <th className="py-3.5 px-4">Ruangan</th>
                <th className="py-3.5 px-4">SKS / Smt</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <BookOpen className="h-8 w-8 mx-auto text-slate-600" />
                      <p className="font-semibold text-slate-400">Tidak ada jadwal ditemukan</p>
                      <p className="text-[11px]">Coba ubah kata kunci pencarian atau sesuaikan filter di atas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const mk = mkMap.get(item.mk_id);
                  const ruang = ruangMap.get(item.ruang_id);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Mata Kuliah */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">
                          {mk?.nama_mk || 'Mata Kuliah Tidak Ditemukan'}
                        </div>
                        {mk?.kode_mk && (
                          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                            {mk.kode_mk}
                          </div>
                        )}
                      </td>

                      {/* Hari & Jam */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-[11px]">
                            {item.hari}
                          </span>
                          <span className="font-mono text-slate-200">
                            {item.jam_mulai.substring(0, 5)} - {item.jam_selesai.substring(0, 5)}
                          </span>
                        </div>
                      </td>

                      {/* Ruangan */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-medium text-slate-200">
                          {ruang?.nama_ruang || '-'}
                        </div>
                        {ruang && (
                          <div className="text-[10px] text-slate-500">
                            Cap: {ruang.kapasitas} PC
                          </div>
                        )}
                      </td>

                      {/* SKS & Smt */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">
                          {mk ? `${mk.sks} SKS` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Semester {mk?.smt_id || '-'}
                        </div>
                      </td>

                      {/* Catatan */}
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-400 text-[11px]">
                        {item.catatan || <span className="text-slate-600 italic">-</span>}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditClick(item)}
                            title="Edit Jadwal"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => item.id && setDeletingId(item.id)}
                            title="Hapus Jadwal"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination Controls */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Menampilkan <span className="font-semibold text-white">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> -{' '}
            <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari{' '}
            <span className="font-semibold text-white">{filteredData.length}</span> data jadwal
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-mono text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Hapus Jadwal Ini?</h3>
              <p className="text-xs text-slate-400">
                Tindakan ini tidak dapat dibatalkan. Data jadwal perkuliahan akan dihapus dari sistem Supabase.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JadwalTable;