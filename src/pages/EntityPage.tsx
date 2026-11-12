import React, { useEffect, useMemo } from 'react'
import { EntityMap } from '../components/EntityMap'
import { EntityDetail } from '../components/EntityDetail'
import { EntityForm } from '../components/EntityForm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useEntityStore } from '../store/entity.store'
import type { CreateEntityDto } from '../types/entity'

export const EntityPage: React.FC = () => {
  const {
    entities,
    selectedEntity,
    statusFilter,
    isLoading,
    isSubmitting,
    isDeleting,
    error,
    notification,
    isFormOpen,
    formMode,
    editingEntity,
    tempCoordinates,
    deleteTarget,
    fetchEntities,
    createEntity,
    updateEntity,
    selectEntity,
    setStatusFilter,
    openCreateModal,
    openEditModal,
    closeFormModal,
    setTempCoordinates,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    clearNotification,
  } = useEntityStore()

  const filteredEntities = useMemo(() => {
    if (statusFilter === 'all') return entities
    return entities.filter(
      (e) => (e.status || '').toLowerCase() === statusFilter.toLowerCase()
    )
  }, [entities, statusFilter])

  // Fetch initial entities on mount once
  useEffect(() => {
    useEntityStore.getState().fetchEntities()
  }, [])

  // Handle form submission (Create or Update)
  const handleFormSubmit = async (formData: CreateEntityDto) => {
    if (formMode === 'edit' && editingEntity) {
      await updateEntity(editingEntity.id, formData)
    } else {
      await createEntity(formData)
    }
  }

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    if (isFormOpen) {
      setTempCoordinates({ lat, lng })
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-gray-800">
      {/* Header */}
      <header className="h-16 flex-none bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 m-0">Entity Map</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            {filteredEntities.length} {filteredEntities.length === 1 ? 'entity' : 'entities'}
            {statusFilter !== 'all' && ` (${entities.length} total)`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter buttons */}
          <div className="hidden md:flex items-center rounded-md border border-gray-200 p-0.5 text-xs bg-gray-50">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
                statusFilter === 'active'
                  ? 'bg-white text-green-700 shadow-sm border border-green-200'
                  : 'text-gray-600 hover:text-green-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('maintenance')}
              className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
                statusFilter === 'maintenance'
                  ? 'bg-white text-orange-700 shadow-sm border border-orange-200'
                  : 'text-gray-600 hover:text-orange-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Maintenance
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-white text-gray-800 shadow-sm border border-gray-300'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Inactive
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Entity
          </button>
        </div>
      </header>

      {/* Main Map View Area */}
      <main className="relative flex-1 w-full h-[calc(100vh-64px)] overflow-hidden">
        {/* Floating Notification Toast */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-md w-full px-4 transition-all">
            <div
              className={`flex items-center justify-between rounded-md p-3 shadow-lg border text-sm ${
                notification.type === 'success'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{notification.message}</span>
              </div>
              <button
                type="button"
                onClick={clearNotification}
                className="text-gray-400 hover:text-gray-600 ml-3"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Global Loading Indicator */}
        {isLoading && (
          <div className="absolute top-4 left-4 z-30 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-md px-3 py-2 shadow-sm flex items-center gap-2 text-xs text-gray-700">
            <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading entities...
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="absolute top-4 left-4 z-30 bg-red-50 border border-red-200 rounded-md px-3 py-2 shadow-sm flex items-center gap-2 text-xs text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchEntities()}
              className="ml-2 font-semibold underline text-red-800 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State Banner (when no entities registered at all) */}
        {!isLoading && entities.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-lg p-6 shadow-xl max-w-sm text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No Entities Found</h3>
            <p className="text-xs text-gray-500 mb-4">
              No geographical entities registered yet. Click below to add your first entity.
            </p>
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
            >
              + Add Entity
            </button>
          </div>
        )}

        {/* Filter Empty State Banner (when entities exist but none match filter) */}
        {!isLoading && entities.length > 0 && filteredEntities.length === 0 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 shadow-md text-center max-w-xs">
            <p className="text-xs text-gray-600">
              No entities found with status <span className="font-semibold capitalize text-gray-900">"{statusFilter}"</span>.
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="mt-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Reset filter to All
            </button>
          </div>
        )}

        {/* Map Component */}
        <EntityMap
          entities={filteredEntities}
          selectedEntity={selectedEntity}
          onSelectEntity={selectEntity}
          onMapClick={handleMapClick}
          isSelectingLocation={isFormOpen}
          tempLocation={tempCoordinates}
        />

        {/* Entity Detail Side Panel */}
        <EntityDetail
          entity={selectedEntity}
          isOpen={Boolean(selectedEntity)}
          onClose={() => selectEntity(null)}
          onEdit={openEditModal}
          onDelete={openDeleteDialog}
        />
      </main>

      {/* Add / Edit Form Modal */}
      <EntityForm
        key={`${formMode}-${editingEntity?.id ?? 'new'}-${tempCoordinates?.lat ?? ''}-${tempCoordinates?.lng ?? ''}`}
        isOpen={isFormOpen}
        mode={formMode}
        initialData={editingEntity}
        presetCoordinates={tempCoordinates}
        isSubmitting={isSubmitting}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Entity"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  )
}
