// src/components/AppPreview.tsx
import React from 'react';
import { Monitor, Shield, Zap, Sparkles } from 'lucide-react';

export const AppPreview: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 bg-slate-950 text-slate-100 font-sans border-b border-slate-800/80 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Prinjau Antarmuka</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Akses Cepat & Responsif di Berbagai Perangkat
            </h2>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Tampilan dirancang optimal baik untuk pemantauan via monitor aula gedung maupun penggunaan langsung melalui ponsel mahasiswa dan dosen.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ringan & Tanpa Reload</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Memuat data jadwal instan dengan integrasi Supabase *real-time subscription*.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Validitas Pemakaian Lab</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mencegah bentrokan jadwal praktikum antar program studi secara otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Mockup Column */}
          <div className="lg:col-span-7">
            <div className="relative mx-auto rounded-2xl bg-slate-900 p-3 border border-slate-800 shadow-2xl shadow-indigo-500/10 group">
              {/* Fake Window Header */}
              <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono">kalenderhub.isi-bali.ac.id</div>
                <div className="w-12" />
              </div>

              {/* Mockup Dashboard Preview */}
              <div className="mt-3 rounded-xl bg-slate-950 p-4 border border-slate-800/60 space-y-4 text-xs font-sans">
                {/* Simulated Header */}
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-indigo-400" />
                    <span className="font-bold text-white">Lab Komputer Desain 01</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                    Sedang Terpakai
                  </span>
                </div>

                {/* Simulated Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500">08:00 - 10:30 WITA</span>
                    <p className="font-semibold text-slate-200 truncate">Desain Grafis II</p>
                    <p className="text-[10px] text-indigo-400">Desain Komunikasi Visual</p>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500">10:30 - 13:00 WITA</span>
                    <p className="font-semibold text-slate-200 truncate">Pemrograman Web</p>
                    <p className="text-[10px] text-indigo-400">Desain Mode</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AppPreview;