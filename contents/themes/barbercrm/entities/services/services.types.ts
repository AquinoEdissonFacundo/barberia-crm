export type ServiceCategory = 'haircut' | 'beard' | 'color' | 'treatment' | 'other'

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  category: ServiceCategory
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ServiceListOptions {
  limit?: number
  offset?: number
  category?: ServiceCategory
  active?: boolean
  orderBy?: 'name' | 'price' | 'duration' | 'createdAt'
  orderDir?: 'asc' | 'desc'
}

export interface ServiceListResult {
  services: Service[]
  total: number
}

export interface CreateServiceInput {
  name: string
  description?: string
  price: number
  duration: number
  category?: ServiceCategory
  active?: boolean
}

export interface UpdateServiceInput {
  name?: string
  description?: string
  price?: number
  duration?: number
  category?: ServiceCategory
  active?: boolean
}
