/**
 * Authentication utility functions
 */

/**
 * Generate a random invite code
 * @param length - Length of the invite code (default: 8)
 * @returns Random alphanumeric invite code
 */
export function generateInviteCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}