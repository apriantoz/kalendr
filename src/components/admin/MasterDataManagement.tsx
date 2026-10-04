// src/components/admin/MasterDataManagement.tsx
import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Building2,
  GraduationCap,
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import type {
  OptionMK,
  OptionRuang,
  OptionMasterSemester,
} from './JadwalFormModal';

export interface OptionProdi {
  id: number;
  kode_prodi: string;
  nama_prodi: string;
  jenjang: 'D3' | 'D4' | 'S1' | 'S2';
}

interface MasterDataProps {
  initialProdi?: OptionProdi[];
  initialRuang?: OptionRuang[];
  initialMK?: OptionMK[];
  initialSemester?: OptionMasterSemester[];
}

type TabType = 'prodi' | 'ruang' | 'mk' | 'semester';

export const MasterDataManagement: React.FC<MasterDataProps> = ({
  initialProdi = [
    { id: 1, kode_prodi: 'DKV', nama_prodi: 'Desain Komunikasi Visual', jenjang: 'S1' },
    { id: 2, kode_prodi: 'DI', nama_prodi: 'Desain Interior', jenjang: 'S1' },
    { id: 3, kode_prodi: 'ANIM', nama_prodi: 'Animasi', jenjang: 'D4' },
  ],
  initialRuang = [
    { id: 1, nama_ruang: 'Lab Mac 1', kapasitas: 30 },
    { id: 2, nama_ruang: 'Lab Render 3D', kapasitas: 25 },
    { id: 3, nama_ruang: 'Lab Studio Fotografi', kapasitas: 20 },
  ],
  initialMK = [
    { id: 1, kode_mk: 'DKV301', nama_mk: 'Desain Komunikasi Visual III', sks: 4, smt_id: 3, prodi_id: 1 },
    { id: 2, kode_mk: 'ANIM202', nama_mk: '3D Character Rigging', sks: 3, smt_id: 4, prodi_id: 3 },
  ],
  initialSemester = [
    { id: 1, tahun_ajaran: '2025/2026', tipe_semester: 'Ganjil', is_active: false },
    { id: 2, tahun_ajaran: '2025/2026', tipe_semester: 'Genap', is_active: true },
  ],
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('prodi');
  const [searchQuery, setSearchQuery] = useState('');

  // Local State for Master Data
  const [prodiList, setProdiList] = useState<OptionProdi[]>(initialProdi);
  const [ruangList, setRuangList] = useState<OptionRuang[]>(initialRuang);
  const [mkList, setMkList] = useState<OptionMK[]>(initialMK);
  const [semesterList, setSemesterList] = useState<OptionMasterSemester[]>(initialSemester);

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    // Prodi
    kode_prodi: '',
    nama_prodi: '',
    jenjang: 'S1' as 'D3' | 'D4' | 'S1' | 'S2',
    // Ruang
    nama_ruang: '',
    kapasitas: 30,
    // MK
    kode_mk: '',
    nama_mk: '',
    sks: 3,
    smt_id: 1,
    prodi_id: 1,
    // Semester
    tahun_ajaran: '2025/2026',
    tipe_semester: 'Ganjil' as 'Ganjil' | 'Genap' | 'Antara',
    is_active: false,
  });

  // Map untuk lookup nama prodi di tabel MK
  const prodiMap = useMemo(() => new Map(prodiList.map((p) => [p.id, p])), [prodiList]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      kode_prodi: '',
      nama_prodi: '',
      jenjang: 'S1',
      nama_ruang: '',
      kapasitas: 30,
      kode_mk: '',
      nama_mk: '',
      sks: 3,
      smt_id: 1,
      prodi_id: prodiList[0]?.id || 1,
      tahun_ajaran: '2025/2026',
      tipe_semester: 'Ganjil',
      is_active: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData((prev) => ({ ...prev, ...item }));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Date.now();

    if (activeTab === 'prodi') {
      if (editingItem) {
        setProdiList((prev) =>
          prev.map((p) => (p.id === editingItem.id ? { ...p, ...formData } : p))
        );
      } else {
        setProdiList((prev) => [
          ...prev,
          { id: newId, kode_prodi: formData.kode_prodi, nama_prodi: formData.nama_prodi, jenjang: formData.jenjang },
        ]);
      }
    } else if (activeTab === 'ruang') {
      if (editingItem) {
        setRuangList((prev) =>
          prev.map((r) => (r.id === editingItem.id ? { ...r, ...formData } : r))
        );
      } else {
        setRuangList((prev) => [
          ...prev,
          { id: newId, nama_ruang: formData.nama_ruang, kapasitas: Number(formData.kapasitas) },
        ]);
      }
    } else if (activeTab === 'mk') {
      if (editingItem) {
        setMkList((prev) =>
          prev.map((m) =>
            m.id === editingItem.id
              ? {
                  ...m,
                  kode_mk: formData.kode_mk,
                  nama_mk: formData.nama_mk,
                  sks: Number(formData.sks),
                  smt_id: Number(formData.smt_id),
                  prodi_id: Number(formData.prodi_id),
                }
              : m
          )
        );
      } else {
        setMkList((prev) => [
          ...prev,
          {
            id: newId,
            kode_mk: formData.kode_mk,
            nama_mk: formData.nama_mk,
            sks: Number(formData.sks),
            smt_id: Number(formData.smt_id),
            prodi_id: Number(formData.prodi_id),
          },
        ]);
      }
    } else if (activeTab === 'semester') {
      if (formData.is_active) {
        setSemesterList((prev) => prev.map((s) => ({ ...s, is_active: false })));
      }
      if (editingItem) {
        setSemesterList((prev) =>
          prev.map((s) => (s.id === editingItem.id ? { ...s, ...formData } : s))
        );
      } else {
        setSemesterList((prev) => [
          ...prev,
          {
            id: newId,
            tahun_ajaran: formData.tahun_ajaran,
            tipe_semester: formData.tipe_semester,
            is_active: formData.is_active,
          },
        ]);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    if (activeTab === 'prodi') setProdiList((prev) => prev.filter((p) => p.id !== deletingId));
    if (activeTab === 'ruang') setRuangList((prev) => prev.filter((r) => r.id !== deletingId));
    if (activeTab === 'mk') setMkList((prev) => prev.filter((m) => m.id !== deletingId));
    if (activeTab === 'semester') setSemesterList((prev) => prev.filter((s) => s.id !== deletingId));
    setDeletingId(null);
  };

  const filteredProdi = useMemo(
    () =>
      prodiList.filter(
        (p) =>
          p.nama_prodi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.kode_prodi.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [prodiList, searchQuery]
  );

  const filteredRuang = useMemo(
    () => ruangList.filter((r) => r.nama_ruang.toLowerCase().includes(searchQuery.toLowerCase())),
    [ruangList, searchQuery]
  );

  const filteredMK = useMemo(
    () =>
      mkList.filter(
        (m) =>
          m.nama_mk.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.kode_mk && m.kode_mk.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [mkList, searchQuery]
  );

  const filteredSemester = useMemo(
    () =>
      semesterList.filter(
        (s) =>
          s.tahun_ajaran.includes(searchQuery) ||
          s.tipe_semester.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [semesterList, searchQuery]
  );

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Kelola Master Data</h2>
          <p className="text-xs text-slate-400">
            Manajemen entitas program studi, laboratorium, mata kuliah, dan periode semester.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Data</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => { setActiveTab('prodi'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'prodi'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Program Studi ({prodiList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('ruang'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'ruang'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Laboratorium ({ruangList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('mk'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'mk'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Mata Kuliah ({mkList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('semester'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'semester'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Periode Semester ({semesterList.length})</span>
        </button>
      </div>

      {/* Control Search Bar */}
      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Cari di ${activeTab.toUpperCase()}...`}
          className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Dynamic Table Container */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              {activeTab === 'prodi' && (
                <tr>
                  <th className="py-3.5 px-4">Kode</th>
                  <th className="py-3.5 px-4">Nama Program Studi</th>
                  <th className="py-3.5 px-4">Jenjang</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              )}
              {activeTab === 'ruang' && (
                <tr>
                  <th className="py-3.5 px-4">Nama Laboratorium</th>
                  <th className="py-3.5 px-4">Kapasitas PC</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              )}
              {activeTab === 'mk' && (
                <tr>
                  <th className="py-3.5 px-4">Kode MK</th>
                  <th className="py-3.5 px-4">Nama Mata Kuliah</th>
                  <th className="py-3.5 px-4">Program Studi</th>
                  <th className="py-3.5 px-4">SKS</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              )}
              {activeTab === 'semester' && (
                <tr>
                  <th className="py-3.5 px-4">Tahun Ajaran</th>
                  <th className="py-3.5 px-4">Tipe Semester</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {/* TAB PROGRAM STUDI */}
              {activeTab === 'prodi' &&
                filteredProdi.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">{item.kode_prodi}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{item.nama_prodi}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                        {item.jenjang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openEditModal(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* TAB RUANGAN */}
              {activeTab === 'ruang' &&
                filteredRuang.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{item.nama_ruang}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{item.kapasitas} Unit PC</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openEditModal(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* TAB MATA KULIAH */}
              {activeTab === 'mk' &&
                filteredMK.map((item) => {
                  const prodi = prodiMap.get(item.prodi_id);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-indigo-400">{item.kode_mk || '-'}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{item.nama_mk}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{prodi?.kode_prodi || '-'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{item.sks} SKS</td>
                      <td className="py-3.5 px-4 text-slate-300">Semester {item.smt_id}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openEditModal(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {/* TAB SEMESTER */}
              {activeTab === 'semester' &&
                filteredSemester.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{item.tahun_ajaran}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-300">{item.tipe_semester}</td>
                    <td className="py-3.5 px-4">
                      {item.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                          <CheckCircle2 className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Non-aktif</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openEditModal(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Upsert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-white">
              {editingItem ? 'Edit Data' : 'Tambah Data'} {activeTab.toUpperCase()}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              {activeTab === 'prodi' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Kode Prodi</label>
                    <input
                      type="text"
                      required
                      value={formData.kode_prodi}
                      onChange={(e) => setFormData({ ...formData, kode_prodi: e.target.value })}
                      placeholder="Contoh: DKV"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Program Studi</label>
                    <input
                      type="text"
                      required
                      value={formData.nama_prodi}
                      onChange={(e) => setFormData({ ...formData, nama_prodi: e.target.value })}
                      placeholder="Contoh: Desain Komunikasi Visual"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Jenjang</label>
                    <select
                      value={formData.jenjang}
                      onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="D3">D3</option>
                      <option value="D4">D4</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'ruang' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Laboratorium</label>
                    <input
                      type="text"
                      required
                      value={formData.nama_ruang}
                      onChange={(e) => setFormData({ ...formData, nama_ruang: e.target.value })}
                      placeholder="Contoh: Lab Mac 2"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Kapasitas PC</label>
                    <input
                      type="number"
                      required
                      value={formData.kapasitas}
                      onChange={(e) => setFormData({ ...formData, kapasitas: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {activeTab === 'mk' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Program Studi</label>
                    <select
                      value={formData.prodi_id}
                      onChange={(e) => setFormData({ ...formData, prodi_id: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      {prodiList.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900">
                          {p.kode_prodi} - {p.nama_prodi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Kode MK</label>
                    <input
                      type="text"
                      required
                      value={formData.kode_mk}
                      onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                      placeholder="Contoh: DKV401"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Mata Kuliah</label>
                    <input
                      type="text"
                      required
                      value={formData.nama_mk}
                      onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                      placeholder="Contoh: Tipografi Lanjut"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Jumlah SKS</label>
                      <input
                        type="number"
                        required
                        value={formData.sks}
                        onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Semester Target</label>
                      <input
                        type="number"
                        required
                        value={formData.smt_id}
                        onChange={(e) => setFormData({ ...formData, smt_id: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'semester' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Tahun Ajaran</label>
                    <input
                      type="text"
                      required
                      value={formData.tahun_ajaran}
                      onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                      placeholder="Contoh: 2026/2027"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tipe Semester</label>
                    <select
                      value={formData.tipe_semester}
                      onChange={(e) => setFormData({ ...formData, tipe_semester: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                      <option value="Antara">Antara</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-0"
                    />
                    <label htmlFor="is_active" className="text-slate-300">
                      Set sebagai Periode Semester Aktif
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus</h3>
              <p className="text-xs text-slate-400">
                Apakah Anda yakin ingin menghapus data master ini?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-lg shadow-rose-600/20"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataManagement;