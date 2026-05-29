/**
 * @tags @uat @feat-booking @smoke @regression
 *
 * Booking Wizard — Public Self-Booking Flow
 * Tests the /book/[teamId] wizard without authentication.
 */

import { BookingPOM } from '../../../src/features/BookingPOM'

const TEAM_ID = Cypress.env('BOOKING_TEAM_ID') || 'test-team'

describe('Booking Wizard — Happy Path', {
  tags: ['@uat', '@feat-booking', '@smoke', '@regression'],
}, () => {
  let pom: BookingPOM

  beforeEach(() => {
    pom = BookingPOM.create(TEAM_ID)
    pom.interceptConfig()
    pom.interceptAvailability()
    pom.interceptConfirm()
    pom.visit()
    cy.wait('@config')
  })

  it('PUB_BOOKING_001: renders all required data-cy selectors', () => {
    // Step 0 — service cards must be visible
    pom.serviceCards.should('have.length.at.least', 1)

    // Navigate to step 1 — barber cards
    pom.serviceCards.first().click()
    cy.contains('button', 'Siguiente').click()
    pom.barberCards.should('have.length.at.least', 1)

    // Navigate to step 2 — date picker
    pom.barberCards.first().click()
    cy.contains('button', 'Siguiente').click()
    pom.datePicker.should('exist')

    // Pick a date and go to step 3 — time slots (nav arrows have aria-label, date cells don't)
    pom.pickDate()
    cy.contains('button', 'Siguiente').click()
    cy.wait('@availability')
    pom.timeSlots.should('have.length.at.least', 1)

    // Navigate to step 4 — contact inputs
    pom.timeSlots.first().click()
    cy.contains('button', 'Siguiente').click()
    pom.clientNameInput.should('exist')
    pom.clientPhoneInput.should('exist')
    pom.confirmBtn.should('exist')
  })

  it('PUB_BOOKING_002: confirm button is disabled until name is filled', () => {
    pom.fillWizard('', '')
    // Clear the name that fillWizard would have typed
    pom.clientNameInput.clear()
    pom.confirmBtn.should('be.disabled')

    pom.clientNameInput.type('Juan Pérez')
    pom.confirmBtn.should('not.be.disabled')
  })

  it('PUB_BOOKING_003: happy path without deposit — shows success screen', () => {
    // Stub confirm to return no-deposit response
    cy.intercept('POST', `/api/booking/${TEAM_ID}/confirm`, {
      statusCode: 200,
      body: {
        requiresPayment: false,
        whatsappUrl: 'https://wa.me/5491100000000',
        appointmentId: 'test-apt-001',
      },
    }).as('confirmStub')

    pom.fillWizard('Juan Pérez', '+54 9 11 0000-0000')
    pom.confirm()
    cy.wait('@confirmStub')

    // Success screen with WhatsApp button
    cy.contains('¡Turno confirmado!').should('be.visible')
    cy.contains('Enviar confirmación por WhatsApp').should('be.visible')
  })

  it('PUB_BOOKING_004: 409 conflict shows error message in wizard', () => {
    cy.intercept('POST', `/api/booking/${TEAM_ID}/confirm`, {
      statusCode: 409,
      body: { error: 'This time slot is no longer available' },
    }).as('conflictStub')

    pom.fillWizard('Juan Pérez', '+54 9 11 0000-0000')
    pom.confirm()
    cy.wait('@conflictStub')

    cy.contains('This time slot is no longer available').should('be.visible')
    // User stays on step 4 — can retry
    pom.confirmBtn.should('exist')
  })

  it('PUB_BOOKING_005: happy path with deposit — redirects to Stripe checkout', () => {
    const checkoutUrl = 'https://checkout.stripe.com/test-session'
    cy.intercept('POST', `/api/booking/${TEAM_ID}/confirm`, {
      statusCode: 200,
      body: {
        requiresPayment: true,
        checkoutUrl,
        appointmentId: 'test-apt-002',
      },
    }).as('depositStub')

    // Intercept the redirect so we don't actually navigate to Stripe
    cy.on('window:before:unload', () => false)
    cy.intercept(checkoutUrl, { statusCode: 200, body: '' }).as('stripeRedirect')

    pom.fillWizard('Ana García', '+54 9 11 1111-1111')
    pom.confirm()
    cy.wait('@depositStub')

    // Cypress captures window.location.href change
    cy.location('href').should('include', 'checkout.stripe.com')
  })
})

describe('Booking Wizard — Walk-in Only Mode', {
  tags: ['@uat', '@feat-booking', '@regression'],
}, () => {
  it('PUB_BOOKING_006: walk-in-only mode shows unavailable message', () => {
    cy.intercept('GET', `/api/booking/${TEAM_ID}/config`, {
      statusCode: 403,
      body: { error: 'Online booking not available' },
    }).as('configWalkIn')

    cy.visit(`/book/${TEAM_ID}`)
    cy.wait('@configWalkIn')

    cy.contains('No disponible').should('be.visible')
    cy.get('[data-cy="service-card"]').should('not.exist')
  })
})
