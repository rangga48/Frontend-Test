import React from 'react'
import type { Entity } from '../types/entity'
import { getStatusBadgeClass, getStatusLabel } from '../utils/entityHelpers'

interface EntityDetailProps {
  entity: Entity | null
  isOpen: boolean
  onClose: () => void
  onEdit: (entity: Entity) => void
  onDelete: (entity: Entity) => void
}

export const EntityDetail: React.FC<EntityDetailProps> = ({
  entity,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !entity) return null

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col justify-between overflow-y-auto"
      aria-label="Entity Details"
    >
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-500">
              Entity Details
            </span>
            <h2 className="text-lg font-bold text-gray-900 truncate max-w-[240px]">
              {entity.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status & Type */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm font-semibold text-gray-800">{entity.type}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                  entity.status
                )}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    entity.status === 'Active'
                      ? 'bg-green-600'
                      : entity.status === 'Maintenance'
                      ? 'bg-orange-600'
                      : 'bg-gray-500'
                  }`}
                />
                {getStatusLabel(entity.status)}
              </span>
            </div>
          </div>

          {/* Coordinates */}
          <div className="rounded-md bg-gray-50 border border-gray-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Coordinates
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs text-gray-500 block">Latitude</span>
                <span className="font-mono text-gray-800 font-medium">
                  {entity.latitude.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Longitude</span>
                <span className="font-mono text-gray-800 font-medium">
                  {entity.longitude.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">
              Description
            </p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white border border-gray-200 rounded-md p-3 min-h-[70px]">
              {entity.description && entity.description.trim().length > 0
                ? entity.description
                : 'No description provided.'}
            </p>
          </div>

          {/* Metadata */}
          {entity.createdAt && (
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              Created: {new Date(entity.createdAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onEdit(entity)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(entity)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </aside>
  )
}
