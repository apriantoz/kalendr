// src/pages/MkBpage.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import { type MataKuliah, type Prodi, type SemesterPaket } from '@/types/master';
import { Plus, Edit, Trash2, BookOpen, Loader2, RefreshCw } from 'lucide-react';

export const MkBpage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<MataKuliah[]>([]);
  const [prodiOptions, setProdiOptions] = useState<Prodi[]>([]);
  const [smtOptions, setSmtOptions] = useState<SemesterPaket[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    kode_mk: '',
    nama_mk: '',
    sks: 2,
    prodi_id: '',
    smt_id: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [mkRes, prodiRes, smtRes] = await Promise.all([
      supabase.from('mk').select('*, prodi(*), semester(*)').order('id', { ascending: true }),
      supabase.from('prodi').select('*'),
      supabase.from('semester').select('*').order('semester', { ascending: true }),
    ]);

    if (mkRes.data) setList(mkRes.data);
    if (prodiRes.data) setProdiOptions(prodiRes.data);
    if (smtRes.data) setSmtOptions(smtRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      kode_mk: formData.kode_mk || null,
      nama_mk: formData.nama_mk,
      sks: Number(formData.sks),
      prodi_id: Number(formData.prodi_id),
      smt_id: Number(formData.smt_id),
    };

    if (isEditing && selectedId) {
      await supabase.from('mk').update(payload).eq('id', selectedId);
    } else {
      await supabase.from('mk').insert([payload]);
    }

    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus mata kuliah ini?')) return;
    await supabase.from('mk').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Mata Kuliah</h1>
          <p className="text-sm text-gray-500">Daftar mata kuliah, beban SKS, prodi, dan paket semester.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 border rounded-lg bg-white"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          {isAdmin && (
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedId(null);
                setFormData({
                  kode_mk: '',
                  nama_mk: '',
                  sks: 2,
                  prodi_id: prodiOptions[0]?.id ? String(prodiOptions[0].id) : '',
                  smt_id: smtOptions[0]?.id ? String(smtOptions[0].id) : '',
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Tambah MK
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
                <th className="px-6 py-4">Kode MK</th>
                <th className="px-6 py-4">Nama Mata Kuliah</th>
                <th className="px-6 py-4">SKS</th>
                <th className="px-6 py-4">Program Studi</th>
                <th className="px-6 py-4">Semester</th>
                {isAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs">{item.kode_mk || '-'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" /> {item.nama_mk}
                  </td>
                  <td className="px-6 py-4">{item.sks} SKS</td>
                  <td className="px-6 py-4">{item.prodi?.nama_prodi || `-`}</td>
                  <td className="px-6 py-4">Semester {item.semester?.semester || `-`}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setSelectedId(item.id);
                            setFormData({
                              kode_mk: item.kode_mk || '',
                              nama_mk: item.nama_mk,
                              sks: item.sks,
                              prodi_id: String(item.prodi_id),
                              smt_id: String(item.smt_id),
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
            <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">Kode MK</label>
                  <input
                    type="text"
                    placeholder="e.g. IF101"
                    value={formData.kode_mk}
                    onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                    className="w-full text-sm border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">SKS</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.sks}
                    onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
                    className="w-full text-sm border rounded-lg p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Nama Mata Kuliah</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pemrograman Web"
                  value={formData.nama_mk}
                  onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                  className="w-full text-sm border rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Program Studi</label>
                  <select
                    required
                    value={formData.prodi_id}
                    onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })}
                    className="w-full text-sm border rounded-lg p-2"
                  >
                    <option value="" disabled>-- Pilih Prodi --</option>
                    {prodiOptions.map((p) => <option key={p.id} value={p.id}>{p.nama_prodi}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Semester Paket</label>
                  <select
                    required
                    value={formData.smt_id}
                    onChange={(e) => setFormData({ ...formData, smt_id: e.target.value })}
                    className="w-full text-sm border rounded-lg p-2"
                  >
                    <option value="" disabled>-- Pilih SMT --</option>
                    {smtOptions.map((s) => <option key={s.id} value={s.id}>Semester {s.semester}</option>)}
                  </select>
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