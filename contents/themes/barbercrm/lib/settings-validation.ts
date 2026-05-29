export interface ShopSettingsInput {
  bookingMode: string
  timezone: string
  depositPercent?: number | null
  bufferMinutes?: number | null
  shopName?: string | null
  shopPhone?: string | null
  logoUrl?: unknown
  backgroundImageUrl?: unknown
  brandColor?: string
  welcomeText?: string | null
  shopSchedule?: unknown
}

export interface ValidationError {
  field: string
  message: string
}

const VALID_BOOKING_MODES = ['appointment-only', 'both', 'walk-in-only']

export function validateShopSettingsInput(body: ShopSettingsInput): ValidationError | null {
  if (!VALID_BOOKING_MODES.includes(body.bookingMode)) {
    return { field: 'bookingMode', message: 'Invalid bookingMode' }
  }
  if (!body.timezone || typeof body.timezone !== 'string') {
    return { field: 'timezone', message: 'Invalid timezone' }
  }
  const deposit = Number(body.depositPercent ?? 0)
  if (isNaN(deposit) || deposit < 0 || deposit > 100) {
    return { field: 'depositPercent', message: 'depositPercent must be 0-100' }
  }
  const buffer = Number(body.bufferMinutes ?? 0)
  if (isNaN(buffer) || buffer < 0 || buffer > 60) {
    return { field: 'bufferMinutes', message: 'bufferMinutes must be 0-60' }
  }
  if (body.shopName !== undefined && body.shopName !== null &&
      (typeof body.shopName !== 'string' || body.shopName.length > 100)) {
    return { field: 'shopName', message: 'shopName must be a string of at most 100 characters' }
  }
  if (body.shopPhone !== undefined && body.shopPhone !== null &&
      (typeof body.shopPhone !== 'string' || body.shopPhone.length > 30)) {
    return { field: 'shopPhone', message: 'shopPhone must be a string of at most 30 characters' }
  }
  if (body.logoUrl !== undefined && body.logoUrl !== null && typeof body.logoUrl !== 'string') {
    return { field: 'logoUrl', message: 'logoUrl must be a string' }
  }
  if (body.backgroundImageUrl !== undefined && body.backgroundImageUrl !== null &&
      typeof body.backgroundImageUrl !== 'string') {
    return { field: 'backgroundImageUrl', message: 'backgroundImageUrl must be a string' }
  }
  if (body.brandColor !== undefined &&
      (typeof body.brandColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(body.brandColor))) {
    return { field: 'brandColor', message: 'brandColor must be a valid hex color' }
  }
  if (body.welcomeText !== undefined && body.welcomeText !== null &&
      (typeof body.welcomeText !== 'string' || body.welcomeText.length > 200)) {
    return { field: 'welcomeText', message: 'welcomeText must be at most 200 characters' }
  }
  if (body.shopSchedule !== undefined && body.shopSchedule !== null &&
      typeof body.shopSchedule !== 'object') {
    return { field: 'shopSchedule', message: 'shopSchedule must be an object' }
  }
  return null
}
