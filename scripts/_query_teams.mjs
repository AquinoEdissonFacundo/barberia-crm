import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://postgres.mwktfzalxyygxaniniho:Fadasa222...@aws-1-us-west-2.pooler.supabase.com:5432/postgres'
})

await client.connect()

const barbers = await client.query('SELECT id, name, "teamId" FROM public.barbers LIMIT 5')
console.log('barbers:', JSON.stringify(barbers.rows))

try {
  const settings = await client.query('SELECT id, "teamId", "bookingMode" FROM public.shop_settings LIMIT 5')
  console.log('shop_settings:', JSON.stringify(settings.rows))
} catch (e) {
  console.log('shop_settings error:', e.message)
}

const teams = await client.query('SELECT id, name FROM public.teams LIMIT 10')
console.log('teams:', JSON.stringify(teams.rows))

await client.end()
