import type { Identity } from "@dfinity/agent";
import { DelegationIdentity, isDelegationValid } from "@dfinity/identity";
import { store } from ".";

/**
 * Get the current identity if authenticated.
 * This can be used outside of React components.
 *
 * @returns The current identity or undefined
 */
export function getIdentity(): Identity | undefined {
	return store.getSnapshot().context.identity;
}

/**
 * Check if the user is currently authenticated.
 * This can be used outside of React components, for example in route guards.
 *
 * @returns true if the user has a valid identity, false otherwise
 */
export function isAuthenticated(): boolean {
	const context = store.getSnapshot().context;
	const identity = context.identity;

	if (!identity || identity.getPrincipal().isAnonymous()) return false;

	// Check if the identity is valid (delegation is still valid)
	if (
		identity instanceof DelegationIdentity &&
		isDelegationValid(identity.getDelegation())
	) {
		return true;
	}

	return false;
}
