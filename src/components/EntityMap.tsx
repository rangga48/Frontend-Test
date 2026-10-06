import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Entity } from '../types/entity'
import { getStatusBadgeClass, getStatusLabel } from '../utils/entityHelpers'

interface EntityMapProps {
  entities: Entity[]
  selectedEntity: Entity | null
  onSelectEntity: (entity: Entity) => void
  onMapClick?: (lat: number, lng: number) => void
  isSelectingLocation?: boolean
  tempLocation?: { lat: number; lng: number } | null
}

// Function to generate SVG marker icons matching status colors
function createStatusIcon(status: string, isSelected: boolean) {
  let pinColor = '#6b7280' // default inactive
  let ringColor = '#9ca3af'

  const norm = (status || '').toLowerCase()
  if (norm === 'active') {
    pinColor = '#16a34a'
    ringColor = '#4ade80'
  } else if (norm === 'maintenance') {
    pinColor = '#ea580c'
    ringColor = '#fb923c'
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${isSelected ? 32 : 26}" height="${
    isSelected ? 48 : 39
  }">
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.35"/>
      </filter>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" 
            fill="${pinColor}" 
            filter="url(#shadow)"
            stroke="${isSelected ? '#ffffff' : ringColor}" 
            stroke-width="${isSelected ? 2 : 1}"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff" />
      <circle cx="12" cy="12" r="3" fill="${pinColor}" />
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: isSelected ? [32, 48] : [26, 39],
    iconAnchor: isSelected ? [16, 48] : [13, 39],
    popupAnchor: [0, isSelected ? -45 : -36],
  })
}

const tempPinIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" 
            fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#ffffff" />
    </svg>
  `,
  className: 'temp-marker-pin',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
})

// Sub-component to fly to selected entity or fit bounds
const MapViewController: React.FC<{
  selectedEntity: Entity | null
  entities: Entity[]
}> = ({ selectedEntity, entities }) => {
  const map = useMap()

  useEffect(() => {
    if (selectedEntity) {
      map.flyTo([selectedEntity.latitude, selectedEntity.longitude], Math.max(map.getZoom(), 13), {
        duration: 1.2,
      })
    }
  }, [selectedEntity, map])

  // Initial bounds fitting if multiple entities exist
  useEffect(() => {
    if (!selectedEntity && entities.length > 0) {
      const validPoints = entities
        .filter((e) => !isNaN(e.latitude) && !isNaN(e.longitude))
        .map((e) => [e.latitude, e.longitude] as [number, number])

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
      }
    }
  }, [entities, selectedEntity, map])

  return null
}

// Sub-component to capture map click events
const MapClickHandler: React.FC<{
  onMapClick?: (lat: number, lng: number) => void
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export const EntityMap: React.FC<EntityMapProps> = ({
  entities,
  selectedEntity,
  onSelectEntity,
  onMapClick,
  isSelectingLocation,
  tempLocation,
}) => {
  // Memoize marker icons
  const markerIcons = useMemo(() => {
    return {
      Active: createStatusIcon('Active', false),
      ActiveSelected: createStatusIcon('Active', true),
      Inactive: createStatusIcon('Inactive', false),
      InactiveSelected: createStatusIcon('Inactive', true),
      Maintenance: createStatusIcon('Maintenance', false),
      MaintenanceSelected: createStatusIcon('Maintenance', true),
    }
  }, [])

  const defaultCenter: [number, number] = [-6.2088, 106.8456] // Jakarta default center

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ minHeight: '100%', height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController selectedEntity={selectedEntity} entities={entities} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Temporary location marker if user is picking a spot */}
        {tempLocation && (
          <Marker position={[tempLocation.lat, tempLocation.lng]} icon={tempPinIcon}>
            <Popup>
              <div className="text-xs text-gray-700">
                <span className="font-semibold block">Picked Location</span>
                {tempLocation.lat.toFixed(5)}, {tempLocation.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Entity Markers */}
        {entities.map((entity) => {
          const isSelected = selectedEntity?.id === entity.id
          const iconKey = `${entity.status}${isSelected ? 'Selected' : ''}` as keyof typeof markerIcons
          const icon = markerIcons[iconKey] || markerIcons.Inactive

          return (
            <Marker
              key={entity.id}
              position={[entity.latitude, entity.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEntity(entity),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 mb-2 pr-7">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{entity.type}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusBadgeClass(
                        entity.status
                      )}`}
                    >
                      {getStatusLabel(entity.status)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 mb-1">{entity.name}</h4>

                  {entity.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                      {entity.description}
                    </p>
                  )}

                  <div className="text-[11px] font-mono text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100 mb-3">
                    {entity.latitude.toFixed(5)}, {entity.longitude.toFixed(5)}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectEntity(entity)
                    }}
                    className="w-full text-center py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Map Helper overlay banner if selecting location */}
      {isSelectingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm border border-blue-200 px-4 py-2 rounded-full shadow-md text-xs font-medium text-blue-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          Click anywhere on the map to set coordinates
        </div>
      )}
    </div>
  )
}
