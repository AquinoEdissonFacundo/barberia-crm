import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { queryWithRLS, getTransactionClient } from '@nextsparkjs/core/lib/db'
import { computeAvailableSlots } from '@/themes/barbercrm/lib/availability'
import type { BarberSchedule } from '@/themes/barbercrm/entities/barbers/barbers.types'
import type { ShopSettings } from '@/themes/barbercrm/lib/shop-settings.types'
import { DEFAULT_SHOP_SETTINGS } from '@/themes/barbercrm/lib/shop-settings.types'

// Lazy singleton — one instance per cold start, not per request.
// Only instantiated when a booking with depositPercent > 0 is confirmed.
let _stripe: Stripe | null = null
function getStripeClient(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(key)
  }
  return _stripe
}

function buildWhatsAppUrl(phone: string, name: string, date: string, time: string, service: string) {
  const clean = phone.replace(/\D/g, '')
  const msg = encodeURIComponent(
    `Hola! Soy ${name} y acabo de reservar un turno para ${service} el ${date} a las ${time}. ¡Muchas gracias!`
  )
  return `https://wa.me/${clean}?text=${msg}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const body = await request.json()
    const { serviceId, barberId, date, time, clientName, clientPhone } = body

    if (!serviceId || !barberId || !date || !time || !clientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const dateRe = /^\d{4}-\d{2}-\d{2}$/
    const timeRe = /^\d{2}:\d{2}$/
    if (!dateRe.test(date) || !timeRe.test(time)) {
      return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 })
    }
    if (typeof clientName !== 'string' || clientName.length > 100) {
      return NextResponse.json({ error: 'Invalid clientName' }, { status: 400 })
    }
    if (clientPhone !== undefined && (typeof clientPhone !== 'string' || clientPhone.length > 30)) {
      return NextResponse.json({ error: 'Invalid clientPhone' }, { status: 400 })
    }

    // Load settings, barber schedule, and service in parallel
    const [settingsRows, barberRows, serviceRows] = await Promise.all([
      queryWithRLS<ShopSettings>(
        `SELECT * FROM "shop_settings" WHERE "teamId" = $1`,
        [teamId]
      ),
      queryWithRLS<{ id: string; schedule: BarberSchedule }>(
        `SELECT id, schedule FROM "barbers" WHERE id = $1 AND "teamId" = $2 AND active = true`,
        [barberId, teamId]
      ),
      queryWithRLS<{ id: string; name: string; price: number; duration: number }>(
        `SELECT id, name, price, duration FROM "services" WHERE id = $1 AND "teamId" = $2 AND active = true`,
        [serviceId, teamId]
      ),
    ])

    const settings: ShopSettings = settingsRows[0] ?? { ...DEFAULT_SHOP_SETTINGS, teamId, id: '' }

    if (settings.bookingMode === 'walk-in-only') {
      return NextResponse.json({ error: 'Online booking not available' }, { status: 403 })
    }
    if (!barberRows[0] || !serviceRows[0]) {
      return NextResponse.json({ error: 'Barber or service not found' }, { status: 404 })
    }
    const service        = serviceRows[0]
    const bufferMinutes  = settings.bufferMinutes
    const depositPercent = settings.depositPercent

    // Use transaction + SELECT FOR UPDATE to prevent double booking
    const tx = await getTransactionClient()

    try {
      // Lock ALL active appointments for this barber/date to prevent race conditions.
      // We lock the entire day so that concurrent requests can't both pass the overlap check.
      const conflicts = await tx.query<{ id: string }>(
        `SELECT id FROM "appointments"
         WHERE "barberId" = $1
           AND "teamId"   = $2
           AND date       = $3
           AND status IN ('scheduled', 'confirmed', 'in-progress', 'pending')
         FOR UPDATE`,
        [barberId, teamId, date]
      )

      // If any appointments exist for the day, check overlap using the full algorithm below.
      // (We don't 409 here — the locked rows feed into computeAvailableSlots below.)

      // Re-validate the slot is still available using the full overlap algorithm
      const existingForDay = await tx.query<{ time: string; serviceDuration: number }>(
        `SELECT a.time, s.duration as "serviceDuration"
         FROM "appointments" a
         JOIN "services" s ON s.id = a."serviceId"
         WHERE a."barberId" = $1
           AND a."teamId"   = $2
           AND a.date       = $3
           AND a.status IN ('scheduled', 'confirmed', 'in-progress', 'pending')`,
        [barberId, teamId, date]
      )

      const availableSlots = computeAvailableSlots(
        barberRows[0].schedule,
        service.duration,
        bufferMinutes,
        existingForDay,
        date
      )

      if (!availableSlots.includes(time)) {
        await tx.rollback()
        return NextResponse.json(
          { error: 'This time slot is no longer available' },
          { status: 409 }
        )
      }

      const needsDeposit    = depositPercent > 0 && clientPhone
      const depositAmount   = needsDeposit ? Math.round((service.price * depositPercent) / 100 * 100) / 100 : null
      const status          = needsDeposit ? 'pending' : 'confirmed'
      const depositStatus   = needsDeposit ? 'pending' : 'none'
      const pendingExpiresAt = needsDeposit ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null

      // Insert appointment
      const [appointment] = await tx.query<{ id: string }>(
        `INSERT INTO "appointments" (
          "teamId", "barberId", "serviceId", date, time, status,
          "totalPrice", "bookingSource", "depositStatus", "depositAmount",
          "clientName", "clientPhone", "pendingExpiresAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,'self-booking',$8,$9,$10,$11,$12)
        RETURNING id`,
        [
          teamId, barberId, serviceId, date, time, status,
          service.price, depositStatus, depositAmount,
          clientName, clientPhone ?? null, pendingExpiresAt,
        ]
      )

      if (needsDeposit) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        if (!appUrl) {
          await tx.rollback()
          console.error('[Booking/Confirm] NEXT_PUBLIC_APP_URL is not set — cannot create Stripe session')
          return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Create Stripe checkout session
        const session = await getStripeClient().checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Seña — ${service.name}`,
                description: `Reserva para el ${date} a las ${time}. El monto es el ${depositPercent}% del servicio.`,
              },
              unit_amount: Math.round(depositAmount! * 100), // Stripe uses cents
            },
            quantity: 1,
          }],
          success_url: `${appUrl}/book/${teamId}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url:  `${appUrl}/book/${teamId}?cancelled=1`,
          metadata: { appointmentId: appointment.id, teamId },
        })

        await tx.query(
          `UPDATE "appointments" SET "stripeSessionId" = $1 WHERE id = $2`,
          [session.id, appointment.id]
        )

        await tx.commit()

        return NextResponse.json({
          requiresPayment: true,
          checkoutUrl: session.url,
          appointmentId: appointment.id,
        })
      }

      await tx.commit()

      const whatsappUrl = clientPhone
        ? buildWhatsAppUrl(clientPhone, clientName, date, time, service.name)
        : null

      return NextResponse.json({
        requiresPayment: false,
        whatsappUrl,
        appointmentId: appointment.id,
      })
    } catch (err) {
      await tx.rollback()
      throw err
    }
  } catch (error) {
    console.error('[Booking/Confirm] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
