// src/utils/scheduleHelpers.ts

export interface ScheduleItem {
  id?: number;
  jadwal_id?: number;
  hari?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  ruang_id?: number;
  nama_ruang?: string;
  master_semester_id?: number;
  is_bentrok?: boolean;
  nama_mk?: string;
  mk?: { nama_mk?: string; nama?: string };
  ruang?: { nama_ruang?: string; nama?: string };
  mk_id?: number;
}

// 1. Helper Ambil Nama Mata Kuliah
export const getMkName = (item: ScheduleItem): string =>
  item.nama_mk || item.mk?.nama_mk || item.mk?.nama || (item.mk_id ? `MK #${item.mk_id}` : '-');

// 2. Helper Ambil Nama Ruangan
export const getRuangName = (item: ScheduleItem): string =>
  item.nama_ruang || item.ruang?.nama_ruang || item.ruang?.nama || (item.ruang_id ? `Ruang #${item.ruang_id}` : '-');

// 3. Helper Konversi Jam HH:MM ke Menit
export const parseToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const cleanTime = timeStr.replace('.', ':');
  const [hours, minutes] = cleanTime.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

// 4. Helper Utama Pendeteksi Detail Bentrok
export const getBentrokDetails = (currentItem: ScheduleItem, list: ScheduleItem[]) => {
  const currentId = currentItem.id || currentItem.jadwal_id;

  const start1 = parseToMinutes(currentItem.jam_mulai);
  const end1 = parseToMinutes(currentItem.jam_selesai);

  const conflictingItems = list.filter((otherItem) => {
    const otherId = otherItem.id || otherItem.jadwal_id;
    if (otherId === currentId) return false;

    // Cek Hari
    if (
      otherItem.hari?.trim().toLowerCase() !==
      currentItem.hari?.trim().toLowerCase()
    )
      return false;

    // Cek Ruangan (Bisa lewat ID atau Nama Ruang)
    const sameRuangId =
      currentItem.ruang_id &&
      otherItem.ruang_id &&
      Number(otherItem.ruang_id) === Number(currentItem.ruang_id);

    const sameRuangName =
      currentItem.nama_ruang &&
      otherItem.nama_ruang &&
      currentItem.nama_ruang.trim().toLowerCase() ===
        otherItem.nama_ruang.trim().toLowerCase();

    if (!sameRuangId && !sameRuangName) return false;

    // Cek Irisan Waktu
    const start2 = parseToMinutes(otherItem.jam_mulai);
    const end2 = parseToMinutes(otherItem.jam_selesai);

    return start1 < end2 && end1 > start2;
  });

  if (conflictingItems.length === 0) return null;

  return conflictingItems.map((item) => ({
    mk: getMkName(item),
    ruang: getRuangName(item),
    jam: `${item.jam_mulai} - ${item.jam_selesai}`,
  }));
};