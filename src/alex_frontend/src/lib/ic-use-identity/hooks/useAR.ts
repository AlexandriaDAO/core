import type {
	ActorSubclass,
	DerEncodedPublicKey,
	Signature,
} from "@dfinity/agent";
import { KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from "@dfinity/auth-client";
import type { SignedDelegation as SignedDelegationType } from "@dfinity/identity";
import {
	Delegation,
	DelegationChain,
	DelegationIdentity,
	ECDSAKeyIdentity,
} from "@dfinity/identity";
import { useCallback } from "react";
import type {
	_SERVICE,
	SIWALoginRequest,
	SIWAMessageRequest,
	SignedDelegation,
} from "../../../../../declarations/authentication/authentication.did";
import { storage } from "../store";
import { setError, setIdentity, setStatus } from "./../store/mutators";
import type { ARContext } from "../types";
import { useAuthentication } from "@/hooks/actors";

export function useAR(): ARContext {
	const { actor } = useAuthentication();

	const connectWallet = useCallback(async (wallet: any) => {
		setStatus("connecting");

		// Connect to the wallet with required permissions
		const permissions = [ "ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY", "SIGNATURE" ];
		await wallet.connect(permissions);

		// Get the address and public key
		const address = await wallet.getActiveAddress();
		const publicKey = await wallet.getActivePublicKey();

		return { address, publicKey };
	}, []);

	const prepareMessage = useCallback(
		async (request: SIWAMessageRequest, actor: ActorSubclass<_SERVICE>) => {
			setStatus("preparing");

			const message = await actor.siwa_message(request);

			if (!message || typeof message !== "object") {
				throw new Error(
					`Failed to generate message - invalid response: ${JSON.stringify(message)}`,
				);
			}

			if ("Err" in message) {
				throw new Error(`Failed to prepare login: ${message.Err}`);
			}

			if (!("Ok" in message)) {
				throw new Error("Invalid response from siwa_message");
			}

			if (!message.Ok.message) {
				throw new Error("Missing SIWA message in response");
			}

			return {
				message:
					message.Ok.message instanceof Uint8Array
						? message.Ok.message
						: new Uint8Array(message.Ok.message),
				message_id: message.Ok.message_id,
			};
		},
		[],
	);

	const signMessage = useCallback(
		async (wallet: any, message: Uint8Array) => {
			setStatus("signing");

			const signature = await wallet.signMessage(message);

			return signature;
		},
		[],
	);

	const authenticate = useCallback(
		async (request: SIWALoginRequest, actor: ActorSubclass<_SERVICE>) => {
			setStatus("authenticating");

			const loginResponse = await actor.siwa_login(request);

			if ("Err" in loginResponse) {
				throw new Error(`Authentication failed: ${loginResponse.Err}`);
			}

			if (!("Ok" in loginResponse)) {
				throw new Error("Invalid response from siwa_login");
			}

			const sessionId = loginResponse.Ok.session_id;
			const userCanisterPubkey = loginResponse.Ok.user_canister_pubkey;

			if (!sessionId || !userCanisterPubkey) {
				throw new Error("Missing required fields in login response");
			}

			return {
				session_id: sessionId,
				user_canister_pubkey: userCanisterPubkey,
			};
		},
		[],
	);

	const getDelegation = useCallback(
		async (sessionId: string, actor: ActorSubclass<_SERVICE>) => {
			setStatus("delegating");

			const delegationResponse = await actor.siwa_delegation(sessionId);

			if ("Err" in delegationResponse) {
				throw new Error(
					`Failed to get delegation: ${delegationResponse.Err}`,
				);
			}

			if (!("Ok" in delegationResponse)) {
				throw new Error("Invalid response from get_delegation");
			}

			return delegationResponse.Ok;
		},
		[],
	);

	const createIdentity = useCallback(
		async (
			sessionIdentity: ECDSAKeyIdentity,
			signedDelegation: SignedDelegation,
			userCanisterPubkey: Uint8Array<ArrayBufferLike> | number[],
		) => {
			// Parse the user canister public key from ByteBuf - ensure it's Uint8Array
			const userPubkeyBytes =
				userCanisterPubkey instanceof Uint8Array
					? userCanisterPubkey
					: new Uint8Array(userCanisterPubkey);

			// Create delegation from the signed delegation
			const delegation = new Delegation(
				new Uint8Array(
					signedDelegation.delegation.pubkey,
				) as DerEncodedPublicKey,
				signedDelegation.delegation.expiration,
				undefined, // No targets means all canisters
			);

			// Create signed delegation with the signature
			const signedDelegationObj: SignedDelegationType = {
				delegation,
				signature: new Uint8Array(
					signedDelegation.signature,
				) as Signature,
			};

			// Create delegation chain using static factory method
			const delegationChain = DelegationChain.fromDelegations(
				[signedDelegationObj],
				userPubkeyBytes as DerEncodedPublicKey,
			);

			const identity = DelegationIdentity.fromDelegation(
				sessionIdentity,
				delegationChain,
			);

			return { identity, delegationChain };
		},
		[],
	);

	const storeIdentity = useCallback(
		async (
			sessionIdentity: ECDSAKeyIdentity,
			delegationChain: DelegationChain,
		) => {
			try {
				await storage.set(
					KEY_STORAGE_KEY,
					sessionIdentity.getKeyPair(),
				);
				const delegationJson = delegationChain.toJSON();
				await storage.set(
					KEY_STORAGE_DELEGATION,
					JSON.stringify(delegationJson),
				);
			} catch (storageError) {
				console.error("Error storing delegation chain:", storageError);
				throw new Error(
					`Failed to store delegation: ${storageError instanceof Error ? storageError.message : "Unknown error"}`,
				);
			}
		},
		[],
	);

	const login = useCallback(async () => {
		try {
			const wallet = window.arweaveWallet || window.arconnect;

			if (!wallet) throw new Error("⛵ Arweave wallet not detected");

			const { address, publicKey } = await connectWallet(wallet);

			if (!actor) throw new Error("Actor not available");

			const messageRequest: SIWAMessageRequest = {
				address,
				public_key: publicKey,
			};
			const { message, message_id } = await prepareMessage(
				messageRequest,
				actor,
			);

			const signature = await signMessage(wallet, message);

			const sessionIdentity = await ECDSAKeyIdentity.generate();
			const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

			const request: SIWALoginRequest = {
				signature,
				message_id,
				session_key: sessionPublicKey,
			};

			const { session_id, user_canister_pubkey } = await authenticate(
				request,
				actor,
			);

			const delegation = await getDelegation(session_id, actor);

			const { identity, delegationChain } = await createIdentity(
				sessionIdentity,
				delegation,
				user_canister_pubkey,
			);

			await storeIdentity(sessionIdentity, delegationChain);
			setIdentity(identity);
		} catch (error) {
			console.error("Arweave login error:", error);
			setError(error instanceof Error ? error.message : "Login failed");
		}
	}, [
		actor,
		connectWallet,
		prepareMessage,
		signMessage,
		authenticate,
		getDelegation,
		createIdentity,
		storeIdentity,
	]);

	return {
		// Individual functions
		connectWallet,
		prepareMessage,
		signMessage,
		authenticate,
		getDelegation,
		createIdentity,
		storeIdentity,

		// Full login flow
		login,
	};
}