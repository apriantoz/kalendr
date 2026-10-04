// src/pages/MasterSemesterPage.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { type MasterSemester } from '@/types/master';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export const MasterSemesterPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<MasterSemester[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // State terpisah untuk menyimpan input Tahun Awal saja (misal: 2024)
  const [tahunAwal, setTahunAwal] = useState<number | string>(new Date().getFullYear());
  const [formData, setFormData] = useState({
    tipe_semester: 'Ganjil',
    tahun_ajaran: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    is_active: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('master_semester')
      .select('*')
      .order('id', { ascending: false });
    if (!error) setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!isAdmin) return;
    
    // Jika diaktifkan, matikan semester aktif lainnya lebih dulu
    if (!currentStatus) {
      await supabase.from('master_semester').update({ is_active: false }).neq('id', id);
    }

    const { error } = await supabase
      .from('master_semester')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) fetchData();
  };

  // Helper merubah tahun awal dan otomatis memperbarui string tahun_ajaran (YYYY/YYYY+1)
  const handleTahunAwalChange = (year: number | string) => {
    setTahunAwal(year);
    const numYear = Number(year);
    if (!isNaN(numYear) && numYear > 2000 && numYear < 2100) {
      setFormData((prev) => ({
        ...prev,
        tahun_ajaran: `${numYear}/${numYear + 1}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tahun_ajaran: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi sederhana tahun_ajaran
    if (!formData.tahun_ajaran) {
      alert('Tahun awal tidak valid!');
      return;
    }

    setSubmitting(true);

    if (formData.is_active) {
      await supabase.from('master_semester').update({ is_active: false }).neq('id', selectedId || 0);
    }

    if (isEditing && selectedId) {
      await supabase.from('master_semester').update(formData).eq('id', selectedId);
    } else {
      await supabase.from('master_semester').insert([formData]);
    }

    setSubmitting(false);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus master semester ini?')) return;
    await supabase.from('master_semester').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Semester Akademik</h1>
          <p className="text-sm text-gray-500">Kelola semester aktif perkuliahan (Ganjil/Genap & Tahun Ajaran).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 border rounded-lg hover:bg-gray-50 bg-white">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                const currentY = new Date().getFullYear();
                setIsEditing(false);
                setSelectedId(null);
                setTahunAwal(currentY);
                setFormData({
                  tipe_semester: 'Ganjil',
                  tahun_ajaran: `${currentY}/${currentY + 1}`,
                  is_active: false,
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Tambah Semester
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4">Tipe Semester</th>
                <th className="px-6 py-4">Tahun Ajaran</th>
                <th className="px-6 py-4">Status Aktif</th>
                {isAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.tipe_semester}</td>
                  <td className="px-6 py-4">{item.tahun_ajaran}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(item.id, item.is_active)}
                      disabled={!isAdmin}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setSelectedId(item.id);
                            
                            // Ekstrak tahun awal dari string '2024/2025' -> 2024
                            const initialYear = item.tahun_ajaran ? item.tahun_ajaran.split('/')[0] : new Date().getFullYear();
                            setTahunAwal(initialYear);
                            setFormData({
                              tipe_semester: item.tipe_semester,
                              tahun_ajaran: item.tahun_ajaran,
                              is_active: item.is_active,
                            });
                            setShowModal(true);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit Master Semester' : 'Tambah Master Semester'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Tipe Semester</label>
                <select
                  value={formData.tipe_semester}
                  onChange={(e) => setFormData({ ...formData, tipe_semester: e.target.value })}
                  className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              {/* Input Tahun Awal + Preview Hasil Otomatis */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tahun Awal</label>
                  <input
                    type="number"
                    required
                    min={2000}
                    max={2099}
                    placeholder="Contoh: 2024"
                    value={tahunAwal}
                    onChange={(e) => handleTahunAwalChange(e.target.value)}
                    className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-500">Tahun Ajaran (Otomatis)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.tahun_ajaran}
                    className="w-full text-sm border bg-gray-100 rounded-lg p-2 font-bold text-indigo-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_active" className="text-sm cursor-pointer select-none">Set sebagai Semester Aktif</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};