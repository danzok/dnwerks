/**
 * Role-based navigation utilities
 */

import { UserRole } from '@/lib/types'

// Navigation item types
export interface NavItem {
  title: string
  url: string
  icon?: any
  isActive?: boolean
  items?: NavItem[]
  requiresRole?: UserRole
}

/**
 * Filter navigation items based on user role
 */
export function filterNavItemsByRole(items: NavItem[], userRole: UserRole): NavItem[] {
  return items.filter(item => {
    // If item requires a specific role, check if user has it
    if (item.requiresRole && item.requiresRole !== userRole) {
      return false
    }
    
    // If item has sub-items, recursively filter them
    if (item.items) {
      item.items = filterNavItemsByRole(item.items, userRole)
      // Only show parent item if it has visible sub-items or doesn't require a role
      return item.items.length > 0 || !item.requiresRole
    }
    
    return true
  })
}

/**
 * Check if user has admin role
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin'
}