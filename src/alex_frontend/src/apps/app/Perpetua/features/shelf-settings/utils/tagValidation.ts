// Constants based on backend rules
export const MAX_TAGS = 3;
export const MAX_TAG_LENGTH = 25;

// Tag validation rules from backend
export interface TagValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateTag = (tag: string): TagValidationResult => {
  // Normalize the tag first (backend uses lowercase and trim)
  const normalizedTag = tag.trim().toLowerCase();
  
  // Empty check
  if (!normalizedTag) {
    return { isValid: false, errorMessage: "Tag cannot be empty" };
  }
  
  // Max length check
  if (normalizedTag.length > MAX_TAG_LENGTH) {
    return { 
      isValid: false, 
      errorMessage: `Tag exceeds maximum length of ${MAX_TAG_LENGTH} characters` 
    };
  }
  
  // Whitespace check
  if (/\s/.test(normalizedTag)) {
    return { isValid: false, errorMessage: "Tags cannot contain whitespace" };
  }
  
  // Control characters check
  if (/[\p{C}]/u.test(normalizedTag)) {
    return { isValid: false, errorMessage: "Tags cannot contain control characters" };
  }
  
  // At least one alphanumeric character
  if (!/[a-zA-Z0-9]/.test(normalizedTag)) {
    return { 
      isValid: false, 
      errorMessage: "Tags must contain at least one alphanumeric character" 
    };
  }
  
  return { isValid: true };
}; 