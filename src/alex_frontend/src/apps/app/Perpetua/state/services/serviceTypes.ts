// --- Frontend Pagination Types ---

// Input Types
export interface OffsetPaginationParams {
  offset: number;
  limit: number;
}

export interface CursorPaginationParams<C = unknown> {
  cursor?: C | string; // Allow stringified cursor for easy passing
  limit: number;
}

// Result Types (using generics)
export interface PaginatedResult<T> {
  items: T[];
  limit: number;
}

export interface OffsetPaginatedResponse<T> extends PaginatedResult<T> {
  offset: number;
  total_count: number;
}

export interface CursorPaginatedResponse<T, C = unknown> extends PaginatedResult<T> {
  next_cursor?: C | string; // Return stringified cursor
}

// Cursor Types (mirroring backend structures)
export type TimestampCursor = string | bigint;
export type ItemIdCursor = number; // ItemId is u32
export type NormalizedTagCursor = string;
// Use JSON string representation for complex tuple cursors
export type TagPopularityKeyCursor = string; // Represents JSON of [bigint_string, string]
export type TagShelfAssociationKeyCursor = string; // Represents JSON of [string, string]

// Define query error type to match the backend
// We use 'any' here since the specific error types vary by endpoint
export type QueryError = any; 