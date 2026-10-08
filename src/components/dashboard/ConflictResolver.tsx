// src/components/dashboard/ConflictResolver.tsx

import React from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, Loader2, BookOpen, Calendar, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type ScheduleItem, getMkName, getRuangName, getBentrokDetails } from '@/utils/scheduleHelpers';

interface ConflictResolverProps {
  loading: boolean;
  bentrokList: ScheduleItem[];
  scheduleList: ScheduleItem[];
  onOpenDialog: (item: ScheduleItem) => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  loading,
  bentrokList,
  scheduleList,
  onOpenDialog,
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2 ${bentrokList.length > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {bentrokList.length > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Pusat Perbaikan Bentrok</h2>
            <p className="text-xs text-slate-500">
              {bentrokList.length > 0 ? `${bentrokList.length} sesi membutuhkan perhatian` : 'Tidak ditemukan konflik pada jadwal'}
            </p>
          </div>
        </div>
        <Link to="/kelola-jadwal" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700">
          Lihat semua jadwal
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-36 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            Memeriksa konflik...
          </div>
        </div>
      ) : bentrokList.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">Semua jadwal aman</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
            Tidak ada bentrok waktu atau ruangan yang terdeteksi pada data jadwal saat ini.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {bentrokList.slice(0, 5).map((item) => {
            const itemId = item.id ?? item.jadwal_id ?? 0;
            const details = getBentrokDetails(item, scheduleList);
            const conflictCount = details?.length || 0;

            return (
              <button
                key={itemId}
                type="button"
                onClick={() => onOpenDialog(item)}
                className="group flex w-full flex-col gap-4 px-5 py-4 text-left transition hover:bg-red-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="truncate text-sm font-semibold text-slate-900">{getMkName(item)}</p>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    {item.nama_prodi || 'Prodi belum tersedia'}
                    {item.kode_mk && <span className="text-slate-400"> • {item.kode_mk}</span>}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{item.hari || '-'}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />{item.jam_mulai || '-'} - {item.jam_selesai || '-'}</span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700"><MapPin className="h-3.5 w-3.5 text-red-400" />{getRuangName(item)}</span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between gap-4 lg:w-auto lg:min-w-[260px]">
                  <div className="rounded-xl border border-red-100 bg-red-50/70 px-3 py-2.5">
                    <p className="text-xs font-semibold text-red-800">Bentrok dengan</p>
                    <p className="mt-0.5 text-xs text-red-600">{conflictCount} jadwal</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-red-600 transition group-hover:translate-x-0.5">
                    Lihat & Perbaiki
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
          {bentrokList.length > 5 && (
            <div className="bg-slate-50 px-5 py-3 text-center text-xs text-slate-500 sm:px-6">
              Menampilkan 5 dari {bentrokList.length} jadwal bentrok.
              <Link to="/kelola-jadwal" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700">
                Periksa semuanya
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
