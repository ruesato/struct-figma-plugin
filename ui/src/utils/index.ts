/**
 * Checks if a value is a local image filename (not a URL).
 * Returns true if the value doesn't start with http:// or https://
 * AND ends with a common image extension.
 *
 * @param value - The string to check
 * @returns true if it's a local image filename, false otherwise
 */
export function isLocalImageFilename(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Check if it's not a URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return false;
  }

  // Check if it ends with a common image extension (case-insensitive)
  const lowerValue = value.toLowerCase();
  return (
    lowerValue.endsWith('.png') ||
    lowerValue.endsWith('.jpg') ||
    lowerValue.endsWith('.jpeg') ||
    lowerValue.endsWith('.gif') ||
    lowerValue.endsWith('.webp')
  );
}

/**
 * Extracts the filename from a file path.
 * Handles both forward slash (/) and backslash (\) separators.
 *
 * @param path - The file path
 * @returns The filename (basename) from the path
 */
export function getBasename(path: string): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Handle both / and \ separators
  const lastSlash = Math.max(
    path.lastIndexOf('/'),
    path.lastIndexOf('\\')
  );

  // If no separator found, return the whole path
  if (lastSlash === -1) {
    return path;
  }

  return path.substring(lastSlash + 1);
}

/**
 * Checks if any data values for a given JSON key are local image filenames.
 *
 * @param jsonData - Array of JSON objects to check
 * @param jsonKey - The key to check in each object
 * @returns true if any value for the key is a local image filename
 */
export function hasLocalImageValues(jsonData: any[], jsonKey: string): boolean {
  if (!Array.isArray(jsonData) || !jsonKey) {
    return false;
  }

  return jsonData.some(item => {
    const value = item?.[jsonKey];
    if (typeof value === 'string') {
      return isLocalImageFilename(value);
    }
    return false;
  });
}
