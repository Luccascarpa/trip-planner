/**
 * Format a date string from YYYY-MM-DD to a local date for database storage
 * This prevents timezone shift issues when storing dates
 */
export function formatDateForDatabase(dateString: string): string {
  if (!dateString) return dateString;

  // Date input gives us "YYYY-MM-DD" in local timezone
  // We want to store it as-is without timezone conversion
  return dateString;
}

/**
 * Format a date from database (ISO string) to YYYY-MM-DD for input fields
 * This ensures the date input shows the correct local date
 */
export function formatDateForInput(isoDateString: string | null): string {
  if (!isoDateString) return '';

  // Extract just the date part (YYYY-MM-DD) from ISO string
  // This prevents timezone conversion issues
  return isoDateString.split('T')[0];
}

/**
 * Get the current date in YYYY-MM-DD format (local timezone)
 */
export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
