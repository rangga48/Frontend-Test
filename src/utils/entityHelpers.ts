export function normalizeStatus(status?: string): 'Active' | 'Inactive' | 'Maintenance' {
  const s = (status || '').toLowerCase()
  if (s === 'active') return 'Active'
  if (s === 'maintenance') return 'Maintenance'
  return 'Inactive'
}

export function getStatusBadgeClass(status?: string): string {
  const norm = normalizeStatus(status)
  switch (norm) {
    case 'Active':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'Maintenance':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'Inactive':
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

export function getStatusLabel(status?: string): string {
  return normalizeStatus(status)
}
