// src/pages/HomePage.tsx
import React, { useState, useMemo } from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import AppPreview from '../components/AppPreview';
import CalendarGrid, { type JadwalItem } from '../components/CalendarGrid';
import Footer from '@/components/Footer';

// Data Sampel / Fallback Jadwal
const MOCK_JADWAL: JadwalItem[] = [
  {
    id: '1',
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '10:30',
    nama_mk: 'Desain Komunikasi Visual II',
    prodi: 'Desain Komunikasi Visual',
    dosen: 'I Made Design, S.Sn., M.Sn.',
    ruang: 'Lab Komputer 01',
  },
  {
    id: '2',
    hari: 'Senin',
    jam_mulai: '10:30',
    jam_selesai: '13:00',
    nama_mk: 'Pemrograman Web Interactive',
    prodi: 'Desain Mode / Fashion',
    dosen: 'Dr. Wayan Tech, S.Kom., M.T.',
    ruang: 'Lab Komputer 02',
  },
  {
    id: '3',
    hari: 'Selasa',
    jam_mulai: '08:00',
    jam_selesai: '11:20',
    nama_mk: '3D Modeling & Animasi Base',
    prodi: 'Animasi',
    dosen: 'Kadek Render, M.Sn.',
    ruang: 'Lab Komputer 03',
  },
  {
    id: '4',
    hari: 'Rabu',
    jam_mulai: '09:00',
    jam_selesai: '11:30',
    nama_mk: 'Typografi & Tata Letak Digital',
    prodi: 'Desain Komunikasi Visual',
    dosen: 'Nyoman Letter, S.Des.',
    ruang: 'Lab Komputer 01',
  },
  {
    id: '5',
    hari: 'Rabu',
    jam_mulai: '13:00',
    jam_selesai: '15:30',
    nama_mk: 'Editing Video & Pascaproduksi',
    prodi: 'Film dan Televisi',
    dosen: 'Ketut Cinema, M.Sn.',
    ruang: 'Lab Komputer Mac',
  },
  {
    id: '6',
    hari: 'Kamis',
    jam_mulai: '08:00',
    jam_selesai: '10:30',
    nama_mk: 'UI/UX Mobile App Design',
    prodi: 'Desain Komunikasi Visual',
    dosen: 'Putu Figma, S.Kom., M.T.',
    ruang: 'Lab Komputer 02',
  },
];

export const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHari, setSelectedHari] = useState('Semua');

  // Filter Jadwal berdasarkan kata kunci pencarian dan filter hari
  const filteredJadwal = useMemo(() => {
    return MOCK_JADWAL.filter((item) => {
      // Match Hari
      const matchHari = selectedHari === 'Semua' || item.hari === selectedHari;

      // Match Search Keyword (Nama MK, Prodi, Dosen, atau Ruang)
      const query = searchTerm.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.nama_mk.toLowerCase().includes(query) ||
        item.prodi.toLowerCase().includes(query) ||
        item.dosen.toLowerCase().includes(query) ||
        item.ruang.toLowerCase().includes(query);

      return matchHari && matchQuery;
    });
  }, [searchTerm, selectedHari]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Hero Section dengan Pencarian & Quick Filter */}
      <HeroSection
        onSearchChange={(val) => setSearchTerm(val)}
        selectedHari={selectedHari}
        onHariChange={(hari) => setSelectedHari(hari)}
      />

      {/* 2. Pratinjau Grid Jadwal Aktif */}
      <section className="py-12 md:py-16 bg-slate-950/90 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Jadwal Penggunaan Lab
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Menampilkan jadwal praktikum perkuliahan minggu ini di Gedung Desain Hub
              </p>
            </div>
            
            {(searchTerm || selectedHari !== 'Semua') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedHari('Semua');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium self-start sm:self-auto underline underline-offset-4"
              >
                Reset Filter
              </button>
            )}
          </div>

          <CalendarGrid
            jadwalList={filteredJadwal}
            selectedHari={selectedHari}
          />
        </div>
      </section>

      {/* 3. Fitur-Fitur Utama */}
      <FeaturesSection />

      {/* 4. App Preview / Fitur Multiperangkat */}
      <AppPreview />

      {/* 5. Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;