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
import type { Eip1193Provider, JsonRpcSigner } from "ethers";
import { BrowserProvider } from "ethers";
import { useCallback } from "react";
import type {
	_SERVICE,
	LoginRequest,
	SignedDelegation,
} from "../../../../../declarations/authentication/authentication.did";
import { storage } from "../store";
import { setError, setIdentity, setStatus } from "./../store/mutators";
import type { ETHContext } from "../types";
import { useAuthentication } from "@/hooks/actors";

export function useETH(): ETHContext {
	const { actor } = useAuthentication();

	const connectWallet = useCallback(async (ethereum: Eip1193Provider) => {
		setStatus("connecting");

		const provider = new BrowserProvider(ethereum);
		const signer = await provider.getSigner();
		const address = await signer.getAddress();

		return { address, signer };
	}, []);

	const prepareMessage = useCallback(
		async (address: string, actor: ActorSubclass<_SERVICE>) => {
			setStatus("preparing");

			const message = await actor.siwe_message(address);

			if (!message || typeof message !== "object") {
				throw new Error(
					`Failed to generate message - invalid response: ${JSON.stringify(message)}`,
				);
			}

			if ("Err" in message) {
				throw new Error(`Failed to prepare login: ${message.Err}`);
			}

			if (!("Ok" in message)) {
				throw new Error("Invalid response from siwe_message");
			}

			if (!message.Ok.message) {
				throw new Error("Missing SIWE message in response");
			}

			return {
				message: message.Ok.message,
				message_id: message.Ok.message_id,
			};
		},
		[]
	);

	const signMessage = useCallback( async (signer: JsonRpcSigner, message: string) => {
		setStatus("signing");

		return await signer.signMessage(message);
	}, []);

	const authenticate = useCallback(
		async (request: LoginRequest, actor: ActorSubclass<_SERVICE>) => {
			setStatus("authenticating");

			console.log("Sending siwe_login request:", request);
			const loginResponse = await actor.siwe_login(request);
			console.log("Login Response:", loginResponse);

			if ("Err" in loginResponse) {
				throw new Error(`Authentication failed: ${loginResponse.Err}`);
			}

			if (!("Ok" in loginResponse)) {
				throw new Error("Invalid response from siwe_login");
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

			const delegationResponse = await actor.siwe_delegation(sessionId);

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
			if (!window.ethereum) throw new Error("🦊 MetaMask not detected");

			const { address, signer } = await connectWallet(window.ethereum);

			if (!actor) throw new Error("Actor not available");

			const { message, message_id } = await prepareMessage(
				address,
				actor,
			);

			const signature = await signMessage(signer, message);

			const sessionIdentity = await ECDSAKeyIdentity.generate();
			const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

			const request: LoginRequest = {
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
			console.error("ETH login error:", error);
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

declare global {
	interface Window {
		ethereum?: Eip1193Provider;
	}
}
