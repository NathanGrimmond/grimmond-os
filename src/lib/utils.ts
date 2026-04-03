import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
