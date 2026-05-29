/**
 * @tags @uat @feat-booking @role-owner @regression
 *
 * Dashboard Calendar — Barber weekly calendar view.
 * Requires authenticated user (owner/barber).
 */

import { loginAsBarberOwner } from '../../../src/session-helpers'
import { SELECTORS } from '../../../src/selectors'

const calSel = (k: keyof typeof SELECTORS.calendar) => `[data-cy="${SELECTORS.calendar[k]}"]`

describe('Dashboard Calendar', {
  tags: ['@uat', '@feat-booking', '@role-owner', '@regression'],
}, () => {
  beforeEach(() => {
    loginAsBarberOwner()
    cy.intercept('GET', '/api/barber-shop/calendar*').as('calendarApi')
    cy.visit('/dashboard/calendar')
    cy.wait('@calendarApi')
  })

  it('OWNER_CALENDAR_001: renders the week grid with 7 columns', () => {
    cy.get(calSel('week'))
      .should('exist')
      .within(() => {
        // 7 day columns
        cy.get('[class*="grid"] > div').should('have.length.at.least', 7)
      })
  })

  it('OWNER_CALENDAR_002: appointment cards render with correct data-cy', () => {
    // Stub with one appointment
    cy.intercept('GET', '/api/barber-shop/calendar*', {
      statusCode: 200,
      body: {
        appointments: [{
          id: 'apt-001',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          status: 'confirmed',
          totalPrice: 500,
          bookingSource: 'self-booking',
          serviceName: 'Corte clásico',
          barberName: 'Carlos',
          clientDisplayName: 'Juan Pérez',
        }],
        barberName: 'Carlos',
      },
    }).as('calendarWithApt')

    cy.visit('/dashboard/calendar')
    cy.wait('@calendarWithApt')

    cy.get(calSel('appointmentCard'))
      .should('exist')
      .first()
      .within(() => {
        cy.contains('Juan Pérez').should('be.visible')
        cy.contains('Corte clásico').should('be.visible')
        cy.contains('Online').should('be.visible') // bookingSource: self-booking
      })
  })

  it('OWNER_CALENDAR_003: prev/next week navigation updates the API call', () => {
    cy.get('[aria-label="Semana siguiente"]').click()
    cy.wait('@calendarApi').its('request.url').should('include', 'weekStart=')

    cy.get('[aria-label="Semana anterior"]').click()
    cy.wait('@calendarApi')
  })

  it('OWNER_CALENDAR_004: "Hoy" button returns to current week', () => {
    cy.get('[aria-label="Semana siguiente"]').click()
    cy.wait('@calendarApi')

    cy.contains('button', 'Hoy').click()
    cy.wait('@calendarApi').its('request.url').should('match', /weekStart=\d{4}-\d{2}-\d{2}/)
  })
})
