/**
 * Recursively converts all BigInt values in an object or array to strings
 * Note: This function properly serializes Principal types by converting them to strings
 * 
 * @param obj - The object or array to process
 * @returns A new object or array with all BigInt values converted to strings
 */
export function convertBigIntsToStrings(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt values directly
  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  // Handle Principal objects by converting them to string
  if (obj._isPrincipal === true) {
    return obj.toString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = convertBigIntsToStrings(obj[key]);
    }
    return result;
  }

  // Return other values as is
  return obj;
}

/**
 * Utility function to convert string representations of BigInts back to actual BigInt values
 * This function can handle both directly specified keys and nested keys using dot notation
 * @param obj The object containing string representations of BigInts
 * @param keyPaths Array of key paths that should be converted to BigInt (e.g. 'created_at', 'nested.property')
 * @returns A new object with specified string values converted to BigInts
 */
export function convertStringsToBigInts<T>(obj: T, keyPaths: string[]): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertStringsToBigInts(item, keyPaths)) as unknown as T;
  }

  const result = { ...obj } as any;
  
  for (const keyPath of keyPaths) {
    // Handle nested properties using dot notation
    const keys = keyPath.split('.');
    let current = result;
    let parent = null;
    let lastKey = '';
    
    // Navigate to the nested property
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      
      if (i === keys.length - 1) {
        // This is the actual property we want to convert
        if (current && key in current && typeof current[key] === 'string') {
          try {
            current[key] = BigInt(current[key]);
          } catch (e) {
            console.warn(`Failed to convert ${keyPath} to BigInt:`, e);
          }
        }
      } else if (current && key in current && typeof current[key] === 'object') {
        // Continue navigating through nested objects
        parent = current;
        lastKey = key;
        current = current[key];
      } else {
        // Property path doesn't exist, break the loop
        break;
      }
    }
  }

  return result as T;
} 