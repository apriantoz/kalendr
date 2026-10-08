// src/components/dashboard/QuickActions.tsx

import React from 'react';
import { Calendar, Layers, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-bold text-slate-900">
            Akses Cepat
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Menu yang paling sering digunakan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* KELOLA JADWAL */}
        <Link
          to="/kelola-jadwal"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
          </div>
          <h3 className="mt-4 font-bold text-slate-900">Kelola Jadwal</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Tambah, ubah, dan atur alokasi waktu serta ruangan perkuliahan.
          </p>
        </Link>

        {/* MASTER SEMESTER */}
        <Link
          to="/master-semester"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white">
              <Layers className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-500" />
          </div>
          <h3 className="mt-4 font-bold text-slate-900">Master Semester</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Atur semester aktif dan konfigurasi tahun akademik.
          </p>
        </Link>

        {/* TAMPILAN PUBLIK */}
        <Link
          to="/"
          className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
          </div>
          <h3 className="mt-4 font-bold text-slate-900">Tampilan Publik</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Lihat jadwal seperti yang ditampilkan kepada mahasiswa.
          </p>
        </Link>
      </div>
    </section>
  );
};
