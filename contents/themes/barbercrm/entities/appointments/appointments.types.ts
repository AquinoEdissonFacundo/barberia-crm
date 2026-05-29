export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'

export interface Appointment {
  id: string
  clientId: string
  barberId: string
  serviceId: string
  date: string
  time: string
  status: AppointmentStatus
  notes?: string
  totalPrice?: number
  createdAt?: string
  updatedAt?: string
}

export interface AppointmentListOptions {
  limit?: number
  offset?: number
  status?: AppointmentStatus
  barberId?: string
  clientId?: string
  date?: string
  orderBy?: 'date' | 'createdAt'
  orderDir?: 'asc' | 'desc'
}

export interface AppointmentListResult {
  appointments: Appointment[]
  total: number
}

export interface CreateAppointmentInput {
  clientId: string
  barberId: string
  serviceId: string
  date: string
  time: string
  status?: AppointmentStatus
  notes?: string
  totalPrice?: number
}

export interface UpdateAppointmentInput {
  clientId?: string
  barberId?: string
  serviceId?: string
  date?: string
  time?: string
  status?: AppointmentStatus
  notes?: string
  totalPrice?: number
}
