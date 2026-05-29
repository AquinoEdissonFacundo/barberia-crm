export interface BarberScheduleDay {
  enabled: boolean
  start: string  // "HH:MM"
  end: string    // "HH:MM"
}

export interface BarberSchedule {
  mon: BarberScheduleDay
  tue: BarberScheduleDay
  wed: BarberScheduleDay
  thu: BarberScheduleDay
  fri: BarberScheduleDay
  sat: BarberScheduleDay
  sun: BarberScheduleDay
}

export type BarberDayKey = keyof BarberSchedule

export const DEFAULT_SCHEDULE: BarberSchedule = {
  mon: { enabled: true,  start: '09:00', end: '19:00' },
  tue: { enabled: true,  start: '09:00', end: '19:00' },
  wed: { enabled: true,  start: '09:00', end: '19:00' },
  thu: { enabled: true,  start: '09:00', end: '19:00' },
  fri: { enabled: true,  start: '09:00', end: '19:00' },
  sat: { enabled: false, start: '09:00', end: '14:00' },
  sun: { enabled: false, start: '09:00', end: '14:00' },
}

export interface Barber {
  id: string
  name: string
  phone?: string
  email?: string
  specialty?: string
  bio?: string
  active: boolean
  schedule?: BarberSchedule
  createdAt?: string
  updatedAt?: string
}

export interface BarberListOptions {
  limit?: number
  offset?: number
  active?: boolean
  orderBy?: 'name' | 'createdAt'
  orderDir?: 'asc' | 'desc'
}

export interface BarberListResult {
  barbers: Barber[]
  total: number
}

export interface CreateBarberInput {
  name: string
  phone?: string
  email?: string
  specialty?: string
  bio?: string
  active?: boolean
}

export interface UpdateBarberInput {
  name?: string
  phone?: string
  email?: string
  specialty?: string
  bio?: string
  active?: boolean
  schedule?: BarberSchedule
}
