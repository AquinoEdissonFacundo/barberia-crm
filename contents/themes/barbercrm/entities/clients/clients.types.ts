export interface Client {
  id: string
  name: string
  phone?: string
  email?: string
  notes?: string
  preferredService?: string
  visitFrequency?: number
  createdAt?: string
  updatedAt?: string
}

export interface ClientListOptions {
  limit?: number
  offset?: number
  orderBy?: 'name' | 'createdAt'
  orderDir?: 'asc' | 'desc'
}

export interface ClientListResult {
  clients: Client[]
  total: number
}

export interface CreateClientInput {
  name: string
  phone?: string
  email?: string
  notes?: string
  preferredService?: string
  visitFrequency?: number
}

export interface UpdateClientInput {
  name?: string
  phone?: string
  email?: string
  notes?: string
  preferredService?: string
  visitFrequency?: number
}
