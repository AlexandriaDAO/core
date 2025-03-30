import { Principal } from '@dfinity/principal';

/**
 * Converts a string to Principal or returns the Principal if already in correct format
 */
export const toPrincipal = (principal: Principal | string): Principal => {
  return typeof principal === 'string' ? Principal.fromText(principal) : principal;
};

/**
 * Normalizes a principal to its string representation for consistent handling
 */
export const principalToString = (principal: Principal | string): string => {
  return typeof principal === 'string' ? principal : principal.toString();
};

/**
 * Extracts error message from rejected canister calls
 */
export const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (!(error instanceof Error)) {
    return defaultMessage;
  }

  // Try to extract rejection text which often contains the specific error
  if (error.message.includes("Rejected")) {
    try {
      const match = error.message.match(/Reject text: ['"](.*?)['"]/);
      if (match && match[1]) {
        return match[1];
      }
    } catch (e) {
      // Parsing failed, use the original error message
    }
  }
  
  return error.message || defaultMessage;
};

/**
 * Type-safe wrapper for handling result types from the backend
 */
export interface Result<T, E> {
  Ok?: T;
  Err?: E;
}

/**
 * Helper to handle common canister response patterns
 */
export const handleCanisterResult = <T, E>(
  result: Result<T, E>, 
  onSuccess: (data: T) => any, 
  onError: (error: E) => any
): any => {
  if ("Ok" in result && result.Ok !== undefined) {
    return onSuccess(result.Ok);
  } else if ("Err" in result && result.Err !== undefined) {
    return onError(result.Err);
  } else {
    throw new Error("Invalid result format");
  }
}; 