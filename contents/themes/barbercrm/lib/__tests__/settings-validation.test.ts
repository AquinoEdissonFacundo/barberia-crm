import { validateShopSettingsInput, ShopSettingsInput } from '../settings-validation'

const base: ShopSettingsInput = {
  bookingMode: 'appointment-only',
  timezone: 'America/Argentina/Buenos_Aires',
}

describe('validateShopSettingsInput', () => {
  describe('bookingMode', () => {
    it('accepts all valid modes', () => {
      for (const mode of ['appointment-only', 'both', 'walk-in-only']) {
        expect(validateShopSettingsInput({ ...base, bookingMode: mode })).toBeNull()
      }
    })

    it('rejects invalid bookingMode', () => {
      const err = validateShopSettingsInput({ ...base, bookingMode: 'invalid' })
      expect(err).toEqual({ field: 'bookingMode', message: 'Invalid bookingMode' })
    })
  })

  describe('timezone', () => {
    it('rejects empty timezone', () => {
      const err = validateShopSettingsInput({ ...base, timezone: '' })
      expect(err?.field).toBe('timezone')
    })

    it('rejects non-string timezone', () => {
      const err = validateShopSettingsInput({ ...base, timezone: 123 as unknown as string })
      expect(err?.field).toBe('timezone')
    })
  })

  describe('depositPercent', () => {
    it('accepts valid values including boundaries', () => {
      expect(validateShopSettingsInput({ ...base, depositPercent: 0 })).toBeNull()
      expect(validateShopSettingsInput({ ...base, depositPercent: 100 })).toBeNull()
      expect(validateShopSettingsInput({ ...base, depositPercent: 50 })).toBeNull()
      expect(validateShopSettingsInput({ ...base, depositPercent: null })).toBeNull()
    })

    it('rejects negative values', () => {
      const err = validateShopSettingsInput({ ...base, depositPercent: -1 })
      expect(err?.field).toBe('depositPercent')
    })

    it('rejects values over 100', () => {
      const err = validateShopSettingsInput({ ...base, depositPercent: 101 })
      expect(err?.field).toBe('depositPercent')
    })
  })

  describe('bufferMinutes', () => {
    it('accepts 0-60 range', () => {
      expect(validateShopSettingsInput({ ...base, bufferMinutes: 0 })).toBeNull()
      expect(validateShopSettingsInput({ ...base, bufferMinutes: 60 })).toBeNull()
    })

    it('rejects values over 60', () => {
      const err = validateShopSettingsInput({ ...base, bufferMinutes: 61 })
      expect(err?.field).toBe('bufferMinutes')
    })
  })

  describe('shopName', () => {
    it('accepts valid names and null', () => {
      expect(validateShopSettingsInput({ ...base, shopName: 'Mi Barbería' })).toBeNull()
      expect(validateShopSettingsInput({ ...base, shopName: null })).toBeNull()
    })

    it('rejects names over 100 chars', () => {
      const err = validateShopSettingsInput({ ...base, shopName: 'a'.repeat(101) })
      expect(err?.field).toBe('shopName')
    })
  })

  describe('shopPhone', () => {
    it('accepts valid phone and null', () => {
      expect(validateShopSettingsInput({ ...base, shopPhone: '+54 11 1234-5678' })).toBeNull()
      expect(validateShopSettingsInput({ ...base, shopPhone: null })).toBeNull()
    })

    it('rejects phone over 30 chars', () => {
      const err = validateShopSettingsInput({ ...base, shopPhone: '1'.repeat(31) })
      expect(err?.field).toBe('shopPhone')
    })
  })

  describe('brandColor', () => {
    it('accepts valid hex colors', () => {
      expect(validateShopSettingsInput({ ...base, brandColor: '#1a2b3c' })).toBeNull()
      expect(validateShopSettingsInput({ ...base, brandColor: '#AABBCC' })).toBeNull()
      expect(validateShopSettingsInput({ ...base, brandColor: '#000000' })).toBeNull()
    })

    it('rejects invalid hex colors', () => {
      expect(validateShopSettingsInput({ ...base, brandColor: 'red' })?.field).toBe('brandColor')
      expect(validateShopSettingsInput({ ...base, brandColor: '#zzz' })?.field).toBe('brandColor')
      expect(validateShopSettingsInput({ ...base, brandColor: '#12345' })?.field).toBe('brandColor')
    })
  })

  describe('welcomeText', () => {
    it('accepts text up to 200 chars and null', () => {
      expect(validateShopSettingsInput({ ...base, welcomeText: 'Bienvenido' })).toBeNull()
      expect(validateShopSettingsInput({ ...base, welcomeText: null })).toBeNull()
      expect(validateShopSettingsInput({ ...base, welcomeText: 'x'.repeat(200) })).toBeNull()
    })

    it('rejects text over 200 chars', () => {
      const err = validateShopSettingsInput({ ...base, welcomeText: 'x'.repeat(201) })
      expect(err?.field).toBe('welcomeText')
    })
  })

  describe('logoUrl / backgroundImageUrl', () => {
    it('accepts string and null values', () => {
      expect(validateShopSettingsInput({ ...base, logoUrl: 'https://example.com/logo.png' })).toBeNull()
      expect(validateShopSettingsInput({ ...base, logoUrl: null })).toBeNull()
      expect(validateShopSettingsInput({ ...base, backgroundImageUrl: 'https://example.com/bg.png' })).toBeNull()
    })

    it('rejects non-string logoUrl', () => {
      const err = validateShopSettingsInput({ ...base, logoUrl: 123 })
      expect(err?.field).toBe('logoUrl')
    })

    it('rejects non-string backgroundImageUrl', () => {
      const err = validateShopSettingsInput({ ...base, backgroundImageUrl: true })
      expect(err?.field).toBe('backgroundImageUrl')
    })
  })

  describe('shopSchedule', () => {
    it('accepts an object and null', () => {
      expect(validateShopSettingsInput({ ...base, shopSchedule: {} })).toBeNull()
      expect(validateShopSettingsInput({ ...base, shopSchedule: { monday: [] } })).toBeNull()
      expect(validateShopSettingsInput({ ...base, shopSchedule: null })).toBeNull()
    })

    it('rejects non-object shopSchedule', () => {
      const err = validateShopSettingsInput({ ...base, shopSchedule: 'monday' })
      expect(err?.field).toBe('shopSchedule')
    })
  })

  it('returns null for a fully valid payload', () => {
    const full: ShopSettingsInput = {
      bookingMode: 'both',
      timezone: 'America/Argentina/Buenos_Aires',
      depositPercent: 30,
      bufferMinutes: 15,
      shopName: 'Barbería El Maestro',
      shopPhone: '+54 9 11 1234 5678',
      logoUrl: 'https://cdn.example.com/logo.png',
      backgroundImageUrl: 'https://cdn.example.com/bg.jpg',
      brandColor: '#3b82f6',
      welcomeText: '¡Bienvenido! Reservá tu turno.',
      shopSchedule: { monday: [{ start: '09:00', end: '18:00' }] },
    }
    expect(validateShopSettingsInput(full)).toBeNull()
  })
})
