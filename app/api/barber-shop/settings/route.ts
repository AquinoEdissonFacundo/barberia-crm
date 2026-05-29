import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { getTeamAndRole, getTeamId } from '@/themes/barbercrm/lib/team.helpers'
import { SettingsService } from '@/themes/barbercrm/lib/settings.service'

export async function GET(request: NextRequest) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teamId = await getTeamId(session.user.id)
    if (!teamId) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    const settings = await SettingsService.getSettings(teamId, session.user.id)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[ShopSettings/GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await getTeamAndRole(session.user.id)
    if (!member) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }
    if (!['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingMode, depositPercent, bufferMinutes, timezone, shopName, shopPhone,
            logoUrl, backgroundImageUrl, brandColor, welcomeText, shopSchedule } = body

    const validModes = ['appointment-only', 'both', 'walk-in-only']
    if (!validModes.includes(bookingMode)) {
      return NextResponse.json({ error: 'Invalid bookingMode' }, { status: 400 })
    }
    if (!timezone || typeof timezone !== 'string') {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 })
    }
    const deposit = Number(depositPercent ?? 0)
    const buffer  = Number(bufferMinutes ?? 0)
    if (isNaN(deposit) || deposit < 0 || deposit > 100) {
      return NextResponse.json({ error: 'depositPercent must be 0-100' }, { status: 400 })
    }
    if (isNaN(buffer) || buffer < 0 || buffer > 60) {
      return NextResponse.json({ error: 'bufferMinutes must be 0-60' }, { status: 400 })
    }
    if (shopName !== undefined && shopName !== null && (typeof shopName !== 'string' || shopName.length > 100)) {
      return NextResponse.json({ error: 'shopName must be a string of at most 100 characters' }, { status: 400 })
    }
    if (shopPhone !== undefined && shopPhone !== null && (typeof shopPhone !== 'string' || shopPhone.length > 30)) {
      return NextResponse.json({ error: 'shopPhone must be a string of at most 30 characters' }, { status: 400 })
    }
    if (logoUrl !== undefined && logoUrl !== null && typeof logoUrl !== 'string') {
      return NextResponse.json({ error: 'logoUrl must be a string' }, { status: 400 })
    }
    if (backgroundImageUrl !== undefined && backgroundImageUrl !== null && typeof backgroundImageUrl !== 'string') {
      return NextResponse.json({ error: 'backgroundImageUrl must be a string' }, { status: 400 })
    }
    if (brandColor !== undefined && (typeof brandColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(brandColor))) {
      return NextResponse.json({ error: 'brandColor must be a valid hex color' }, { status: 400 })
    }
    if (welcomeText !== undefined && welcomeText !== null && (typeof welcomeText !== 'string' || welcomeText.length > 200)) {
      return NextResponse.json({ error: 'welcomeText must be at most 200 characters' }, { status: 400 })
    }
    if (shopSchedule !== undefined && shopSchedule !== null && typeof shopSchedule !== 'object') {
      return NextResponse.json({ error: 'shopSchedule must be an object' }, { status: 400 })
    }

    const result = await SettingsService.upsertSettings(member.teamId, session.user.id, {
      bookingMode, depositPercent: deposit, bufferMinutes: buffer, timezone,
      shopName, shopPhone, logoUrl, backgroundImageUrl, brandColor, welcomeText, shopSchedule,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[ShopSettings/PUT] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
