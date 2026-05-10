import { format, formatDistanceToNow, parseISO } from 'date-fns'

function toDate(date: string | number | Date): Date {
  return typeof date === 'string' ? parseISO(date) : new Date(date)
}

export function formatDate(date: string | number | Date): string {
  return format(toDate(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | number | Date): string {
  return format(toDate(date), 'MMM d, yyyy, h:mm a')
}

export function formatRelative(date: string | number | Date): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true })
}
