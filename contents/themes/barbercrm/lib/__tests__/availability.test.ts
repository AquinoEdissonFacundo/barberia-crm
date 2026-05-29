import { generateTimeSlots, computeAvailableSlots, getDayKey } from '../availability'
import type { BarberSchedule } from '../../entities/barbers/barbers.types'

const SCHEDULE: BarberSchedule = {
  mon: { enabled: true,  start: '09:00', end: '13:00' },
  tue: { enabled: true,  start: '09:00', end: '13:00' },
  wed: { enabled: true,  start: '09:00', end: '13:00' },
  thu: { enabled: true,  start: '09:00', end: '13:00' },
  fri: { enabled: true,  start: '09:00', end: '13:00' },
  sat: { enabled: false, start: '09:00', end: '14:00' },
  sun: { enabled: false, start: '09:00', end: '14:00' },
}

const MON = '2025-06-02' // known Monday
const SAT = '2025-06-07' // known Saturday

// ─── generateTimeSlots ───────────────────────────────────────────────────────

describe('generateTimeSlots', () => {
  test('basic generation without buffer', () => {
    // slotSize=60: 09:00+60=10:00≤11:00 ✓, 10:00+60=11:00≤11:00 ✓, 11:00+60>11:00 ✗
    expect(generateTimeSlots('09:00', '11:00', 60, 0)).toEqual(['09:00', '10:00'])
  })

  test('buffer reduces number of slots', () => {
    // slotSize=70: 09:00+60=10:00≤11:00 ✓, next=10:10, 10:10+60=11:10>11:00 ✗
    expect(generateTimeSlots('09:00', '11:00', 60, 10)).toEqual(['09:00'])
  })

  test('last slot exactly at close time', () => {
    // slotSize=60: 09:00+60=10:00≤10:00 ✓, next=10:00, 10:00+60>10:00 ✗
    expect(generateTimeSlots('09:00', '10:00', 60, 0)).toEqual(['09:00'])
  })

  test('window smaller than service duration returns empty', () => {
    // service=90min, window=60min → no slot fits
    expect(generateTimeSlots('09:00', '10:00', 90, 0)).toEqual([])
  })

  test('start equals end returns empty', () => {
    expect(generateTimeSlots('09:00', '09:00', 60, 0)).toEqual([])
  })

  test('zero service duration returns empty', () => {
    // slotSize=0 → guard rejects
    expect(generateTimeSlots('09:00', '11:00', 0, 0)).toEqual([])
  })

  test('multiple short slots across wide window', () => {
    // 15min slots, 09:00-10:00 → 4 slots
    expect(generateTimeSlots('09:00', '10:00', 15, 0))
      .toEqual(['09:00', '09:15', '09:30', '09:45'])
  })
})

// ─── computeAvailableSlots ───────────────────────────────────────────────────

