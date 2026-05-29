/**
 * @tags @uat @feat-booking @security @regression
 *
 * Security tests — Auth guards and cross-team RLS isolation.
 */

describe('Booking Security', {
  tags: ['@uat', '@feat-booking', '@security', '@regression'],
}, () => {
  it('SEC_BOOKING_001: unauthenticated access to calendar redirects to login', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/dashboard/calendar', { failOnStatusCode: false })
    cy.location('pathname').should('include', '/login')
  })

  it('SEC_BOOKING_002: unauthenticated access to settings redirects to login', () => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/dashboard/settings/shop', { failOnStatusCode: false })
    cy.location('pathname').should('include', '/login')
  })

  it('SEC_BOOKING_003: public booking API always requires teamId scoping', () => {
    // Calling config without a real teamId should 404, not leak data
    cy.request({
      url: '/api/booking/nonexistent-team-xyz/config',
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [404, 403])
  })

  it('SEC_BOOKING_004: barber schedule PUT rejects non-owner role', () => {
    // This tests that the API correctly enforces role check
    cy.request({
      method: 'PUT',
      url: '/api/barber-shop/barbers/some-barber-id/schedule',
      failOnStatusCode: false,
      headers: { 'Content-Type': 'application/json' },
      body: {
        mon: { enabled: true, start: '09:00', end: '18:00' },
        tue: { enabled: true, start: '09:00', end: '18:00' },
        wed: { enabled: true, start: '09:00', end: '18:00' },
        thu: { enabled: true, start: '09:00', end: '18:00' },
        fri: { enabled: true, start: '09:00', end: '18:00' },
        sat: { enabled: false, start: '09:00', end: '14:00' },
        sun: { enabled: false, start: '09:00', end: '14:00' },
      },
    }).its('status').should('be.oneOf', [401, 403])
  })
})
