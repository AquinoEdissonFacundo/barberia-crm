export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DaySchedule {
  open: boolean
  from: string  // "HH:MM"
  to: string    // "HH:MM"
}

export type ShopSchedule = Record<DayOfWeek, DaySchedule>

export const DEFAULT_SHOP_SCHEDULE: ShopSchedule = {
  mon: { open: true,  from: '09:00', to: '18:00' },
  tue: { open: true,  from: '09:00', to: '18:00' },
  wed: { open: true,  from: '09:00', to: '18:00' },
  thu: { open: true,  from: '09:00', to: '18:00' },
  fri: { open: true,  from: '09:00', to: '18:00' },
  sat: { open: true,  from: '09:00', to: '14:00' },
  sun: { open: false, from: '09:00', to: '14:00' },
}

export interface ShopSettings {
  id: string
  teamId: string
  bookingMode: 'appointment-only' | 'both' | 'walk-in-only'
  depositPercent: number
  bufferMinutes: number
  timezone: string
  shopName?: string
  shopPhone?: string
  logoUrl?: string | null
  backgroundImageUrl?: string | null
  brandColor?: string
  welcomeText?: string | null
  shopSchedule?: ShopSchedule | null
  createdAt?: string
  updatedAt?: string
}

export const DEFAULT_SHOP_SETTINGS: Omit<ShopSettings, 'id' | 'teamId'> = {
  bookingMode: 'both',
  depositPercent: 0,
  bufferMinutes: 0,
  timezone: 'America/Argentina/Buenos_Aires',
  brandColor: '#18181b',
  shopSchedule: DEFAULT_SHOP_SCHEDULE,
}

export const LATAM_TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (GMT-3)' },
  { value: 'America/Sao_Paulo',              label: 'Brasil - São Paulo (GMT-3)' },
  { value: 'America/Santiago',               label: 'Chile (GMT-3/-4)' },
  { value: 'America/Bogota',                 label: 'Colombia (GMT-5)' },
  { value: 'America/Lima',                   label: 'Perú (GMT-5)' },
  { value: 'America/Mexico_City',            label: 'México (GMT-6)' },
  { value: 'America/Caracas',                label: 'Venezuela (GMT-4)' },
  { value: 'America/Montevideo',             label: 'Uruguay (GMT-3)' },
  { value: 'America/Asuncion',               label: 'Paraguay (GMT-4)' },
  { value: 'America/La_Paz',                 label: 'Bolivia (GMT-4)' },
  { value: 'America/Guayaquil',              label: 'Ecuador (GMT-5)' },
  { value: 'America/New_York',               label: 'EE.UU. Este (GMT-5)' },
  { value: 'Europe/Madrid',                  label: 'España (GMT+1)' },
]
