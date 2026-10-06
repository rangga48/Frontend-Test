export type EntityStatus = 'Active' | 'Inactive' | 'Maintenance' | 'active' | 'inactive' | 'maintenance'

export interface Entity {
  id: string | number
  name: string
  type: string
  status: 'Active' | 'Inactive' | 'Maintenance'
  description?: string
  latitude: number
  longitude: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateEntityDto {
  name: string
  type: string
  status: 'Active' | 'Inactive' | 'Maintenance'
  description?: string
  latitude: number
  longitude: number
}

export type UpdateEntityDto = Partial<CreateEntityDto>

export interface BackendEntityPayload {
  name: string
  type: string
  status: string
  description?: string
  latitude: string
  longtitude: string
}

export interface BackendEntityRaw {
  id: string | number
  name: string
  type: string
  status: string
  description?: string
  latitude: number | string
  longitude?: number | string
  longtitude?: number | string
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export interface BackendApiResponse<T> {
  status: string
  message: string
  data: T
}

export interface FormErrors {
  name?: string
  type?: string
  status?: string
  latitude?: string
  longitude?: string
  description?: string
}
