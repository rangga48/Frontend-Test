import { api } from "./api";
import type {
  BackendApiResponse,
  BackendEntityPayload,
  BackendEntityRaw,
  CreateEntityDto,
  Entity,
  UpdateEntityDto,
} from "../types/entity";
import { normalizeStatus } from "../utils/entityHelpers";

export function transformBackendEntity(raw: BackendEntityRaw): Entity {
  const latVal =
    typeof raw.latitude === "string"
      ? parseFloat(raw.latitude)
      : Number(raw.latitude);
  const lngRaw = raw.longitude !== undefined ? raw.longitude : raw.longtitude;
  const lngVal =
    typeof lngRaw === "string" ? parseFloat(lngRaw) : Number(lngRaw ?? 0);

  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    status: normalizeStatus(raw.status),
    description: raw.description ?? "",
    latitude: isNaN(latVal) ? 0 : latVal,
    longitude: isNaN(lngVal) ? 0 : lngVal,
    createdAt: raw.created_at ?? raw.createdAt,
    updatedAt: raw.updated_at ?? raw.updatedAt,
  };
}

export function toBackendPayload(
  dto: CreateEntityDto | UpdateEntityDto,
): BackendEntityPayload {
  return {
    name: dto.name ?? "",
    type: dto.type ?? "",
    status: normalizeStatus(dto.status),
    description: dto.description ?? "",
    latitude: String(dto.latitude ?? ""),
    longtitude: String(dto.longitude ?? ""),
  };
}

export const entityService = {
  async getEntities(): Promise<Entity[]> {
    const response = await api.get<
      BackendApiResponse<BackendEntityRaw[]> | BackendEntityRaw[]
    >("/entities");
    let rawList: BackendEntityRaw[] = [];

    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      rawList = response.data.data;
    }

    return rawList.map(transformBackendEntity);
  },

  async getEntityById(id: string | number): Promise<Entity> {
    const response = await api.get<
      BackendApiResponse<BackendEntityRaw> | BackendEntityRaw
    >(`/entities/${id}`);
    const rawItem =
      response.data && "data" in response.data && response.data.data
        ? response.data.data
        : (response.data as BackendEntityRaw);

    return transformBackendEntity(rawItem);
  },

  async createEntity(data: CreateEntityDto): Promise<Entity> {
    const payload = toBackendPayload(data);
    const response = await api.post<
      BackendApiResponse<BackendEntityRaw> | BackendEntityRaw
    >("/entities", payload);

    const rawItem =
      response.data && "data" in response.data && response.data.data
        ? response.data.data
        : (response.data as BackendEntityRaw);

    return transformBackendEntity(rawItem);
  },

  async updateEntity(
    id: string | number,
    data: UpdateEntityDto,
  ): Promise<Entity> {
    const payload = toBackendPayload(data);
    const response = await api.put<
      BackendApiResponse<BackendEntityRaw> | BackendEntityRaw
    >("/entities", payload, {
      params: { id: String(id) },
    });

    const rawItem =
      response.data && "data" in response.data && response.data.data
        ? response.data.data
        : (response.data as BackendEntityRaw);

    return transformBackendEntity(rawItem);
  },

  async deleteEntity(id: string | number): Promise<void> {
    await api.delete("/entities", {
      params: { id: String(id) },
    });
  },
};

export default entityService;
