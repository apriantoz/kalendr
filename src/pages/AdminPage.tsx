import { useState } from 'react';
import JadwalTable from '../components/admin/JadwalTable';
import JadwalFormModal from '../components/admin/JadwalFormModal';
import MasterDataManagement from '../components/admin/MasterDataManagement';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'master'>('jadwal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<any>(null);

  // Handlers untuk modal
  const handleOpenAddModal = () => {
    setSelectedJadwal(null);
    setIsModalOpen(true);
  };

  const handleEditJadwal = (item: any) => {
    setSelectedJadwal(item);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    // Dipanggil setelah modal berhasil menyimpan/memperbarui data
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Admin Panel Kalendr</h1>
          <p className="text-xs text-slate-400">Pengelolaan jadwal lab dan data master</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === 'jadwal' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Kelola Jadwal
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              activeTab === 'master' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Master Data
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'jadwal' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
            >
              + Tambah Jadwal
            </button>
          </div>

          {/* Fixed: JadwalTable Props */}
        </div>
      ) : (
        <MasterDataManagement />
      )}

      {/* Fixed: JadwalFormModal Props */}
      <JadwalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedJadwal}
        onSuccess={handleSuccess}
        listMK={[]}
        listRuang={[]}
        listMasterSemester={[]}
        existingJadwalList={[]}
      />
    </div>
  );
}