/**
 * Utility functions for safe date handling in Firebase Firestore
 */

/**
 * Safely converts a Firestore timestamp to Date object
 * @param timestamp - Firebase timestamp or Date object or string
 * @returns Date object
 */
export const safeToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date();
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firebase timestamp with toDate method
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's an object with seconds (Firebase timestamp format)
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // If it's a string or number, try to parse it
  try {
    return new Date(timestamp);
  } catch (error) {
    console.warn('Could not parse timestamp:', timestamp, error);
    return new Date();
  }
};

/**
 * Safely gets a numeric value with fallback
 * @param value - The value to convert to number
 * @param fallback - Fallback value if conversion fails
 * @returns number
 */
export const safeToNumber = (value: any, fallback: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Safely gets a string value with fallback
 * @param value - The value to convert to string
 * @param fallback - Fallback value if conversion fails
 * @returns string
 */
export const safeToString = (value: any, fallback: string = ''): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  return String(value);
};