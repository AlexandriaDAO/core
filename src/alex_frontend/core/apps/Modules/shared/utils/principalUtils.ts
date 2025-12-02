import { Principal } from '@dfinity/principal';

/**
 * Converts a Principal to a string
 * @param principal The Principal to convert
 * @returns The string representation of the Principal
 */
export const principalToString = (principal: Principal): string => {
  return principal.toString();
};

/**
 * Safely gets a Principal as a string, handling both Principal objects and string inputs
 * @param principalOrString A Principal or string
 * @returns The string representation of the Principal
 */
export const getPrincipalAsString = (principalOrString: Principal | string): string => {
  return typeof principalOrString === 'string' 
    ? principalOrString 
    : principalOrString.toString();
}; 