// src/components/FeaturesSection.tsx
import React from 'react';
import {
  Calendar,
  Monitor,
  Bell,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, tag }) => (
  <div className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/90 transition-all duration-300 shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between">
    {/* Subtle Inner Glow on Hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

    <div className="relative z-10 space-y-4">
      {/* Icon & Tag */}
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all">
          {icon}
        </div>
        {tag && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
            {tag}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Jadwal Kuliah Interaktif',
      description:
        'Lihat pemakaian ruang per hari, minggu, atau semester secara terstruktur tanpa perlu login.',
      tag: 'Publik',
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      title: 'Status Ruang Real-time',
      description:
        'Pantau laboratorium mana yang sedang terpakai, kosong, atau dalam perawatan secara langsung.',
      tag: 'Live Monitoring',
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Notifikasi Telegram',
      description:
        'Pengingat otomatis dan pengumuman perubahan jadwal lab dikirimkan langsung via Telegram Bot.',
      tag: 'Otomatis',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Peminjaman Ruang Lab',
      description:
        'Proses pengajuan peminjaman lab untuk kegiatan luar jadwal reguler dengan persetujuan admin.',
      tag: 'Layanan',
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Pencarian & Filter Cepat',
      description:
        'Cari mata kuliah, nama dosen, program studi, atau nomor lab dalam hitungan detik.',
      tag: 'Pencarian',
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: 'Sistem Terpusat & Valid',
      description:
        'Data jadwal terintegrasi langsung dengan database laboratorium Gedung Desain Hub.',
      tag: 'Data Terintegrasi',
    },
  ];

  return (
    <section className="relative py-16 md:py-24 bg-slate-950 text-slate-100 font-sans border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
            Fitur Utama
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Segala Akses Lab Komputer dalam Satu Pintasan
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Dirancang untuk mempermudah mahasiswa, dosen, dan pengelola laboratorium memantau aktivitas ruang secara efisien.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              tag={feature.tag}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;