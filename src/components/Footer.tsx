// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Send, Heart, ExternalLink, MapPin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-800/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <Monitor className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Kalender<span className="text-indigo-400">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sistem Informasi Monitoring dan Jadwal Penggunaan Laboratorium Komputer Gedung Desain Hub.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>Gedung Desain Hub, ISI Bali</span>
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">Beranda</Link>
              </li>
              <li>
                <Link to="/jadwal" className="hover:text-indigo-400 transition-colors">Jadwal Kuliah</Link>
              </li>
              <li>
                <Link to="/ruangan" className="hover:text-indigo-400 transition-colors">Status Lab & Ruang</Link>
              </li>
              <li>
                <Link to="/pinjam" className="hover:text-indigo-400 transition-colors">Pengajuan Pinjam Lab</Link>
              </li>
            </ul>
          </div>

          {/* Layanan & Integrasi */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Layanan & Integrasi</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
                >
                  <Send className="h-3.5 w-3.5 text-sky-400" />
                  <span>Telegram Bot Notifikasi</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">Portal Pengelola (Admin)</Link>
              </li>
              <li>
                <span className="text-slate-500">Status Sistem: <span className="text-emerald-400 font-medium">Online</span></span>
              </li>
            </ul>
          </div>

          {/* Kontak & Bantuan */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Dukungan</h4>
            <p className="text-xs text-slate-400 mb-3">
              Ada kendala dengan jadwal atau ketersediaan laboratorium? Hubungi Pranata Komputer/Laboran.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="truncate">labkomputer@isi-bali.ac.id</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KalenderHub. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-1">
            <span>Dikelola oleh Pranata Komputer ISI Bali</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;