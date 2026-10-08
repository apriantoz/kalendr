// src/components/dashboard/ConflictDialog.tsx

import React from 'react';
import { AlertTriangle, X, BookOpen, Calendar, Clock, MapPin, Edit, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type ScheduleItem, getMkName, getRuangName } from '@/utils/scheduleHelpers';

interface ConflictDialogProps {
  selectedConflict: ScheduleItem;
  conflictDetails: ScheduleItem[];
  onClose: () => void;
  onEdit: (item: ScheduleItem) => void;
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  selectedConflict,
  conflictDetails,
  onClose,
  onEdit,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-dialog-title"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="shrink-0 rounded-xl bg-red-50 p-2.5 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="conflict-dialog-title" className="font-bold text-slate-900">Bentrok Jadwal</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Ditemukan {conflictDetails.length} jadwal yang bertabrakan dengan jadwal ini.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-white p-2 text-red-600 shadow-sm">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">Jadwal Dipilih</span>
                  {selectedConflict.kode_mk && <span className="text-[11px] font-medium text-red-500">{selectedConflict.kode_mk}</span>}
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900">{getMkName(selectedConflict)}</h3>
                <p className="mt-0.5 text-xs font-medium text-slate-600">{selectedConflict.nama_prodi || 'Prodi belum tersedia'}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-red-400" />{selectedConflict.hari || '-'}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-red-400" />{selectedConflict.jam_mulai || '-'} – {selectedConflict.jam_selesai || '-'}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-red-400" />{getRuangName(selectedConflict)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-red-500">Bentrok dengan</span>
            </div>
          </div>

          <div className="space-y-3">
            {conflictDetails.map((conflictItem, index) => (
              <div key={conflictItem.id ?? conflictItem.jadwal_id ?? index} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-red-200 hover:bg-red-50/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{conflictItem.nama_prodi || 'Prodi belum tersedia'}</p>
                      {conflictItem.kode_mk && <span className="text-[10px] font-medium text-slate-400">{conflictItem.kode_mk}</span>}
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-900">{getMkName(conflictItem)}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{conflictItem.hari || '-'}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />{conflictItem.jam_mulai || '-'} – {conflictItem.jam_selesai || '-'}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{getRuangName(conflictItem)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(conflictItem)}
                    className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[10px] font-bold text-white transition hover:bg-indigo-700 hover:shadow-sm"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Jadwal
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3">
            <p className="text-xs leading-5 text-amber-700">
              <span className="font-semibold">Catatan:</span> Jadwal dianggap bentrok karena menggunakan ruangan yang sama pada hari dan waktu yang saling beririsan.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Tutup
          </button>
          <Link
            to="/kelola-jadwal"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Kelola Jadwal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
