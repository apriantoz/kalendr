import { type ScheduleItem } from '@/utils/scheduleHelpers'

export interface JadwalPublicItem extends ScheduleItem {
  kode_mk?: string
  nama_prodi?: string
  tahun_ajaran?: string
  tipe_semester?: string
  catatan?: string
}

export interface MasterSemester {
  id: number
  tahun_ajaran: string
  tipe_semester: string
  is_active: boolean
}