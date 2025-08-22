import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString()
}

export function isDeadlineApproaching(deadline: string, daysThreshold: number = 30): boolean {
  const deadlineDate = new Date(deadline)
  const today = new Date()
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= daysThreshold && diffDays >= 0
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'submitted':
      return 'bg-green-100 text-green-800'
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800'
    case 'accepted':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'waitlisted':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}