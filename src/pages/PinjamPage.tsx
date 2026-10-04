// src/pages/PinjamPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  BookOpen,
  FileText,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Building,
} from 'lucide-react';
import Footer from '../components/Footer';

interface FormData {
  namaPemohon: string;
  nimNip: string;
  email: string;
  noHp: string;
  prodi: string;
  kategoriPemohon: 'Mahasiswa' | 'Dosen' | 'Organisasi Mahasiswa' | 'Lainnya';
  ruanganId: string;
  tanggalPinjam: string;
  jamMulai: string;
  jamSelesai: string;
  keperluan: string;
  jumlahPeserta: string;
  berkasPendukungName?: string;
}

const RUANGAN_OPTIONS = [
  { id: 'DH-L1-01', name: 'Lab Komputer Desain 01 (Lantai 1 - 30 PC)' },
  { id: 'DH-L1-02', name: 'Lab Komputer Desain 02 (Lantai 1 - 30 PC)' },
  { id: 'DH-L1-03', name: 'Lab Multimedia & Web (Lantai 1 - 25 PC)' },
  { id: 'DH-L2-MAC', name: 'Lab Mac Publishing & Video (Lantai 2 - 24 Mac)' },
  { id: 'DH-L2-3D', name: 'Lab Animasi & 3D Render (Lantai 2 - 20 PC Workstation)' },
  { id: 'DH-L3-05', name: 'Lab Komputer Desain 05 (Lantai 3 - 30 PC)' },
  { id: 'DH-L3-06', name: 'Lab Fotografi Digital (Lantai 3 - 20 PC)' },
];

