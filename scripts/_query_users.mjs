import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://postgres.mwktfzalxyygxaniniho:Fadasa222...@aws-1-us-west-2.pooler.supabase.com:5432/postgres'
})

await client.connect()

const users = await client.query('SELECT id, email, name FROM public.users LIMIT 10')
console.log('users:', JSON.stringify(users.rows))

await client.end()
