/**
 * Utility functions to transform property names between snake_case and camelCase
 * This helps maintain consistency between database (snake_case) and application code
 */

/**
 * Converts snake_case to camelCase
 * Example: user_id → userId
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase to snake_case
 * Example: userId → user_id
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Transforms object keys from snake_case to camelCase
 * Creates a new object with transformed keys
 */
export function transformKeysToCamel<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * Transforms object keys from camelCase to snake_case
 * Creates a new object with transformed keys
 */
export function transformKeysToSnake<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * Transforms array of objects from snake_case to camelCase
 */
export function transformArrayToCamel<T extends Record<string, any>>(arr: T[]): Record<string, any>[] {
  return arr.map(item => transformKeysToCamel(item));
}

/**
 * Transforms array of objects from camelCase to snake_case
 */
export function transformArrayToSnake<T extends Record<string, any>>(arr: T[]): Record<string, any>[] {
  return arr.map(item => transformKeysToSnake(item));
}

/**
 * Database response transformer - converts snake_case to camelCase for UI consumption
 */
export function transformDatabaseResponse<T extends Record<string, any>>(data: T | T[] | null): T | T[] | null {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return transformArrayToCamel(data) as T[];
  }
  
  return transformKeysToCamel(data) as T;
}

/**
 * API request transformer - converts camelCase to snake_case for database storage
 */
export function transformApiRequest<T extends Record<string, any>>(data: T | T[]): T | T[] {
  if (Array.isArray(data)) {
    return transformArrayToSnake(data) as T[];
  }
  
  return transformKeysToSnake(data) as T;
}