// src/pages/MasterDataPage.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Plus, Edit, Trash2, Loader2, RefreshCw, Building, BookOpen, MapPin } from 'lucide-react';

type TabType = 'ruang' | 'prodi' | 'mk';

interface RuangItem {
  id: number;
  nama_ruang: string;
  kapasitas?: number;
  tipe_ruang_id: number;
  tipe_ruang?: { tipe_ruang?: string };
}

interface TipeRuangItem {
  id: number;
  tipe_ruang: string;
}

interface ProdiItem {
  id: number;
  kode_prodi: string;
  nama_prodi: string;
}

interface SemesterItem {
  id: number;
  semester?: string; // Sesuaikan dengan kolom nama semester di tabel semester Anda
}

interface MkItem {
  id: number;
  kode_mk: string;
  nama_mk: string;
  sks: number;
  smt_id?: number;
  semester?: { semester?: string };
  prodi_id?: number;
  prodi?: { nama_prodi?: string };
}

export const MasterDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ruang');
  const [loading, setLoading] = useState<boolean>(true);

  // Data States
  const [ruangList, setRuangList] = useState<RuangItem[]>([]);
  const [tipeRuangList, setTipeRuangList] = useState<TipeRuangItem[]>([]);
  const [prodiList, setProdiList] = useState<ProdiItem[]>([]);
  const [semesterList, setSemesterList] = useState<SemesterItem[]>([]);
  const [mkList, setMkList] = useState<MkItem[]>([]);

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form States
  const [formRuang, setFormRuang] = useState({ nama_ruang: '', kapasitas: '', tipe_ruang_id: '' });
  const [formProdi, setFormProdi] = useState({ kode_prodi: '', nama_prodi: '' });
  const [formMk, setFormMk] = useState({ kode_mk: '', nama_mk: '', sks: '2', smt_id: '', prodi_id: '' });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ruang') {
        const [ruangRes, tipeRuangRes] = await Promise.all([
          supabase.from('ruang').select('*, tipe_ruang(tipe_ruang)').order('id', { ascending: true }),
          supabase.from('tipe_ruang').select('*').order('id', { ascending: true })
        ]);
        setRuangList(ruangRes.data || []);
        setTipeRuangList(tipeRuangRes.data || []);
      } else if (activeTab === 'prodi') {
        const { data } = await supabase.from('prodi').select('*').order('id', { ascending: true });
        setProdiList(data || []);
      } else if (activeTab === 'mk') {
        const [mkRes, prodiRes, smtRes] = await Promise.all([
          supabase.from('mk').select('*, prodi(nama_prodi), semester(semester)').order('id', { ascending: true }),
          supabase.from('prodi').select('*').order('id', { ascending: true }),
          supabase.from('semester').select('*').order('id', { ascending: true })
        ]);
        setMkList(mkRes.data || []);
        setProdiList(prodiRes.data || []);
        setSemesterList(smtRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Open Modal Add
  const handleOpenAdd = async () => {
    setIsEditing(false);
    setSelectedId(null);
    
    let currentTipeRuang = tipeRuangList;
    if (currentTipeRuang.length === 0) {
      const { data } = await supabase.from('tipe_ruang').select('*').order('id', { ascending: true });
      currentTipeRuang = data || [];
      setTipeRuangList(currentTipeRuang);
    }

    let currentProdi = prodiList;
    if (currentProdi.length === 0) {
      const { data } = await supabase.from('prodi').select('*').order('id', { ascending: true });
      currentProdi = data || [];
      setProdiList(currentProdi);
    }

    let currentSemester = semesterList;
    if (currentSemester.length === 0) {
      const { data } = await supabase.from('semester').select('*').order('id', { ascending: true });
      currentSemester = data || [];
      setSemesterList(currentSemester);
    }

    setFormRuang({ 
      nama_ruang: '', 
      kapasitas: '', 
      tipe_ruang_id: currentTipeRuang[0]?.id ? String(currentTipeRuang[0].id) : '' 
    });
    setFormProdi({ kode_prodi: '', nama_prodi: '' });
    setFormMk({ 
      kode_mk: '', 
      nama_mk: '', 
      sks: '2', 
      smt_id: currentSemester[0]?.id ? String(currentSemester[0].id) : '', 
      prodi_id: currentProdi[0]?.id ? String(currentProdi[0].id) : '' 
    });
    setShowModal(true);
  };

  // Open Modal Edit
  const handleOpenEdit = async (item: any) => {
    setIsEditing(true);
    setSelectedId(item.id);

    // Pastikan data pendukung terisi untuk dropdown saat edit
    if (semesterList.length === 0) {
      const { data } = await supabase.from('semester').select('*').order('id', { ascending: true });
      setSemesterList(data || []);
    }
    if (prodiList.length === 0) {
      const { data } = await supabase.from('prodi').select('*').order('id', { ascending: true });
      setProdiList(data || []);
    }

    if (activeTab === 'ruang') {
      setFormRuang({
        nama_ruang: item.nama_ruang || '',
        kapasitas: item.kapasitas ? String(item.kapasitas) : '',
        tipe_ruang_id: item.tipe_ruang_id ? String(item.tipe_ruang_id) : ''
      });
    } else if (activeTab === 'prodi') {
      setFormProdi({
        kode_prodi: item.kode_prodi || '',
        nama_prodi: item.nama_prodi || ''
      });
    } else if (activeTab === 'mk') {
      setFormMk({
        kode_mk: item.kode_mk || '',
        nama_mk: item.nama_mk || '',
        sks: String(item.sks || 2),
        smt_id: item.smt_id ? String(item.smt_id) : '',
        prodi_id: item.prodi_id ? String(item.prodi_id) : ''
      });
    }
    setShowModal(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let table = activeTab;
      let payload: any = {};

      if (activeTab === 'ruang') {
        payload = {
          nama_ruang: formRuang.nama_ruang,
          kapasitas: formRuang.kapasitas ? Number(formRuang.kapasitas) : 0,
          tipe_ruang_id: formRuang.tipe_ruang_id ? Number(formRuang.tipe_ruang_id) : null
        };
      } else if (activeTab === 'prodi') {
        payload = {
          kode_prodi: formProdi.kode_prodi,
          nama_prodi: formProdi.nama_prodi
        };
      } else if (activeTab === 'mk') {
        payload = {
          kode_mk: formMk.kode_mk,
          nama_mk: formMk.nama_mk,
          sks: Number(formMk.sks),
          smt_id: formMk.smt_id ? Number(formMk.smt_id) : null,
          prodi_id: formMk.prodi_id ? Number(formMk.prodi_id) : null
        };
      }

      if (isEditing && selectedId) {
        const { error } = await supabase.from(table).update(payload).eq('id', selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([payload]);
        if (error) throw error;
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Data
  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    try {
      const { error } = await supabase.from(activeTab).delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert('Gagal menghapus data: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master Data Akademik</h1>
          <p className="text-sm text-slate-500">Kelola data Ruangan, Program Studi (Prodi), dan Mata Kuliah (MK).</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition shadow-xs">
            <Plus className="w-4 h-4" />
            Tambah Data {activeTab.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('ruang')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'ruang' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" /> Data Ruangan
        </button>

        <button
          onClick={() => setActiveTab('prodi')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'prodi' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" /> Program Studi
        </button>

        <button
          onClick={() => setActiveTab('mk')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'mk' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Mata Kuliah
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm">Memuat data master...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* TAB RUANGAN */}
            {activeTab === 'ruang' && (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Nama Ruangan</th>
                    <th className="px-6 py-4">Tipe Ruang</th>
                    <th className="px-6 py-4">Kapasitas</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ruangList.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Belum ada data ruangan.</td></tr>
                  ) : (
                    ruangList.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">{r.nama_ruang}</td>
                        <td className="px-6 py-4">{r.tipe_ruang?.tipe_ruang || '-'}</td>
                        <td className="px-6 py-4">{r.kapasitas ? `${r.kapasitas} Kursi` : '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenEdit(r)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB PRODI */}
            {activeTab === 'prodi' && (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Kode Prodi</th>
                    <th className="px-6 py-4">Nama Program Studi</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prodiList.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Belum ada data prodi.</td></tr>
                  ) : (
                    prodiList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono font-semibold text-indigo-600">{p.kode_prodi}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{p.nama_prodi}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* TAB MATA KULIAH */}
            {activeTab === 'mk' && (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Kode MK</th>
                    <th className="px-6 py-4">Nama Mata Kuliah</th>
                    <th className="px-6 py-4">SKS</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4">Prodi</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mkList.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Belum ada data mata kuliah.</td></tr>
                  ) : (
                    mkList.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono font-semibold text-indigo-600">{m.kode_mk || '-'}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{m.nama_mk}</td>
                        <td className="px-6 py-4">{m.sks} SKS</td>
                        <td className="px-6 py-4">{m.semester?.semester || `-`}</td>
                        <td className="px-6 py-4">{m.prodi?.nama_prodi || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenEdit(m)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">
              {isEditing ? `Edit ${activeTab.toUpperCase()}` : `Tambah ${activeTab.toUpperCase()} Baru`}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FORM RUANGAN */}
              {activeTab === 'ruang' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Nama Ruangan</label>
                    <input type="text" required placeholder="Contoh: Lab Komputer A" value={formRuang.nama_ruang} onChange={(e) => setFormRuang({ ...formRuang, nama_ruang: e.target.value })} className="w-full text-sm border rounded-xl p-2.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Tipe Ruang</label>
                      <select required value={formRuang.tipe_ruang_id} onChange={(e) => setFormRuang({ ...formRuang, tipe_ruang_id: e.target.value })} className="w-full text-sm border rounded-xl p-2.5">
                        <option value="">- Pilih Tipe -</option>
                        {tipeRuangList.map((t) => (
                          <option key={t.id} value={t.id}>{t.tipe_ruang}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Kapasitas Kursi</label>
                      <input type="number" placeholder="30" value={formRuang.kapasitas} onChange={(e) => setFormRuang({ ...formRuang, kapasitas: e.target.value })} className="w-full text-sm border rounded-xl p-2.5" />
                    </div>
                  </div>
                </>
              )}

              {/* FORM PRODI */}
              {activeTab === 'prodi' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Kode Prodi</label>
                    <input type="text" required placeholder="Contoh: ANIM" value={formProdi.kode_prodi} onChange={(e) => setFormProdi({ ...formProdi, kode_prodi: e.target.value })} className="w-full text-sm border rounded-xl p-2.5" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Nama Program Studi</label>
                    <input type="text" required placeholder="Contoh: Desain Komunikasi Visual" value={formProdi.nama_prodi} onChange={(e) => setFormProdi({ ...formProdi, nama_prodi: e.target.value })} className="w-full text-sm border rounded-xl p-2.5" />
                  </div>
                </>
              )}

              {/* FORM MATA KULIAH */}
              {activeTab === 'mk' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold mb-1">Kode MK</label>
                      <input type="text" placeholder="ANIM101" value={formMk.kode_mk} onChange={(e) => setFormMk({ ...formMk, kode_mk: e.target.value })} className="w-full text-sm border rounded-xl p-2.5" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1">Nama Mata Kuliah</label>
                      <input type="text" required placeholder="Animasi 2D" value={formMk.nama_mk} onChange={(e) => setFormMk({ ...formMk, nama_mk: e.target.value })} className="w-full text-sm border rounded-xl p-2.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Jumlah SKS</label>
                      <input type="number" required min="1" max="6" value={formMk.sks} onChange={(e) => setFormMk({ ...formMk, sks: e.target.value })} className="w-full text-sm border rounded-xl p-2.5" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Semester</label>
                      <select required value={formMk.smt_id} onChange={(e) => setFormMk({ ...formMk, smt_id: e.target.value })} className="w-full text-sm border rounded-xl p-2.5">
                        <option value="">- Pilih -</option>
                        {semesterList.map((s) => (
                          <option key={s.id} value={s.id}>{s.semester || `Semester ${s.id}`}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Prodi</label>
                      <select required value={formMk.prodi_id} onChange={(e) => setFormMk({ ...formMk, prodi_id: e.target.value })} className="w-full text-sm border rounded-xl p-2.5">
                        <option value="">- Pilih -</option>
                        {prodiList.map((p) => (
                          <option key={p.id} value={p.id}>{p.kode_prodi} - {p.nama_prodi}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200">Batal</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
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