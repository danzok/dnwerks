import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Check if it's already in E.164 format
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }

  // If it's 10 digits, add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }

  // If it's already formatted correctly
  if (phone.startsWith('+')) {
    return phone
  }

  throw new Error('Invalid US phone number format')
}

export function isValidUSPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')

  // Check for 10 digits or 11 digits starting with 1
  if (cleaned.length === 10) {
    return true
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return true
  }

  return false
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.substring(0, maxLength - 3) + '...'
}

/**
 * Context7-compliant utility for extracting unique values from an array.
 * Uses Array.from() for ES5 compatibility and proper TypeScript support.
 *
 * @param array - The source array to extract unique values from
 * @param filterEmpty - Whether to filter out empty/null/undefined values (default: true)
 * @returns Array of unique values
 */
export function getUniqueValues<T>(array: T[], filterEmpty: boolean = true): T[] {
  const uniqueSet = new Set(array)
  const uniqueArray = Array.from(uniqueSet)

  if (filterEmpty) {
    return uniqueArray.filter((value): value is NonNullable<T> =>
      value !== null && value !== undefined && value !== ''
    ) as T[]
  }

  return uniqueArray
}

/**
 * Context7-compliant utility for extracting and sorting unique string values.
 *
 * @param array - The source array to extract unique string values from
 * @param filterEmpty - Whether to filter out empty/null/undefined values (default: true)
 * @returns Sorted array of unique string values
 */
export function getUniqueSortedStrings(array: (string | null | undefined)[], filterEmpty: boolean = true): string[] {
  const uniqueSet = new Set(array.filter((value): value is string =>
    filterEmpty ? value != null && value !== '' : true
  ))
  return Array.from(uniqueSet).sort()
}