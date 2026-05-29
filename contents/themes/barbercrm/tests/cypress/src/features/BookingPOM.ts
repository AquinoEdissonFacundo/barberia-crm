import { SELECTORS } from '../selectors'

const sel = (key: keyof typeof SELECTORS.booking) =>
  `[data-cy="${SELECTORS.booking[key]}"]`

/**
 * Page Object Model for the public booking wizard /book/[teamId]
 */
export class BookingPOM {
  private teamId: string

  constructor(teamId: string) {
    this.teamId = teamId
  }

  static create(teamId: string) {
    return new BookingPOM(teamId)
  }

  visit() {
    cy.visit(`/book/${this.teamId}`)
  }

  // ─── Step selectors ────────────────────────────────────────────────────────

  get serviceCards()    { return cy.get(sel('serviceCard')) }
  get barberCards()     { return cy.get(sel('barberCard')) }
  get datePicker()      { return cy.get(sel('datePicker')) }
  get timeSlots()       { return cy.get(sel('timeSlot')) }
  get clientNameInput() { return cy.get(sel('clientNameInput')) }
  get clientPhoneInput(){ return cy.get(sel('clientPhoneInput')) }
  get confirmBtn()      { return cy.get(sel('confirmBtn')) }

  // ─── Navigation helpers ────────────────────────────────────────────────────

  nextStep() {
    cy.contains('button', 'Siguiente').click()
  }

  /**
   * Click the first available (non-disabled, non-nav) date cell in the calendar.
   * Navigation arrows have aria-label; date cells do not — so we exclude them.
   */
  pickDate() {
    this.datePicker.find('button:not([disabled]):not([aria-label])').first().click()
  }

  // ─── High-level flows ─────────────────────────────────────────────────────

  /**
   * Complete the wizard up to the confirm step (does NOT click confirm).
   * Picks the first service, first barber, first available date + time slot.
   */
  fillWizard(name = 'Test Cliente', phone = '+54 9 11 0000-0000') {
    // Step 0 — Service
    this.serviceCards.first().click()
    this.nextStep()

    // Step 1 — Barber
    this.barberCards.first().click()
    this.nextStep()

    // Step 2 — Date: click first enabled date cell (nav arrows have aria-label, date cells don't)
    this.pickDate()
    this.nextStep()

    // Step 3 — Time slot
    this.timeSlots.first().click()
    this.nextStep()

    // Step 4 — Contact (cy.type rejects empty strings — only type if non-empty)
    if (name)  this.clientNameInput.type(name)
    if (phone) this.clientPhoneInput.type(phone)
  }

  confirm() {
    this.confirmBtn.click()
  }

  // ─── API helpers ──────────────────────────────────────────────────────────

  interceptConfig() {
    cy.intercept('GET', `/api/booking/${this.teamId}/config`, {
      statusCode: 200,
      body: {
        settings: {
          bookingMode: 'both',
          depositPercent: 0,
          bufferMinutes: 0,
          timezone: 'America/Argentina/Buenos_Aires',
        },
        services: [
          { id: 'svc-001', name: 'Corte clásico', price: 500, duration: 30, category: 'haircut', description: null },
          { id: 'svc-002', name: 'Barba', price: 300, duration: 20, category: 'beard', description: null },
        ],
        barbers: [
          {
            id: 'bar-001',
            name: 'Carlos',
            specialty: 'Barbero',
            bio: null,
            schedule: {
              mon: { enabled: true, start: '09:00', end: '18:00' },
              tue: { enabled: true, start: '09:00', end: '18:00' },
              wed: { enabled: true, start: '09:00', end: '18:00' },
              thu: { enabled: true, start: '09:00', end: '18:00' },
              fri: { enabled: true, start: '09:00', end: '18:00' },
              sat: { enabled: false, start: '09:00', end: '14:00' },
              sun: { enabled: false, start: '09:00', end: '14:00' },
            },
          },
        ],
      },
    }).as('config')
  }

  interceptAvailability() {
    cy.intercept('GET', `/api/booking/${this.teamId}/availability*`, {
      statusCode: 200,
      body: { slots: ['09:00', '10:00', '11:00', '12:00'] },
    }).as('availability')
  }

  interceptConfirm() {
    cy.intercept('POST', `/api/booking/${this.teamId}/confirm`).as('confirm')
  }
}
