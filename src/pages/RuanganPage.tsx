// src/pages/RuangPage.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { type Ruangan, type TipeRuang } from '@/types/master';
import { Plus, Edit, Trash2, MapPin, Users, Loader2, RefreshCw } from 'lucide-react';

export const RuangPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<Ruangan[]>([]);
  const [tipeOptions, setTipeOptions] = useState<TipeRuang[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_ruang: '',
    tipe_ruang_id: '',
    kapasitas: 40,
  });

  const fetchData = async () => {
    setLoading(true);
    const [ruangRes, tipeRes] = await Promise.all([
      supabase.from('ruang').select('*, tipe_ruang(*)').order('id', { ascending: true }),
      supabase.from('tipe_ruang').select('*'),
    ]);

    if (ruangRes.data) setList(ruangRes.data);
    if (tipeRes.data) setTipeOptions(tipeRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nama_ruang: formData.nama_ruang,
      tipe_ruang_id: Number(formData.tipe_ruang_id),
      kapasitas: Number(formData.kapasitas),
    };

    if (isEditing && selectedId) {
      await supabase.from('ruang').update(payload).eq('id', selectedId);
    } else {
      await supabase.from('ruang').insert([payload]);
    }

    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus ruangan ini?')) return;
    await supabase.from('ruang').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Ruangan</h1>
          <p className="text-sm text-gray-500">Kelola ruang kelas, laboratorium, dan kapasitas audiens.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 border rounded-lg bg-white"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          {isAdmin && (
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedId(null);
                setFormData({
                  nama_ruang: '',
                  tipe_ruang_id: tipeOptions[0]?.id ? String(tipeOptions[0].id) : '',
                  kapasitas: 40,
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Tambah Ruangan
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4">Nama Ruangan</th>
                <th className="px-6 py-4">Tipe Ruangan</th>
                <th className="px-6 py-4">Kapasitas</th>
                {isAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" /> {item.nama_ruang}
                  </td>
                  <td className="px-6 py-4">{item.tipe_ruang?.tipe_ruang || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full w-fit">
                      <Users className="w-3.5 h-3.5" /> {item.kapasitas} Kursi
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setSelectedId(item.id);
                            setFormData({
                              nama_ruang: item.nama_ruang,
                              tipe_ruang_id: String(item.tipe_ruang_id),
                              kapasitas: item.kapasitas,
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit Ruangan' : 'Tambah Ruangan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Komputer 1 / Lab A"
                  value={formData.nama_ruang}
                  onChange={(e) => setFormData({ ...formData, nama_ruang: e.target.value })}
                  className="w-full text-sm border rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tipe Ruangan</label>
                  <select
                    required
                    value={formData.tipe_ruang_id}
                    onChange={(e) => setFormData({ ...formData, tipe_ruang_id: e.target.value })}
                    className="w-full text-sm border rounded-lg p-2"
                  >
                    <option value="" disabled>-- Pilih Tipe --</option>
                    {tipeOptions.map((t) => <option key={t.id} value={t.id}>{t.tipe_ruang}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Kapasitas Kursi</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: Number(e.target.value) })}
                    className="w-full text-sm border rounded-lg p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};