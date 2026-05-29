import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { queryWithRLS } from '@nextsparkjs/core/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface DbClient {
  id: string
  name: string
  phone: string | null
  preferredService: string | null
  visitFrequency: number | null
  notes: string | null
}

interface DbAppointment {
  id: string
  date: string
  status: string
  totalPrice: number | null
  serviceName: string | null
  barberName: string | null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = request.nextUrl.searchParams.get('clientId')
    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
    }

    const userId = session.user.id

    // Fetch client data
    const clients = await queryWithRLS<DbClient>(
      `SELECT id, name, phone, "preferredService", "visitFrequency", notes
       FROM clients WHERE id = $1`,
      [clientId],
      userId
    )

    if (!clients.length) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const client = clients[0]

    // Fetch appointment history
    const appointments = await queryWithRLS<DbAppointment>(
      `SELECT
        a.id, a.date, a.status, a."totalPrice",
        s.name as "serviceName",
        b.name as "barberName"
       FROM appointments a
       LEFT JOIN services s ON a."serviceId" = s.id
       LEFT JOIN barbers b ON a."barberId" = b.id
       WHERE a."clientId" = $1
       ORDER BY a.date DESC
       LIMIT 10`,
      [clientId],
      userId
    )

    // Calculate days since last visit
    const lastVisit = appointments.find(a => a.status === 'completed')
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - new Date(lastVisit.date).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const totalVisits = appointments.filter(a => a.status === 'completed').length

    // Build context for Claude
    const appointmentHistory = appointments
      .map(a => `- ${a.date}: ${a.serviceName || 'Unknown service'} by ${a.barberName || 'Unknown barber'} (${a.status})${a.totalPrice ? ` - $${a.totalPrice}` : ''}`)
      .join('\n')

    const prompt = `You are an assistant for a barbershop CRM. Analyze this client's data and provide a brief summary and a suggested WhatsApp message.

Client: ${client.name}
Phone: ${client.phone || 'Not provided'}
Preferred service: ${client.preferredService || 'Not specified'}
Visit frequency: every ${client.visitFrequency || '?'} days
Days since last visit: ${daysSinceLastVisit ?? 'Unknown'}
Total completed visits: ${totalVisits}
Internal notes: ${client.notes || 'None'}

Recent appointment history:
${appointmentHistory || 'No appointments yet'}

Respond in JSON format with exactly these fields:
{
  "summary": "2-3 sentence summary of the client's profile and visit patterns",
  "suggestedMessage": "A friendly WhatsApp message to send the client (in Spanish, max 2 sentences)",
  "insight": "One actionable tip for the barber about this client"
}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let aiData
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: responseText, suggestedMessage: '', insight: '' }
    } catch {
      aiData = { summary: responseText, suggestedMessage: '', insight: '' }
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        totalVisits,
        daysSinceLastVisit,
      },
      ai: aiData,
    })

  } catch (error) {
    console.error('[BarberAI] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