describe('computeAvailableSlots', () => {
  test('no appointments returns all slots', () => {
    // Mon 09:00-13:00, 60min service, no buffer → 4 slots
    expect(computeAvailableSlots(SCHEDULE, 60, 0, [], MON))
      .toEqual(['09:00', '10:00', '11:00', '12:00'])
  })

  test('disabled day returns empty array', () => {
    expect(computeAvailableSlots(SCHEDULE, 60, 0, [], SAT)).toEqual([])
  })

  test('exact overlap blocks the slot', () => {
    // existing at 09:00 for 60min → existingEnd=600, newEnd of 09:00=600
    // 540<600 AND 600>540 → blocked
    const existing = [{ time: '09:00', serviceDuration: 60 }]
    expect(computeAvailableSlots(SCHEDULE, 60, 0, existing, MON))
      .toEqual(['10:00', '11:00', '12:00'])
  })

  test('partial overlap: appointment not on slot boundary blocks adjacent slots', () => {
    // Schedule 09:00-12:00, service 30min, buffer 0
    // Slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
    // Existing: 09:15 for 60min → existingStart=555, existingEnd=615
    //   09:00: newEnd=570 → 540<615 AND 570>555 → blocked
    //   09:30: newEnd=600 → 570<615 AND 600>555 → blocked
    //   10:00: newEnd=630 → 600<615 AND 630>555 → blocked
    //   10:30: newStart=630 → 630<615 FALSE → free
    const schedule: BarberSchedule = {
      ...SCHEDULE,
      mon: { enabled: true, start: '09:00', end: '12:00' },
    }
    const existing = [{ time: '09:15', serviceDuration: 60 }]
    expect(computeAvailableSlots(schedule, 30, 0, existing, MON))
      .toEqual(['10:30', '11:00', '11:30'])
  })

  test('buffer is counted in existingEnd, blocking adjacent slot', () => {
    // Schedule 09:00-11:00, service 30min, buffer 10min
    // slotSize=40: slots → 09:00, 09:40, 10:20
    // Existing: 09:00 for 30min → existingEnd=540+30+10=580
    //   09:00: newEnd=570 → 540<580 AND 570>540 → blocked
    //   09:40: newStart=580 → 580<580 FALSE → free
    const schedule: BarberSchedule = {
      ...SCHEDULE,
      mon: { enabled: true, start: '09:00', end: '11:00' },
    }
    const existing = [{ time: '09:00', serviceDuration: 30 }]
    expect(computeAvailableSlots(schedule, 30, 10, existing, MON))
      .toEqual(['09:40', '10:20'])
  })

  test('multiple appointments with gaps returns only free slots', () => {
    // Slots: 09:00, 10:00, 11:00, 12:00
    // Existing: 09:00 (60min) blocks 09:00; 11:00 (60min) blocks 11:00
    //   10:00: first existingEnd=600, 600<600 FALSE; second existingStart=660, 660>660 FALSE → free
    //   12:00: second existingEnd=720, 720<720 FALSE → free
    const existing = [
      { time: '09:00', serviceDuration: 60 },
      { time: '11:00', serviceDuration: 60 },
    ]
    expect(computeAvailableSlots(SCHEDULE, 60, 0, existing, MON))
      .toEqual(['10:00', '12:00'])
  })

  test('all slots booked returns empty array', () => {
    const existing = [
      { time: '09:00', serviceDuration: 60 },
      { time: '10:00', serviceDuration: 60 },
      { time: '11:00', serviceDuration: 60 },
      { time: '12:00', serviceDuration: 60 },
    ]
    expect(computeAvailableSlots(SCHEDULE, 60, 0, existing, MON)).toEqual([])
  })

  test('service duration larger than window produces no slots', () => {
    // Mon 09:00-13:00 = 240min window; 300min service → nothing fits
    expect(computeAvailableSlots(SCHEDULE, 300, 0, [], MON)).toEqual([])
  })

  test('appointment spanning rest of day blocks all following slots', () => {
    // Mon 09:00-13:00, 60min slots: 09:00,10:00,11:00,12:00
    // Existing at 09:00 for 240min (=end of day) → existingEnd=780
    // Every slot: newEnd ≤ 780 AND newStart ≥ 540 → all blocked
    const existing = [{ time: '09:00', serviceDuration: 240 }]
    expect(computeAvailableSlots(SCHEDULE, 60, 0, existing, MON)).toEqual([])
  })
})

// ─── Day-of-week correctness (validates UTC-noon timezone fix) ────────────────

describe('computeAvailableSlots — day-of-week from date string', () => {
  // Full week schedule: only Wednesday and Friday enabled
  const WED_FRI: BarberSchedule = {
    mon: { enabled: false, start: '09:00', end: '17:00' },
    tue: { enabled: false, start: '09:00', end: '17:00' },
    wed: { enabled: true,  start: '09:00', end: '10:00' },
    thu: { enabled: false, start: '09:00', end: '17:00' },
    fri: { enabled: true,  start: '09:00', end: '10:00' },
    sat: { enabled: false, start: '09:00', end: '17:00' },
    sun: { enabled: false, start: '09:00', end: '17:00' },
  }

  // Week of 2025-06-02 (Mon) through 2025-06-08 (Sun) — verified via UTC
  test.each([
    ['2025-06-02', 'Monday',    false],
    ['2025-06-03', 'Tuesday',   false],
    ['2025-06-04', 'Wednesday', true ],
    ['2025-06-05', 'Thursday',  false],
    ['2025-06-06', 'Friday',    true ],
    ['2025-06-07', 'Saturday',  false],
    ['2025-06-08', 'Sunday',    false],
  ])('%s is %s → hasSlots=%s', (date, _label, hasSlots) => {
    const slots = computeAvailableSlots(WED_FRI, 60, 0, [], date)
    if (hasSlots) {
      expect(slots).toEqual(['09:00'])
    } else {
      expect(slots).toEqual([])
    }
  })

  test('month/year boundary: 2025-01-01 is Wednesday → returns slots', () => {
    // Date.UTC(2025, 0, 1, 12).getUTCDay() === 3 (Wednesday)
    expect(computeAvailableSlots(WED_FRI, 60, 0, [], '2025-01-01')).toEqual(['09:00'])
  })

  test('leap year boundary: 2024-02-29 is Thursday → no slots', () => {
    // 2024 is a leap year; Feb 29 is Thursday
    expect(computeAvailableSlots(WED_FRI, 60, 0, [], '2024-02-29')).toEqual([])
  })
})