export const PinjamPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    namaPemohon: '',
    nimNip: '',
    email: '',
    noHp: '',
    prodi: 'Desain Komunikasi Visual',
    kategoriPemohon: 'Mahasiswa',
    ruanganId: 'DH-L1-01',
    tanggalPinjam: '',
    jamMulai: '08:00',
    jamSelesai: '11:00',
    keperluan: '',
    jumlahPeserta: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        berkasPendukungName: e.target.files![0].name,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulasi pengiriman data ke Supabase / Backend API
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedCode = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
      setTicketCode(generatedCode);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Header Section */}
      <section className="relative pt-10 pb-12 border-b border-slate-800/80 bg-slate-950 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[250px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Layanan Peminjaman Laboratorium</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pengajuan Peminjaman Lab
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Isi formulir berikut untuk mengajukan peminjaman laboratorium komputer di Gedung Desain Hub di luar jam perkuliahan reguler.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {isSubmitted ? (
            /* State Setelah Berhasil Mengirim Pengajuan */
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-center space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Pengajuan Berhasil Dikirim!</h2>
                <p className="text-sm text-slate-400">
                  Kode Tiket Pengajuan Anda:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-950 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-lg tracking-wider">
                  {ticketCode}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Notifikasi status persetujuan akan dikirimkan ke email <span className="text-slate-200 font-medium">{formData.email}</span> dan nomor Telegram/WhatsApp yang terdaftar.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/ruangan"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all"
                >
                  Cek Status Ruang
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      namaPemohon: '',
                      nimNip: '',
                      email: '',
                      noHp: '',
                      prodi: 'Desain Komunikasi Visual',
                      kategoriPemohon: 'Mahasiswa',
                      ruanganId: 'DH-L1-01',
                      tanggalPinjam: '',
                      jamMulai: '08:00',
                      jamSelesai: '11:00',
                      keperluan: '',
                      jumlahPeserta: '',
                    });
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Buat Pengajuan Baru
                </button>
              </div>
            </div>
          ) : (
            /* Grid Form & Petunjuk */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Utama (8 Cols) */}
              <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Formulir Peminjaman</h2>
                  <p className="text-xs text-slate-400 mt-1">Lengkapi data pemohon dan detail jadwal penggunaan laboratorium.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Data Pemohon */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Identitas Pemohon
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Nama Lengkap *</label>
                        <input
                          type="text"
                          name="namaPemohon"
                          required
                          value={formData.namaPemohon}
                          onChange={handleChange}
                          placeholder="Contoh: Agus Eka"
                          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">NIM / NIP / NIDN *</label>
                        <input
                          type="text"
                          name="nimNip"
                          required
                          value={formData.nimNip}
                          onChange={handleChange}
                          placeholder="Nomor identitas civitas"
                          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Kategori Pemohon *</label>
                        <select
                          name="kategoriPemohon"
                          value={formData.kategoriPemohon}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Mahasiswa">Mahasiswa</option>
                          <option value="Dosen">Dosen / Tenaga Pengajar</option>
                          <option value="Organisasi Mahasiswa">Organisasi Mahasiswa (Ormawa)</option>
                          <option value="Lainnya">Lainnya (Pihak Luar/Unit)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Program Studi *</label>
                        <input
                          type="text"
                          name="prodi"
                          required
                          value={formData.prodi}
                          onChange={handleChange}
                          placeholder="Contoh: Desain Komunikasi Visual"
                          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Aktif *</label>
                        <div className="relative">
                          <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="nama@email.com"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">No. WhatsApp / Telegram *</label>
                        <div className="relative">
                          <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="tel"
                            name="noHp"
                            required
                            value={formData.noHp}
                            onChange={handleChange}
                            placeholder="081234567890"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Peminjaman */}
                  <div className="space-y-4 pt-4 border-t border-slate-800/80">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5" /> Detail Ruang & Waktu
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Pilih Laboratorium *</label>
                        <select
                          name="ruanganId"
                          value={formData.ruanganId}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        >
                          {RUANGAN_OPTIONS.map((lab) => (
                            <option key={lab.id} value={lab.id}>
                              {lab.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5">Tanggal Pinjam *</label>
                          <input
                            type="date"
                            name="tanggalPinjam"
                            required
                            value={formData.tanggalPinjam}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5">Jam Mulai *</label>
                          <input
                            type="time"
                            name="jamMulai"
                            required
                            value={formData.jamMulai}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5">Jam Selesai *</label>
                          <input
                            type="time"
                            name="jamSelesai"
                            required
                            value={formData.jamSelesai}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5">Jumlah Estimasi Peserta *</label>
                          <input
                            type="number"
                            name="jumlahPeserta"
                            required
                            placeholder="Contoh: 25"
                            value={formData.jumlahPeserta}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Surat / Berkas Pendukung (Opsional)
                          </label>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Keperluan & Kegiatan *</label>
                        <textarea
                          name="keperluan"
                          rows={3}
                          required
                          value={formData.keperluan}
                          onChange={handleChange}
                          placeholder="Jelaskan secara detail nama kegiatan, praktikum tambahan, ujian, workshop, atau sertifikasi..."
                          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Mengirim Pengajuan...</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Kirim Permohonan Peminjaman</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>

              {/* Sidebar Info & Alur (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Alur Persetujuan */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="h-4 w-4 text-indigo-400" />
                    <span>Alur Persetujuan Lab</span>
                  </h3>

                  <ol className="relative border-l border-slate-800 ml-2 space-y-4 text-xs">
                    <li className="pl-4 relative">
                      <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <p className="font-semibold text-slate-200">1. Isi Form Pengajuan</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Lengkapi form online minimal 2 hari sebelum kegiatan.</p>
                    </li>
                    <li className="pl-4 relative">
                      <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <p className="font-semibold text-slate-200">2. Verifikasi Jadwal</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Pranata Komputer / Laboran memeriksa ketersediaan jam & alat.</p>
                    </li>
                    <li className="pl-4 relative">
                      <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <p className="font-semibold text-slate-200">3. Persetujuan & Tiket</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Konfirmasi persetujuan dikirim via Telegram Bot / Email.</p>
                    </li>
                  </ol>
                </div>

                {/* Ketentuan Peminjaman */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs text-slate-400">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    Ketentuan Penting
                  </h4>
                  <ul className="space-y-2 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Tidak diperkenankan membawa makanan dan minuman manis ke dalam lab.</li>
                    <li>Wajib merapikan kembali posisi kursi dan mematikan unit PC setelah selesai.</li>
                    <li>Segala kerusakan fasilitas yang disengaja menjadi tanggung jawab pemohon.</li>
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PinjamPage;