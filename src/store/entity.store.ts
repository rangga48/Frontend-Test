import { create } from 'zustand'
import { entityService } from '../services/entity.service'
import type { CreateEntityDto, Entity, EntityStatus, UpdateEntityDto } from '../types/entity'

export interface NotificationState {
  type: 'success' | 'error'
  message: string
}

let notificationTimer: ReturnType<typeof setTimeout> | null = null

export interface EntityStoreState {
  // Data state
  entities: Entity[]
  selectedEntity: Entity | null
  statusFilter: EntityStatus | 'all'
  isLoading: boolean
  isSubmitting: boolean
  isDeleting: boolean
  error: string | null
  notification: NotificationState | null

  // Modal / Form UI state
  isFormOpen: boolean
  formMode: 'create' | 'edit'
  editingEntity: Entity | null
  tempCoordinates: { lat: number; lng: number } | null

  // Delete confirmation UI state
  deleteTarget: Entity | null

  // Actions
  fetchEntities: () => Promise<void>
  createEntity: (formData: CreateEntityDto) => Promise<Entity | null>
  updateEntity: (id: string | number, formData: UpdateEntityDto) => Promise<Entity | null>
  deleteEntity: (id: string | number) => Promise<boolean>
  selectEntity: (entity: Entity | null) => void
  setStatusFilter: (filter: EntityStatus | 'all') => void

  // UI Modal Actions
  openCreateModal: (coords?: { lat: number; lng: number } | null) => void
  openEditModal: (entity: Entity) => void
  closeFormModal: () => void
  setTempCoordinates: (coords: { lat: number; lng: number } | null) => void
  openDeleteDialog: (entity: Entity) => void
  closeDeleteDialog: () => void
  confirmDelete: () => Promise<boolean>

  // Notification Actions
  setNotification: (type: 'success' | 'error', message: string) => void
  clearNotification: () => void
}

export const useEntityStore = create<EntityStoreState>((set, get) => ({
  // Initial states
  entities: [],
  selectedEntity: null,
  statusFilter: 'all',
  isLoading: false,
  isSubmitting: false,
  isDeleting: false,
  error: null,
  notification: null,

  isFormOpen: false,
  formMode: 'create',
  editingEntity: null,
  tempCoordinates: null,
  deleteTarget: null,

  // Fetch all entities
  fetchEntities: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await entityService.getEntities()
      set({ entities: data, isLoading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch entities'
      set({ error: message, isLoading: false })
    }
  },

  // Create entity
  createEntity: async (formData: CreateEntityDto) => {
    set({ isSubmitting: true })
    try {
      const created = await entityService.createEntity(formData)
      set((state) => ({
        entities: [created, ...state.entities],
        selectedEntity: created,
        isFormOpen: false,
        tempCoordinates: null,
        editingEntity: null,
      }))
      get().setNotification('success', `Entity "${created.name}" created successfully.`)
      return created
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create entity'
      get().setNotification('error', message)
      return null
    } finally {
      set({ isSubmitting: false })
    }
  },

  // Update entity
  updateEntity: async (id: string | number, formData: UpdateEntityDto) => {
    set({ isSubmitting: true })
    try {
      const updated = await entityService.updateEntity(id, formData)
      set((state) => ({
        entities: state.entities.map((item) =>
          String(item.id) === String(id) ? updated : item
        ),
        selectedEntity:
          state.selectedEntity && String(state.selectedEntity.id) === String(id)
            ? updated
            : state.selectedEntity,
        isFormOpen: false,
        editingEntity: null,
      }))
      get().setNotification('success', `Entity "${updated.name}" updated successfully.`)
      return updated
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update entity'
      get().setNotification('error', message)
      return null
    } finally {
      set({ isSubmitting: false })
    }
  },

  // Delete entity by direct ID
  deleteEntity: async (id: string | number) => {
    set({ isDeleting: true })
    try {
      await entityService.deleteEntity(id)
      set((state) => ({
        entities: state.entities.filter((item) => String(item.id) !== String(id)),
        selectedEntity:
          state.selectedEntity && String(state.selectedEntity.id) === String(id)
            ? null
            : state.selectedEntity,
      }))
      get().setNotification('success', 'Entity deleted successfully.')
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete entity'
      get().setNotification('error', message)
      return false
    } finally {
      set({ isDeleting: false })
    }
  },

  // Select entity
  selectEntity: (entity) => {
    set({ selectedEntity: entity })
  },

  // Status filter
  setStatusFilter: (filter) => {
    set({ statusFilter: filter })
  },

  // Modal actions
  openCreateModal: (coords = null) => {
    set({
      formMode: 'create',
      editingEntity: null,
      tempCoordinates: coords,
      isFormOpen: true,
    })
  },

  openEditModal: (entity) => {
    set({
      formMode: 'edit',
      editingEntity: entity,
      tempCoordinates: null,
      isFormOpen: true,
    })
  },

  closeFormModal: () => {
    set({
      isFormOpen: false,
      editingEntity: null,
      tempCoordinates: null,
    })
  },

  setTempCoordinates: (coords) => {
    set({ tempCoordinates: coords })
  },

  openDeleteDialog: (entity) => {
    set({ deleteTarget: entity })
  },

  closeDeleteDialog: () => {
    set({ deleteTarget: null })
  },

  // Confirm delete target
  confirmDelete: async () => {
    const target = get().deleteTarget
    if (!target) return false

    set({ isDeleting: true })
    try {
      await entityService.deleteEntity(target.id)
      set((state) => ({
        entities: state.entities.filter((item) => String(item.id) !== String(target.id)),
        selectedEntity:
          state.selectedEntity && String(state.selectedEntity.id) === String(target.id)
            ? null
            : state.selectedEntity,
        deleteTarget: null,
      }))
      get().setNotification('success', `Entity "${target.name}" deleted successfully.`)
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete entity'
      get().setNotification('error', message)
      return false
    } finally {
      set({ isDeleting: false })
    }
  },

  // Notification actions
  setNotification: (type, message) => {
    if (notificationTimer) {
      clearTimeout(notificationTimer)
    }
    set({ notification: { type, message } })
    notificationTimer = setTimeout(() => {
      set({ notification: null })
    }, 4000)
  },

  clearNotification: () => {
    if (notificationTimer) {
      clearTimeout(notificationTimer)
    }
    set({ notification: null })
  },
}))

/**
 * Selector for filtering entities based on active status filter
 */
export const selectFilteredEntities = (state: EntityStoreState): Entity[] => {
  if (state.statusFilter === 'all') return state.entities
  return state.entities.filter(
    (e) => (e.status || '').toLowerCase() === (state.statusFilter || '').toLowerCase()
  )
}

