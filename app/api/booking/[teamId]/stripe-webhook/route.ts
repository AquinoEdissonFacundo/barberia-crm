import { NextRequest, NextResponse } from 'next/server'
import { queryWithRLS } from '@nextsparkjs/core/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: { type: string; data: { object: Record<string, unknown> } }

  try {
    const stripe = (await import('stripe')).default
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!)
    event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    ) as unknown as typeof event
  } catch (err) {
    console.error('[Booking/Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const session = event.data.object as { id: string; metadata?: { teamId?: string } }

  // Verify the webhook is for this team
  if (session.metadata?.teamId !== teamId) {
    return NextResponse.json({ error: 'Team mismatch' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      // Idempotent: WHERE depositStatus != 'paid' prevents double-processing retries
      await queryWithRLS(
        `UPDATE "appointments"
         SET status = 'confirmed', "depositStatus" = 'paid', "pendingExpiresAt" = NULL
         WHERE "stripeSessionId" = $1
           AND "teamId"          = $2
           AND "depositStatus"  != 'paid'`,
        [session.id, teamId]
      )
      console.info('[Booking/Webhook] Payment confirmed for session:', session.id)
    }

    if (event.type === 'checkout.session.expired') {
      await queryWithRLS(
        `UPDATE "appointments"
         SET status = 'cancelled', "depositStatus" = 'none'
         WHERE "stripeSessionId" = $1
           AND "teamId"          = $2
           AND "depositStatus"   = 'pending'`,
        [session.id, teamId]
      )
      console.info('[Booking/Webhook] Session expired, appointment cancelled:', session.id)
    }
  } catch (err) {
    // Log but always return 200 so Stripe stops retrying
    console.error('[Booking/Webhook] DB update failed:', err)
  }

  return NextResponse.json({ received: true })
}
