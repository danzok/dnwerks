/**
 * Date formatting utilities
 */

/**
 * Formats a date string for display in tables
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  // Get current date for comparison
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  // If today, show time
  if (inputDate.getTime() === today.getTime()) {
    return `Today ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`
  }
  
  // If yesterday, show "Yesterday"
  if (inputDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`
  }
  
  // If within the last week, show day name
  const daysAgo = Math.floor((today.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysAgo < 7 && daysAgo > 0) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  
  // If this year, show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  
  // Otherwise, show full date
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  })
}

/**
 * Formats a date for form inputs (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | Date): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return ''
  }
  
  return date.toISOString().split('T')[0]
}

/**
 * Formats a date and time for form inputs (YYYY-MM-DDTHH:MM)
 */
export function formatDateTimeForInput(dateString: string | Date): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return ''
  }
  
  // Get local time string in ISO format
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

/**
 * Checks if a date is in the future
 */
export function isInFuture(dateString: string | Date): boolean {
  const date = new Date(dateString)
  const now = new Date()
  
  return date.getTime() > now.getTime()
}

/**
 * Gets a relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString)
  const now = new Date()
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  const diffInSeconds = Math.abs((now.getTime() - date.getTime()) / 1000)
  const isPast = date.getTime() < now.getTime()
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const count = Math.floor(diffInSeconds / seconds)
    
    if (count > 0) {
      const plural = count === 1 ? '' : 's'
      
      if (isPast) {
        return `${count} ${unit}${plural} ago`
      } else {
        return `in ${count} ${unit}${plural}`
      }
    }
  }
  
  return isPast ? 'just now' : 'now'
}