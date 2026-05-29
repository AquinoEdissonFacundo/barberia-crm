/**
 * @tags @uat @feat-booking @role-owner @regression
 *
 * Dashboard Shop Settings — Booking mode, deposit %, buffer, timezone, barber schedules.
 * Requires authenticated owner.
 */

import { loginAsBarberOwner } from '../../../src/session-helpers'

describe('Dashboard Shop Settings', {
  tags: ['@uat', '@feat-booking', '@role-owner', '@regression'],
}, () => {
  beforeEach(() => {
    loginAsBarberOwner()
    cy.intercept('GET', '/api/barber-shop/settings').as('getSettings')
    cy.intercept('GET', '/api/v1/barbers*').as('getBarbers')
    cy.visit('/dashboard/settings/shop')
    cy.wait('@getSettings')
    cy.wait('@getBarbers')
  })

  it('OWNER_SETTINGS_001: loads and displays current settings', () => {
    cy.contains('Configuración de Barbería').should('be.visible')
    cy.contains('Modo de reserva').should('be.visible')
    cy.contains('Pago al reservar').should('be.visible')
    cy.contains('Zona horaria').should('be.visible')
  })

  it('OWNER_SETTINGS_002: save settings calls PUT and shows success', () => {
    cy.intercept('PUT', '/api/barber-shop/settings', {
      statusCode: 200,
      body: { bookingMode: 'both', depositPercent: 20, bufferMinutes: 10, timezone: 'America/Argentina/Buenos_Aires' },
    }).as('saveSettings')

    // Change booking mode
    cy.contains('label', 'Turnos y walk-ins').click()

    cy.contains('button', 'Guardar configuración').click()
    cy.wait('@saveSettings')

    cy.contains('¡Guardado!').should('be.visible')
  })

  it('OWNER_SETTINGS_003: save settings shows error on API failure', () => {
    cy.intercept('PUT', '/api/barber-shop/settings', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('saveError')

    cy.contains('button', 'Guardar configuración').click()
    cy.wait('@saveError')

    cy.contains('Internal server error').should('be.visible')
    cy.contains('¡Guardado!').should('not.exist')
  })

  it('OWNER_SETTINGS_004: booking URL is shown and copyable', () => {
    cy.intercept('GET', '/api/barber-shop/settings', {
      statusCode: 200,
      body: {
        teamId: 'test-team-123',
        bookingMode: 'both',
        depositPercent: 0,
        bufferMinutes: 0,
        timezone: 'America/Argentina/Buenos_Aires',
      },
    }).as('settingsWithTeam')

    cy.visit('/dashboard/settings/shop')
    cy.wait('@settingsWithTeam')

    cy.contains('/book/test-team-123').should('be.visible')
    cy.contains('button', 'Copiar').click()
    cy.contains('Copiado').should('be.visible')
  })

  it('OWNER_SETTINGS_005: deposit section is hidden for walk-in-only mode', () => {
    // Select walk-in only
    cy.contains('label', 'Solo walk-in').click()
    cy.contains('Pago al reservar').should('not.exist')
  })
})
