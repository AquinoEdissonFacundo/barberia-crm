import type { BarberSchedule, BarberDayKey } from '../entities/barbers/barbers.types'

export interface ExistingAppointment {
  time: string           // "HH:MM" — hora local de la barbería
  serviceDuration: number // minutos
}

// "HH:MM" → minutos desde medianoche
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// minutos → "HH:MM"
function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const DAY_KEYS: BarberDayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// Date.getDay() → 'sun'|'mon'|...'sat'
export function getDayKey(date: Date): BarberDayKey {
  return DAY_KEYS[date.getDay()]
}

// Genera slots de `start` a `end - slotSize` (inclusive último que cabe)
// slotSize = serviceDuration + bufferMinutes
export function generateTimeSlots(
  start: string,
  end: string,
  serviceDuration: number,
  bufferMinutes: number
): string[] {
  const startMin = toMinutes(start)
  const endMin   = toMinutes(end)
  const slotSize = serviceDuration + bufferMinutes

  if (slotSize <= 0 || startMin >= endMin) return []

  const slots: string[] = []
  for (let t = startMin; t + serviceDuration <= endMin; t += slotSize) {
    slots.push(fromMinutes(t))
  }
  return slots
}

// Algoritmo principal de disponibilidad.
// Usa overlap real: newStart < existingEnd AND newEnd > existingStart
export function computeAvailableSlots(
  schedule: BarberSchedule,
  serviceDuration: number,
  bufferMinutes: number,
  existingAppointments: ExistingAppointment[],
  date: string  // "YYYY-MM-DD" en timezone de la barbería
): string[] {
  // UTC noon del mismo día de calendario → getUTCDay() es timezone-invariante.
  // Evita que el server TZ afecte el día de la semana calculado.
  const [y, mo, dy] = date.split('-').map(Number)
  const dayKey = DAY_KEYS[new Date(Date.UTC(y, mo - 1, dy, 12)).getUTCDay()]
  const daySchedule = schedule[dayKey]

  if (!daySchedule?.enabled) return []

  const candidates = generateTimeSlots(
    daySchedule.start,
    daySchedule.end,
    serviceDuration,
    bufferMinutes
  )

  return candidates.filter(slot => {
    const newStart = toMinutes(slot)
    const newEnd   = newStart + serviceDuration

    for (const apt of existingAppointments) {
      const existingStart = toMinutes(apt.time)
      const existingEnd   = existingStart + apt.serviceDuration + bufferMinutes

      // Overlap real: los intervalos se solapan si newStart < existingEnd AND newEnd > existingStart
      if (newStart < existingEnd && newEnd > existingStart) {
        return false
      }
    }
    return true
  })
}
