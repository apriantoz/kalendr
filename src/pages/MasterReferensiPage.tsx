// src/pages/MasterReferensiPage.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';

export const MasterReferensiPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'prodi' | 'semester' | 'tipe_ruang'>('prodi');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTab = async () => {
    setLoading(true);
    setErrorMsg(null);
    let query = supabase.from(activeTab).select('*');
    if (activeTab === 'semester') query = query.order('semester', { ascending: true });
    else query = query.order('id', { ascending: true });

    const { data, error } = await query;
    if (error) setErrorMsg(error.message);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    setInputValue('');
    setErrorMsg(null);
    fetchTab();
  }, [activeTab]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    let payload: any = {};
    if (activeTab === 'prodi') payload = { nama_prodi: inputValue };
    if (activeTab === 'tipe_ruang') payload = { tipe_ruang: inputValue };
    if (activeTab === 'semester') payload = { semester: Number(inputValue) };

    const { error } = await supabase.from(activeTab).insert([payload]);

    setSubmitting(false);

    if (error) {
      // Menampilkan pesan error dari Supabase (misal: RLS violation / constraint duplicate)
      setErrorMsg(`Gagal menambah data: ${error.message}`);
    } else {
      setInputValue('');
      fetchTab();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus item ini?')) return;
    const { error } = await supabase.from(activeTab).delete().eq('id', id);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
    } else {
      fetchTab();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Master Referensi Sistem</h1>
      <p className="text-sm text-gray-500 mb-6">Kelola data dasar Program Studi, Semester Paket, dan Tipe Ruangan.</p>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        {(['prodi', 'semester', 'tipe_ruang'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-sm font-semibold capitalize border-b-2 transition ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'prodi' ? 'Program Studi' : tab === 'semester' ? 'Semester Paket' : 'Tipe Ruang'}
          </button>
        ))}
      </div>

      {/* Alert Error */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Tambah Cepat */}
      {isAdmin ? (
        <form onSubmit={handleAdd} className="flex gap-2 mb-6 bg-white p-4 rounded-xl border shadow-sm">
          <input
            type={activeTab === 'semester' ? 'number' : 'text'}
            required
            placeholder={
              activeTab === 'prodi'
                ? 'Contoh: Teknik Informatika'
                : activeTab === 'semester'
                ? 'Contoh: 1, 2, 3...'
                : 'Contoh: Laboratorium / Teori'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {submitting ? 'Menyimpan...' : 'Tambah'}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
          <strong>Mode Lihat Saja:</strong> Silakan login sebagai Admin untuk menambah atau menghapus data referensi.
        </div>
      )}

      {/* List Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nilai Data</th>
                {isAdmin && <th className="px-6 py-4 text-center">Hapus</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    Belum ada data. Silakan tambah data baru.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{item.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {activeTab === 'prodi' && item.nama_prodi}
                      {activeTab === 'tipe_ruang' && item.tipe_ruang}
                      {activeTab === 'semester' && `Semester ${item.semester}`}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};