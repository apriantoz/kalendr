// src/components/CalendarGrid.tsx
import React from 'react';
import { Clock, MapPin, User, BookOpen, AlertCircle } from 'lucide-react';

export interface JadwalItem {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  nama_mk: string;
  prodi: string;
  dosen: string;
  ruang: string;
  tipe_ruang?: string;
}

interface CalendarGridProps {
  jadwalList: JadwalItem[];
  selectedHari?: string;
  isLoading?: boolean;
}

const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  jadwalList,
  selectedHari = 'Semua',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="w-full py-16 text-center text-slate-500 animate-pulse">
        <p className="text-sm font-medium">Memuat jadwal laboratorium...</p>
      </div>
    );
  }

  if (!jadwalList || jadwalList.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
        <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-300">Tidak ada jadwal ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter hari.</p>
      </div>
    );
  }

  // Filter berdasarkan hari jika 'Semua' tidak dipilih
  const activeHariList =
    selectedHari === 'Semua'
      ? HARI_ORDER.filter((h) => jadwalList.some((item) => item.hari === h))
      : [selectedHari];

  return (
    <div className="space-y-8 font-sans">
      {activeHariList.map((hari) => {
        const itemsForHari = jadwalList
          .filter((item) => item.hari === hari)
          .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));

        if (itemsForHari.length === 0) return null;

        return (
          <div key={hari} className="space-y-4">
            {/* Header Hari */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                {hari}
              </span>
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-xs text-slate-500 font-medium">
                {itemsForHari.length} Sesi
              </span>
            </div>

            {/* Grid Kartu Jadwal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemsForHari.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-lg flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Badge Jam & Ruang */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{item.jam_mulai} - {item.jam_selesai}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-medium bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/60">
                        <MapPin className="h-3.5 w-3.5 text-rose-400" />
                        <span>{item.ruang}</span>
                      </div>
                    </div>

                    {/* Nama Mata Kuliah */}
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                        {item.nama_mk}
                      </h4>
                      <p className="text-xs text-indigo-400 font-medium mt-1 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{item.prodi}</span>
                      </p>
                    </div>
                  </div>

                  {/* Info Dosen */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                    <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{item.dosen || 'Dosen Pengampu'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;