import axios from 'axios'
import type {
  BackendApiResponse,
  BackendEntityPayload,
  BackendEntityRaw,
  CreateEntityDto,
  Entity,
  UpdateEntityDto,
} from '../types/entity'
import { normalizeStatus } from '../utils/entityHelpers'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
})

// Helper to convert backend response item into frontend Entity model
export function transformBackendEntity(raw: BackendEntityRaw): Entity {
  const latVal = typeof raw.latitude === 'string' ? parseFloat(raw.latitude) : Number(raw.latitude)
  const lngRaw = raw.longitude !== undefined ? raw.longitude : raw.longtitude
  const lngVal = typeof lngRaw === 'string' ? parseFloat(lngRaw) : Number(lngRaw ?? 0)

  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    status: normalizeStatus(raw.status),
    description: raw.description ?? '',
    latitude: isNaN(latVal) ? 0 : latVal,
    longitude: isNaN(lngVal) ? 0 : lngVal,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
  }
}

// Helper to convert frontend DTO into exact backend payload schema
export function toBackendPayload(dto: CreateEntityDto | UpdateEntityDto): BackendEntityPayload {
  return {
    name: dto.name ?? '',
    type: dto.type ?? '',
    status: normalizeStatus(dto.status),
    description: dto.description ?? '',
    latitude: String(dto.latitude ?? ''),
    longtitude: String(dto.longitude ?? ''),
  }
}

export const entityApi = {
  // GET http://localhost:8080/api/entities
  async getEntities(): Promise<Entity[]> {
    const response = await apiClient.get<BackendApiResponse<BackendEntityRaw[]> | BackendEntityRaw[]>('/entities')
    let rawList: BackendEntityRaw[] = []

    if (Array.isArray(response.data)) {
      rawList = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      rawList = response.data.data
    }

    return rawList.map(transformBackendEntity)
  },

  // POST http://localhost:8080/api/entities
  async createEntity(data: CreateEntityDto): Promise<Entity> {
    const payload = toBackendPayload(data)
    const response = await apiClient.post<BackendApiResponse<BackendEntityRaw> | BackendEntityRaw>(
      '/entities',
      payload
    )

    const rawItem =
      response.data && 'data' in response.data && response.data.data
        ? response.data.data
        : (response.data as BackendEntityRaw)

    return transformBackendEntity(rawItem)
  },

  // PUT http://localhost:8080/api/entities?id={id}
  async updateEntity(id: string | number, data: UpdateEntityDto): Promise<Entity> {
    const payload = toBackendPayload(data)
    const response = await apiClient.put<BackendApiResponse<BackendEntityRaw> | BackendEntityRaw>(
      '/entities',
      payload,
      {
        params: { id: String(id) },
      }
    )

    const rawItem =
      response.data && 'data' in response.data && response.data.data
        ? response.data.data
        : (response.data as BackendEntityRaw)

    return transformBackendEntity(rawItem)
  },

  // DELETE http://localhost:8080/api/entities?id={id}
  async deleteEntity(id: string | number): Promise<void> {
    await apiClient.delete('/entities', {
      params: { id: String(id) },
    })
  },
}
