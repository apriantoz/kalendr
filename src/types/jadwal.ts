export interface JadwalDetail {
  jadwal_id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  catatan: string | null;
  nama_mk: string;
  kode_mk: string | null;
  nama_ruang: string;
  tahun_ajaran: string;
  tipe_semester: string;
  is_bentrok: boolean;
}