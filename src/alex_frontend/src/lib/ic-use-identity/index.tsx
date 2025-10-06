import type {
	IdentityContext,
	InternetIdentityContext,
	Status,
	LoginOptions
} from "./types";

// Re-export hooks
export { useAR } from "./hooks/useAR";
export { useETH } from "./hooks/useETH";
export { useIdentity } from "./hooks/useIdentity";
export { useInternetIdentity } from "./hooks/useInternetIdentity";
export { useNfid } from "./hooks/useNfid";
export { useOisy } from "./hooks/useOisy";
export { usePlug } from "./hooks/usePlug";
export { useSOL } from "./hooks/useSOL";

// Re-export initialization utilities
export { ensureInitialized, IdentityProvider } from "./init";

// Re-export store accessors
export { getIdentity, isAuthenticated } from "./store/accessors";

// Re-export store mutators
export { setError, setIdentity, setStatus } from "./store/mutators";

// Re-export types for external use (e.g., TanStack Router)
export type { Status, IdentityContext, InternetIdentityContext, LoginOptions };
