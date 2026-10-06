import React, { useState } from 'react'
import type { CreateEntityDto, Entity, FormErrors } from '../types/entity'
import { normalizeStatus } from '../utils/entityHelpers'

interface EntityFormProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialData?: Entity | null
  presetCoordinates?: { lat: number; lng: number } | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (formData: CreateEntityDto) => Promise<void>
}

const COMMON_TYPES = [
  'Vehicle',
  'Facility',
  'Warehouse',
  'Tower',
  'Branch',
  'Sensor',
  'Substation',
  'Data Center',
  'Other',
]

export const EntityForm: React.FC<EntityFormProps> = ({
  isOpen,
  mode,
  initialData,
  presetCoordinates,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initialData?.name ?? '')
  const [type, setType] = useState(() => {
    if (!initialData) return 'Vehicle'
    return COMMON_TYPES.includes(initialData.type) ? initialData.type : 'Other'
  })
  const [customType, setCustomType] = useState(() => {
    if (!initialData) return ''
    return COMMON_TYPES.includes(initialData.type) ? '' : initialData.type
  })
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Maintenance'>(() =>
    normalizeStatus(initialData?.status)
  )
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [latitude, setLatitude] = useState(() => {
    if (initialData) return initialData.latitude.toString()
    if (presetCoordinates) return presetCoordinates.lat.toFixed(6)
    return ''
  })
  const [longitude, setLongitude] = useState(() => {
    if (initialData) return initialData.longitude.toString()
    if (presetCoordinates) return presetCoordinates.lng.toFixed(6)
    return ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  if (!isOpen) return null

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required.'
    }

    // Type validation
    const effectiveType = type === 'Other' ? customType.trim() : type.trim()
    if (!effectiveType) {
      newErrors.type = 'Type is required.'
    }

    // Status validation
    if (!status) {
      newErrors.status = 'Status is required.'
    }

    // Latitude validation: required, number, range -90 to 90
    if (latitude.trim() === '') {
      newErrors.latitude = 'Latitude is required.'
    } else {
      const latNum = Number(latitude)
      if (Number.isNaN(latNum)) {
        newErrors.latitude = 'Latitude must be a valid number.'
      } else if (latNum < -90 || latNum > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90.'
      }
    }

    // Longitude validation: required, number, range -180 to 180
    if (longitude.trim() === '') {
      newErrors.longitude = 'Longitude is required.'
    } else {
      const lngNum = Number(longitude)
      if (Number.isNaN(lngNum)) {
        newErrors.longitude = 'Longitude must be a valid number.'
      } else if (lngNum < -180 || lngNum > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const effectiveType = type === 'Other' ? customType.trim() : type.trim()

    const payload: CreateEntityDto = {
      name: name.trim(),
      type: effectiveType,
      status,
      description: description.trim() || undefined,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    }

    await onSubmit(payload)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entity-form-title"
    >
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden my-8">
        {/* Form Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70">
          <h2 id="entity-form-title" className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Entity' : 'Add New Entity'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="entity-name" className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="entity-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="e.g. Vehicle #001"
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none ${
                errors.name
                  ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Type Field */}
          <div>
            <label htmlFor="entity-type" className="block text-sm font-medium text-gray-700">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="entity-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                if (errors.type) setErrors((prev) => ({ ...prev, type: undefined }))
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {COMMON_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {type === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom type"
                value={customType}
                onChange={(e) => {
                  setCustomType(e.target.value)
                  if (errors.type) setErrors((prev) => ({ ...prev, type: undefined }))
                }}
                className={`mt-2 block w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none ${
                  errors.type
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            )}
            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
          </div>

          {/* Status Field */}
          <div>
            <label htmlFor="entity-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                  { value: 'Maintenance', label: 'Maintenance' },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                    status === option.value
                      ? `bg-gray-50 ring-2 ring-blue-500 border-transparent`
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="entity-status-radio"
                    value={option.value}
                    checked={status === option.value}
                    onChange={() => setStatus(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      option.value === 'Active'
                        ? 'bg-green-600'
                        : option.value === 'Maintenance'
                        ? 'bg-orange-600'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
          </div>

          {/* Coordinates (Latitude & Longitude) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="entity-lat" className="block text-sm font-medium text-gray-700">
                Latitude <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 font-normal ml-1">(-90 to 90)</span>
              </label>
              <input
                type="number"
                id="entity-lat"
                step="any"
                value={latitude}
                onChange={(e) => {
                  setLatitude(e.target.value)
                  if (errors.latitude) setErrors((prev) => ({ ...prev, latitude: undefined }))
                }}
                placeholder="-6.9175"
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none ${
                  errors.latitude
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {errors.latitude && <p className="mt-1 text-xs text-red-600">{errors.latitude}</p>}
            </div>

            <div>
              <label htmlFor="entity-lng" className="block text-sm font-medium text-gray-700">
                Longitude <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 font-normal ml-1">(-180 to 180)</span>
              </label>
              <input
                type="number"
                id="entity-lng"
                step="any"
                value={longitude}
                onChange={(e) => {
                  setLongitude(e.target.value)
                  if (errors.longitude) setErrors((prev) => ({ ...prev, longitude: undefined }))
                }}
                placeholder="107.6191"
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none ${
                  errors.longitude
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {errors.longitude && <p className="mt-1 text-xs text-red-600">{errors.longitude}</p>}
            </div>
          </div>

          <p className="text-xs text-gray-500 italic">
            Tip: You can also click anywhere on the map behind this form to set coordinates.
          </p>

          {/* Description Field (Optional) */}
          <div>
            <label htmlFor="entity-description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="entity-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kendaraan operasional..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Entity' : 'Save Entity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
