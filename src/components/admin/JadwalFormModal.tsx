// src/components/admin/JadwalFormModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  BookOpen,
  Building2,
  AlertTriangle,
  Save,
  CheckCircle2,
  FileText,
} from 'lucide-react';

// Interface sesuai DDL Supabase
export interface OptionProdi {
  id: number;
  nama_prodi: string;
}

export interface OptionMK {
  id: number;
  kode_mk?: string;
  nama_mk: string;
  sks: number;
  prodi_id: number;
  smt_id: number;
}

export interface OptionRuang {
  id: number;
  nama_ruang: string;
  kapasitas: number;
}

export interface OptionMasterSemester {
  id: number;
  tipe_semester: string; // 'Ganjil' | 'Genap'
  tahun_ajaran: string;  // e.g. '2025/2026'
  is_active: boolean;
}

export interface JadwalItem {
  id?: number;
  mk_id: number;
  ruang_id: number;
  master_semester_id: number;
  hari: string;
  jam_mulai: string;  // Format 'HH:mm' atau 'HH:mm:ss'
  jam_selesai: string;
  catatan?: string;
}

interface JadwalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: JadwalItem | null; // Jika isi, mode Edit
  // Mock/Prop Data dari Parent / Supabase Query
  listMK: OptionMK[];
  listRuang: OptionRuang[];
  listMasterSemester: OptionMasterSemester[];
  existingJadwalList: JadwalItem[]; // Diperlukan untuk pengecekan bentrok di UI
}

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const JadwalFormModal: React.FC<JadwalFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  listMK,
  listRuang,
  listMasterSemester,
  existingJadwalList,
}) => {
  const activeSemester = listMasterSemester.find((s) => s.is_active);

  const [formData, setFormData] = useState<JadwalItem>({
    mk_id: listMK[0]?.id || 0,
    ruang_id: listRuang[0]?.id || 0,
    master_semester_id: activeSemester?.id || listMasterSemester[0]?.id || 0,
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '10:30',
    catatan: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync Form State jika Mode Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        jam_mulai: initialData.jam_mulai.substring(0, 5),
        jam_selesai: initialData.jam_selesai.substring(0, 5),
      });
    } else {
      setFormData({
        mk_id: listMK[0]?.id || 0,
        ruang_id: listRuang[0]?.id || 0,
        master_semester_id: activeSemester?.id || listMasterSemester[0]?.id || 0,
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '10:30',
        catatan: '',
      });
    }
    setErrorMsg(null);
    setConflictWarning(null);
  }, [initialData, isOpen, listMK, listRuang, activeSemester]);

  // Validasi Bentrok Jadwal secara Real-time
  const checkScheduleConflict = (data: JadwalItem): string | null => {
    const { ruang_id, master_semester_id, hari, jam_mulai, jam_selesai, id } = data;

    const parseMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = parseMinutes(jam_mulai);
    const newEnd = parseMinutes(jam_selesai);

    if (newEnd <= newStart) {
      return 'Jam selesai harus lebih besar dari jam mulai!';
    }

    // Cari jadwal lain di ruang, hari, dan semester yang sama
    const conflict = existingJadwalList.find((j) => {
      // Abaikan diri sendiri jika sedang mode edit
      if (id && j.id === id) return false;

      if (
        j.ruang_id === Number(ruang_id) &&
        j.master_semester_id === Number(master_semester_id) &&
        j.hari === hari
      ) {
        const existStart = parseMinutes(j.jam_mulai.substring(0, 5));
        const existEnd = parseMinutes(j.jam_selesai.substring(0, 5));

        // Overlap Condition: (StartA < EndB) AND (EndA > StartB)
        return newStart < existEnd && newEnd > existStart;
      }
      return false;
    });

    if (conflict) {
      const mkConflict = listMK.find((m) => m.id === conflict.mk_id)?.nama_mk || 'Mata Kuliah Lain';
      return `Bentrok dengan ${mkConflict} (${conflict.jam_mulai.substring(0, 5)} - ${conflict.jam_selesai.substring(0, 5)}) di ruangan yang sama!`;
    }

    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: name.endsWith('_id') ? Number(value) : value,
    };

    setFormData(updated);

    // Cek bentrok setiap ada perubahan input jam/ruang/hari
    const conflict = checkScheduleConflict(updated);
    setConflictWarning(conflict);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validasi Jam
    if (formData.jam_selesai <= formData.jam_mulai) {
      setErrorMsg('Jam selesai harus lebih besar dari jam mulai (Constraint check_jam).');
      return;
    }

    // 2. Validasi Bentrok
    const conflict = checkScheduleConflict(formData);
    if (conflict) {
      setErrorMsg(conflict);
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace dengan query Supabase Client sesungguhnya
      // const { data, error } = await supabase.from('jadwal').upsert([formData]);
      
      console.log('Payload disimpan ke Supabase:', formData);

      // Simulasi Latency API
      await new Promise((res) => setTimeout(res, 800));

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Gagal menyimpan data jadwal.');
    }
  };

  if (!isOpen) return null;

  const selectedMK = listMK.find((m) => m.id === Number(formData.mk_id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Edit Jadwal Perkuliahan' : 'Tambah Jadwal Perkuliahan Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Kelola plot ruang dan waktu mata kuliah pada tabel <code className="text-indigo-400 font-mono">jadwal</code>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Alert Peringatan Bentrok / Error */}
          {(errorMsg || conflictWarning) && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                errorMsg
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg || conflictWarning}</span>
            </div>
          )}

          {/* 1. Master Semester / Tahun Ajaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Periode / Master Semester *
            </label>
            <select
              name="master_semester_id"
              value={formData.master_semester_id}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {listMasterSemester.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tipe_semester} {item.tahun_ajaran} {item.is_active ? '(Aktif Saat Ini)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Mata Kuliah (Relasi ke mk_id) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                Mata Kuliah *
              </label>
              {selectedMK && (
                <span className="text-[11px] text-slate-400">
                  {selectedMK.sks} SKS • Semester {selectedMK.smt_id}
                </span>
              )}
            </div>
            <select
              name="mk_id"
              value={formData.mk_id}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {listMK.map((mk) => (
                <option key={mk.id} value={mk.id}>
                  {mk.kode_mk ? `[${mk.kode_mk}] ` : ''}{mk.nama_mk} ({mk.sks} SKS)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Ruangan (Relasi ke ruang_id) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              Ruangan Laboratorium *
            </label>
            <select
              name="ruangan_id"
              value={formData.ruang_id}
              onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'ruang_id' } })}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {listRuang.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruang} (Kapasitas: {r.kapasitas} PC/Siswa)
                </option>
              ))}
            </select>
          </div>

          {/* 4. Hari & Jam Mulai - Jam Selesai */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hari *</label>
              <select
                name="hari"
                value={formData.hari}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {HARI_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-indigo-400" /> Jam Mulai *
              </label>
              <input
                type="time"
                name="jam_mulai"
                value={formData.jam_mulai}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-indigo-400" /> Jam Selesai *
              </label>
              <input
                type="time"
                name="jam_selesai"
                value={formData.jam_selesai}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* 5. Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-slate-400" /> Catatan (Opsional)
            </label>
            <textarea
              name="catatan"
              rows={2}
              value={formData.catatan || ''}
              onChange={handleChange}
              placeholder="Contoh: Pengisian kuis di 30 menit awal, Dosen Pengampu: Dr. Aris..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !!conflictWarning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{initialData ? 'Update Jadwal' : 'Simpan Jadwal'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default JadwalFormModal;