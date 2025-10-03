import { useSelector } from "@xstate/store/react";
import { createAuthClient } from "../init";
import { store } from "../store";
import { setError } from "../store/mutators";
import type { IdentityContext } from "../types";

/**
 * Clears the identity from the state and local storage. Effectively "logs the
 * user out".
 */
async function clear(): Promise<void> {
	const authClient = store.getSnapshot().context.authClient;
	if (!authClient) {
		setError("Auth client not initialized");
		return;
	}

	try {
		await authClient.logout();
		await createAuthClient();

		store.send({
			type: "setState",
			identity: undefined,
			status: "idle" as const,
			error: undefined,
		});
	} catch (error: unknown) {
		store.send({
			type: "setState",
			status: "error" as const,
			error:
				error instanceof Error ? error : new Error("Logout failed"),
		});
		window.location.reload();
	}
}

/**
 * Hook to access the internet identity as well as login status along with
 * login and clear functions.
 */
export const useIdentity = (): IdentityContext => {
	const context = useSelector(store, (state) => state.context);
	return {
		clear,
		error: context.error,
		status: context.status,
		identity: context.identity,
	};
};
