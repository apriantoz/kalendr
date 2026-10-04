import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { X, Save, AlertCircle } from 'lucide-react';

interface OptionItem {
  id: number;
  label: string;
}

interface MasterSemesterOption {
  id: number;
  label: string;
  is_active: boolean;
}

export interface JadwalFormData {
  id?: number;
  mk_id: number | '';
  ruang_id: number | '';
  master_semester_id: number | '';
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  catatan: string;
}

interface JadwalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: JadwalFormData | null;
}

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const JadwalFormModal: React.FC<JadwalFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [formData, setFormData] = useState<JadwalFormData>({
    mk_id: '',
    ruang_id: '',
    master_semester_id: '',
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '10:00',
    catatan: '',
  });

  const [mkOptions, setMkOptions] = useState<OptionItem[]>([]);
  const [ruangOptions, setRuangOptions] = useState<OptionItem[]>([]);
  const [masterSmtOptions, setMasterSmtOptions] = useState<MasterSemesterOption[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingOptions, setFetchingOptions] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate dropdown options
  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      setFetchingOptions(true);
      setErrorMsg(null);

      try {
        const [mkRes, ruangRes, masterSmtRes] = await Promise.all([
          supabase.from('mk').select('id, nama_mk, kode_mk').order('nama_mk'),
          supabase.from('ruang').select('id, nama_ruang').order('nama_ruang'),
          supabase.from('master_semester').select('id, tipe_semester, tahun_ajaran, is_active').order('id', { ascending: false }),
        ]);

        if (mkRes.error) throw mkRes.error;
        if (ruangRes.error) throw ruangRes.error;
        if (masterSmtRes.error) throw masterSmtRes.error;

        setMkOptions(
          (mkRes.data || []).map((m) => ({
            id: m.id,
            label: m.kode_mk ? `[${m.kode_mk}] ${m.nama_mk}` : m.nama_mk,
          }))
        );

        setRuangOptions(
          (ruangRes.data || []).map((r) => ({
            id: r.id,
            label: r.nama_ruang,
          }))
        );

        const masterList = (masterSmtRes.data || []).map((ms) => ({
          id: ms.id,
          label: `${ms.tipe_semester} ${ms.tahun_ajaran}${ms.is_active ? ' (Aktif)' : ''}`,
          is_active: ms.is_active,
        }));
        setMasterSmtOptions(masterList);

        // Reset form or populate initial edit data
        if (initialData) {
          setFormData({
            id: initialData.id,
            mk_id: initialData.mk_id,
            ruang_id: initialData.ruang_id,
            master_semester_id: initialData.master_semester_id,
            hari: initialData.hari || 'Senin',
            jam_mulai: initialData.jam_mulai ? initialData.jam_mulai.slice(0, 5) : '08:00',
            jam_selesai: initialData.jam_selesai ? initialData.jam_selesai.slice(0, 5) : '10:00',
            catatan: initialData.catatan || '',
          });
        } else {
          // Default selection to active master semester if available
          const activeSmt = masterList.find((ms) => ms.is_active);
          setFormData({
            mk_id: mkRes.data?.[0]?.id || '',
            ruang_id: ruangRes.data?.[0]?.id || '',
            master_semester_id: activeSmt ? activeSmt.id : masterList[0]?.id || '',
            hari: 'Senin',
            jam_mulai: '08:00',
            jam_selesai: '10:00',
            catatan: '',
          });
        }
      } catch (err: any) {
        setErrorMsg('Gagal memuat pilihan relasi: ' + err.message);
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchOptions();
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.endsWith('_id') ? (value ? Number(value) : '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.mk_id || !formData.ruang_id || !formData.master_semester_id) {
      setErrorMsg('Harap lengkapi seluruh field relasi (MK, Ruang, Semester).');
      return;
    }

    if (formData.jam_selesai <= formData.jam_mulai) {
      setErrorMsg('Jam selesai harus lebih besar dari jam mulai.');
      return;
    }

    setLoading(true);

    const payload = {
      mk_id: formData.mk_id,
      ruang_id: formData.ruang_id,
      master_semester_id: formData.master_semester_id,
      hari: formData.hari,
      jam_mulai: formData.jam_mulai,
      jam_selesai: formData.jam_selesai,
      catatan: formData.catatan || null,
    };

    let error;
    if (formData.id) {
      // UPDATE
      const res = await supabase.from('jadwal').update(payload).eq('id', formData.id);
      error = res.error;
    } else {
      // INSERT
      const res = await supabase.from('jadwal').insert([payload]);
      error = res.error;
    }

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {formData.id ? 'Edit Jadwal Perkuliahans' : 'Tambah Jadwal Baru'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {fetchingOptions ? (
          <div className="py-12 text-center text-sm text-gray-500">Memuat pilihan form...</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Master Semester */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Tahun Ajaran / Semester Master
              </label>
              <select
                name="master_semester_id"
                value={formData.master_semester_id}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Pilih Semester --</option>
                {masterSmtOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mata Kuliah */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Mata Kuliah
              </label>
              <select
                name="mk_id"
                value={formData.mk_id}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Pilih Mata Kuliah --</option>
                {mkOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ruangan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Ruangan
              </label>
              <select
                name="ruang_id"
                value={formData.ruang_id}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Pilih Ruangan --</option>
                {ruangOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hari & Waktu Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Hari
                </label>
                <select
                  name="hari"
                  value={formData.hari}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {HARI_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Mulai
                </label>
                <input
                  type="time"
                  name="jam_mulai"
                  value={formData.jam_mulai}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Selesai
                </label>
                <input
                  type="time"
                  name="jam_selesai"
                  value={formData.jam_selesai}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                name="catatan"
                rows={2}
                value={formData.catatan}
                onChange={handleChange}
                placeholder="misal: Kelas gabungan atau online"
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};