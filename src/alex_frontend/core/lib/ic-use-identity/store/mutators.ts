import type { Identity } from "@dfinity/agent";
import type { Status } from "../types";
import { store } from ".";

/**
 * Set authentication status from external providers
 */
export function setStatus(status: Status) {
	store.send({
		type: "setState",
		status,
		error: undefined,
	});
}

/**
 * Helper function to set error state. Accepts either Error or string.
 */
export function setError(err: Error | string) {
	const errorObj = typeof err === "string" ? new Error(err) : err;
	store.send({
		type: "setState",
		status: "error" as const,
		error: errorObj,
	});
}

/**
 * Set identity from external provider (e.g., Ethereum, Solana)
 * This allows other authentication providers to update the shared state
 */
export function setIdentity(identity: Identity): void {
	store.send({
		type: "setState",
		identity,
		status: "success" as const,
		error: undefined,
	});
}
