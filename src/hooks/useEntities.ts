import { useCallback, useEffect, useState } from 'react'
import { entityApi } from '../services/entityApi'
import type { CreateEntityDto, Entity, UpdateEntityDto } from '../types/entity'

export interface NotificationState {
  type: 'success' | 'error'
  message: string
}

export function useEntities() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [notification, setNotification] = useState<NotificationState | null>(null)

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr))
    }, 4000)
  }, [])

  const clearNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const fetchEntities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await entityApi.getEntities()
      setEntities(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch entities'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const loadInitial = async () => {
      try {
        const data = await entityApi.getEntities()
        if (!ignore) {
          setEntities(data)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'Failed to fetch entities'
          setError(message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInitial()

    return () => {
      ignore = true
    }
  }, [])

  const selectEntity = useCallback((entity: Entity | null) => {
    setSelectedEntity(entity)
  }, [])

  const createEntity = useCallback(
    async (dto: CreateEntityDto): Promise<Entity | null> => {
      try {
        const created = await entityApi.createEntity(dto)
        setEntities((prev) => [created, ...prev])
        showNotification('success', `Entity "${created.name}" created successfully.`)
        return created
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create entity'
        showNotification('error', message)
        return null
      }
    },
    [showNotification]
  )

  const updateEntity = useCallback(
    async (id: string | number, dto: UpdateEntityDto): Promise<Entity | null> => {
      try {
        const updated = await entityApi.updateEntity(id, dto)
        setEntities((prev) => prev.map((item) => (String(item.id) === String(id) ? updated : item)))
        if (selectedEntity && String(selectedEntity.id) === String(id)) {
          setSelectedEntity(updated)
        }
        showNotification('success', `Entity "${updated.name}" updated successfully.`)
        return updated
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update entity'
        showNotification('error', message)
        return null
      }
    },
    [selectedEntity, showNotification]
  )

  const deleteEntity = useCallback(
    async (id: string | number): Promise<boolean> => {
      try {
        await entityApi.deleteEntity(id)
        setEntities((prev) => prev.filter((item) => String(item.id) !== String(id)))
        if (selectedEntity && String(selectedEntity.id) === String(id)) {
          setSelectedEntity(null)
        }
        showNotification('success', 'Entity deleted successfully.')
        return true
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete entity'
        showNotification('error', message)
        return false
      }
    },
    [selectedEntity, showNotification]
  )

  return {
    entities,
    loading,
    error,
    selectedEntity,
    notification,
    selectEntity,
    fetchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    showNotification,
    clearNotification,
  }
}
