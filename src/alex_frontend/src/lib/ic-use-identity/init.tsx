import type { Identity } from "@dfinity/agent";
import {
	AuthClient,
	type AuthClientCreateOptions,
} from "@dfinity/auth-client";
import { type ReactNode, useEffect } from "react";
import { store } from "./store";
import { getIdentity, isAuthenticated } from "./store/accessors";

/**
 * Initialization promise handling
 *
 * - We create a pending `initializationPromise` at module load so callers
 *   can await initialization before the provider mounts.
 * - If the provider is remounted or re-initialized, the cleanup will reject
 *   pending promises and a new one will be created on the next init.
 */
let initializationResolve: ((identity?: Identity) => void) | null = null;
let initializationReject: ((reason: Error) => void) | null = null;
let initializationPromise: Promise<Identity | undefined>;

function createInitializationPromise() {
	initializationPromise = new Promise<Identity | undefined>(
		(resolve, reject) => {
			initializationResolve = resolve;
			initializationReject = reject;
		}
	);
}

// Create the initial promise so callers that call `ensureInitialized()` before
// the provider mounts will properly wait for the real initialization.
createInitializationPromise();

/**
 * Ensure the Internet Identity library has been initialized.
 * Resolves with the restored `Identity` if one was found (and authenticated),
 * otherwise resolves with `undefined`. Rejects if initialization failed.
 *
 * @returns A promise that resolves when initialization is complete
 *          and yields the identity (or `undefined`).
 */
export async function ensureInitialized(): Promise<Identity | undefined> {
	const status = store.getSnapshot().context.status;

	// If initialization errored, throw the stored error
	if (status === "error") {
		const err = store.getSnapshot().context.error;
		throw err ?? new Error("Initialization failed");
	}

	// If not initializing, return the identity if authenticated, otherwise undefined
	if (status !== "initializing") {
		return isAuthenticated() ? getIdentity() : undefined;
	}

	// Otherwise wait for the initialization promise
	return initializationPromise;
}

/**
 * Create the auth client with default options or options provided by the user.
 * Options for creating the {@link AuthClient}. See AuthClient documentation for list of options
 *
 *`ic-use-internet-identity` defaults to disabling the AuthClient idle handling (clearing identities
 * from store and reloading the window on identity expiry). If that behaviour is preferred, set these settings:
 *
 * ```
 * const options = {
 *   idleOptions: {
 *     disableDefaultIdleCallback: false,
 *     disableIdle: false,
 *   },
 * }
 * ```
 * createOptions?: AuthClientCreateOptions;
*/
export async function createAuthClient(createOptions?: AuthClientCreateOptions): Promise<AuthClient> {
	const options: AuthClientCreateOptions = {
		idleOptions: {
			// Default behaviour of this hook is not to logout and reload window on identity expiration
			disableDefaultIdleCallback: true,
			disableIdle: true,
			...createOptions?.idleOptions,
		},
		...createOptions,
	};
	const authClient = await AuthClient.create(options);
	store.send({ type: "setState", authClient });
	return authClient;
}

/**
 * The InternetIdentityProvider component makes the saved identity available
 * after page reloads. It also allows you to configure default options
 * for AuthClient and login.
 *
 * By default, the component uses the main Internet Identity service at
 * https://identity.ic0.app. For local development, you can override this
 * by setting the identityProvider in loginOptions:
 *
 * @example
 * ```tsx
 * <InternetIdentityProvider
 *   loginOptions={{
 *     identityProvider: process.env.DFX_NETWORK === "local"
 *       ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
 *       : "https://identity.ic0.app"
 *   }}
 * >
 *   <App />
 * </InternetIdentityProvider>
 * ```
 */
export function IdentityProvider({
	children,
}: {
	/** The child components that the InternetIdentityProvider will wrap. This allows any child
	 * component to access the authentication context provided by the InternetIdentityProvider. */
	children: ReactNode;
}) {
	// Effect runs on mount. Creates an AuthClient and attempts to load a saved identity.
	useEffect(() => {
		// If there is no pending initialization promise (e.g. cleaned up previously), create one.
		if (!initializationResolve) createInitializationPromise();

		void (async () => {
			try {
				store.send({
					type: "setState",
					providerComponentPresent: true,
					status: "initializing" as const,
				});
				let authClient = store.getSnapshot().context.authClient;
				authClient ??= await createAuthClient();

				if (await authClient.isAuthenticated()) {
					const identity = authClient.getIdentity();
					store.send({
						type: "setState",
						identity,
						status: "success" as const,
						error: undefined,
					});

					// Resolve the initialization promise with the restored identity
					if (initializationResolve) {
						initializationResolve(identity);
						initializationResolve = null;
						initializationReject = null;
						initializationPromise = Promise.resolve(identity);
					}
				} else {
					store.send({
						type: "setState",
						status: "idle" as const,
						error: undefined,
					});

					// Resolve the initialization promise with undefined (no identity)
					if (initializationResolve) {
						initializationResolve(undefined);
						initializationResolve = null;
						initializationReject = null;
						initializationPromise = Promise.resolve(undefined);
					}
				}
			} catch (error) {
				const err =
					error instanceof Error
						? error
						: new Error("Initialization failed");
				store.send({
					type: "setState",
					status: "error" as const,
					error: err,
				});

				// Reject the initialization promise
				if (initializationReject) {
					initializationReject(err);
					initializationResolve = null;
					initializationReject = null;
					initializationPromise = Promise.reject(err);
				}
			}
		})();

		return () => {
			// mark inactive
			// If there's still a pending initialization, reject it so callers don't hang
			if (initializationReject) {
				const cancelErr = new Error("Initialization cancelled");
				initializationReject(cancelErr);
				initializationResolve = null;
				initializationReject = null;
				initializationPromise = Promise.reject(cancelErr);
			}
		};
	}, []);

	return children;
}
