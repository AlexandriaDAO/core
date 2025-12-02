import type { AuthClientLoginOptions } from "@dfinity/auth-client";
import { DelegationIdentity, isDelegationValid } from "@dfinity/identity";
import { store } from "../store";
import { setError, setIdentity } from "../store/mutators";
import type { InternetIdentityContext, LoginOptions } from "../types";

const ONE_HOUR_IN_NANOSECONDS = BigInt(3_600_000_000_000);
const DEFAULT_IDENTITY_PROVIDER = "https://identity.ic0.app";

/**
 * Connect to Internet Identity to login the user.
 *
 * This function initiates the Internet Identity authentication process by:
 * 1. Validating prerequisites (provider present, auth client initialized, user not already authenticated)
 * 2. Opening a popup window to the Identity Provider
 * 3. Setting status to "logging-in" and handling the result through state management
 *
 * All results (success/error) are communicated through the hook's state - monitor `status`, `error`, and `identity`.
 *
 * Options that determine the behaviour of the {@link AuthClient} login call. These options are a subset of
 * loginOptions?: LoginOptions
 * the {@link AuthClientLoginOptions}.
 *
 * @throws No exceptions - all errors are handled via state management
 * @returns void - results available through hook state
 */
function login(loginOptions?:LoginOptions): void {
	const context = store.getSnapshot().context;

	if (!context.providerComponentPresent) {
		setError(
			"The InternetIdentityProvider component is not present. Make sure to wrap your app with it.",
		);
		return;
	}

	const authClient = context.authClient;
	if (!authClient) {
		// AuthClient should have a value at this point, unless `login` was called immediately with e.g. useEffect,
		// doing so would be incorrect since a browser popup window can only be reliably opened on user interaction.
		setError(
			"AuthClient is not initialized yet, make sure to call `login` on user interaction e.g. click.",
		);
		return;
	}

	const identity = authClient.getIdentity();
	if (
		// We avoid using `authClient.isAuthenticated` since that's async and would potentially block the popup window,
		// instead we work around this by checking the principal and delegation validity, which gives us the same info.
		!identity.getPrincipal().isAnonymous() &&
		identity instanceof DelegationIdentity &&
		isDelegationValid(identity.getDelegation())
	) {
		setError("User is already authenticated");
		return;
	}

	const options: AuthClientLoginOptions = {
		identityProvider: DEFAULT_IDENTITY_PROVIDER,
		onSuccess: onLoginSuccess,
		onError: onLoginError,
		maxTimeToLive: ONE_HOUR_IN_NANOSECONDS,
		windowOpenerFeatures: "width=400,height=650,left=100,top=100",
		...loginOptions,
	};

	store.send({
		type: "setState",
		status: "authenticating" as const,
		error: undefined,
	});
	void authClient.login(options);
	return;
}

/**
 * Callback, login was successful. Saves identity to state.
 */
function onLoginSuccess(): void {
	const identity = store.getSnapshot().context.authClient?.getIdentity();
	if (!identity) {
		setError("Identity not found after successful login");
		return;
	}

	setIdentity(identity);
}

/**
 * Login was not successful. Sets loginError.
 */
function onLoginError(error?: string): void {
	setError(error ?? "Login failed");
}

/**
 * Hook to access the internet identity as well as login status along with
 * login and clear functions.
 */
export const useInternetIdentity = (): InternetIdentityContext => {
	return {
		login,
	};
};
