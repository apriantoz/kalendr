// src/components/HeroSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Monitor,
  Search,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react';

interface HeroSectionProps {
  onSearchChange?: (term: string) => void;
  selectedHari?: string;
  onHariChange?: (hari: string) => void;
}

const HARI_LIST = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchChange,
  selectedHari = 'Semua',
  onHariChange,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-slate-950 text-slate-100 font-sans border-b border-slate-800/80">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[300px] h-[200px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>Sistem Informasi & Jadwal Laboratorium Computer</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Pantau Penggunaan <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Lab Komputer & Ruangan
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Cek ketersediaan ruang, jadwal praktikum mata kuliah, dan informasi perkuliahan secara *real-time* dan transparan.
          </p>

          {/* Feature Highlights / Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>12 Laboratorium Aktif</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Update Real-time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Akses Publik Bebas Login</span>
            </div>
          </div>

          {/* Search & Filter Bar Section */}
          <div className="pt-6 max-w-2xl mx-auto">
            <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row gap-2">
              
              {/* Input Pencarian */}
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari mata kuliah, prodi, atau nama lab..."
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Quick Action Button */}
              <Link
                to="/ruangan"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Monitor className="h-4 w-4" />
                <span>Status Ruang</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Quick Filter Hari */}
            {onHariChange && (
              <div className="mt-4 flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-xs text-slate-500 flex items-center gap-1 mr-1 shrink-0">
                  <Clock className="h-3.5 w-3.5" /> Hari:
                </span>
                {HARI_LIST.map((hari) => (
                  <button
                    key={hari}
                    onClick={() => onHariChange(hari)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      selectedHari === hari
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {hari}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;