import type {
	ActorSubclass,
	DerEncodedPublicKey,
	Signature,
} from "@dfinity/agent";
import {
	Cbor,
	Certificate,
	Expiry,
	HttpAgent,
	LookupPathStatus,
	requestIdOf,
	SubmitRequestType,
} from "@dfinity/agent";
import { KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from "@dfinity/auth-client";
import { compare, IDL } from "@dfinity/candid";
import type { SignedDelegation as SignedDelegationType } from "@dfinity/identity";
import {
	Delegation,
	DelegationChain,
	DelegationIdentity,
	ECDSAKeyIdentity,
} from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import { Signer } from "@slide-computer/signer";
import { PostMessageTransport } from "@slide-computer/signer-web";
import { useCallback } from "react";
import { canisterId } from "../../../../../declarations/authentication";
import type {
	_SERVICE,
	AuthError,
	SIWOLoginRequest,
	SignedDelegation,
} from "../../../../../declarations/authentication/authentication.did";
import { storage } from "../store";
import { setError, setIdentity, setStatus } from "./../store/mutators";
import { useAuthentication } from "@/hooks/actors";

export const getRootKey = async () => {
	const agent = await HttpAgent.create({
		host: "https://icp-api.io",
	});

	return await agent.fetchRootKey();
};

export const decodeCallRequest = (contentMap: Uint8Array) => {
	const decoded: any = Cbor.decode(contentMap);
	const expiryJson = JSON.stringify({
		__expiry__: decoded.ingress_expiry.toString(),
	});
	return Object.assign(Object.assign({}, decoded), {
		canister_id: Principal.from(decoded.canister_id),
		ingress_expiry: Expiry.fromJSON(expiryJson),
	});
};

export function useOisy() {
	const { actor } = useAuthentication();

	const connectWallet = useCallback(
		async (signer: Signer<PostMessageTransport>): Promise<Principal> => {
			setStatus("connecting");

			// Connect to the wallet
			try{
				const response = await signer.accounts();

				return response[0].owner;
			}catch(e){
				console.log('error', e);
			}

			throw new Error("Couldn't fetch user wallet");
		},
		[],
	);

	const authenticate = useCallback(
		async (
			signer: Signer<PostMessageTransport>,
			owner: Principal,
			request: Uint8Array,
		) => {
			setStatus("authenticating");

			const response = await signer.callCanister({
				// canisterId: Principal.fromText("4n3qe-piaaa-aaaab-qac7a-cai"),
				// playgorund
				canisterId: Principal.fromText(canisterId),
				method: "siwo_login",
				sender: owner,
				arg: request,
			});

			// response.certificate;
			// response.contentMap;
			console.log("callCanister response", response);

			const requestBody = decodeCallRequest(response.contentMap);

			const contentMapMatchesRequest =
				SubmitRequestType.Call === requestBody.request_type &&
				Principal.fromText(canisterId).compareTo(
					requestBody.canister_id,
				) === "eq" &&
				"siwo_login" === requestBody.method_name &&
				compare(request, requestBody.arg) === 0 &&
				owner.compareTo(Principal.from(requestBody.sender)) === "eq";

			if (!contentMapMatchesRequest) {
				throw new Error("Invalid response");
			}

			// Validate certificate
			const requestId = requestIdOf(requestBody);
			const certificate = await Certificate.create({
				certificate: response.certificate,
				rootKey: await getRootKey(),
				canisterId: Principal.fromText(canisterId),
				maxAgeInMinutes: 5,
			}).catch(() => {
				throw new Error("Invalid response");
			});

			const status = certificate.lookup_path([
				"request_status",
				requestId,
				"status",
			]);
			if (status.status !== LookupPathStatus.Found)
				throw new Error("Certificate status not found");
			const reply = certificate.lookup_path([
				"request_status",
				requestId,
				"reply",
			]);

			if (reply.status !== LookupPathStatus.Found)
				throw new Error("Certificate reply not found");
			const statusValue = new TextDecoder().decode(status.value);

			if (statusValue !== "replied")
				throw new Error("Certificate is missing reply");

			const ResultIDL = IDL.Variant({
				Ok: IDL.Record({
					session_id: IDL.Text,
					user_canister_pubkey: IDL.Vec(IDL.Nat8),
				}),
				Err: IDL.Text,
			});

			const replyValue = IDL.decode([ResultIDL], reply.value);

			if (
				!(
					Array.isArray(replyValue) &&
					typeof replyValue[0] === "object"
				)
			)
				throw new Error("Invalid response");

			if ("Err" in replyValue[0]) {
				const errValue = replyValue[0] as { Err: AuthError };
				throw new Error(
					`An Error occured: ${JSON.stringify(errValue.Err)}`,
				);
			}
			if (!("Ok" in replyValue[0]))
				throw new Error("An Unknown Error occured");

			const okValue = replyValue[0].Ok;

			if (
				!(
					okValue &&
					typeof okValue === "object" &&
					"session_id" in okValue &&
					"user_canister_pubkey" in okValue
				)
			) {
				throw new Error(
					"Ok response is missing expiration or user_canister_pubkey",
				);
			}

			const loginResponse = {
				session_id: okValue.session_id as string,
				user_canister_pubkey: okValue.user_canister_pubkey as
					| Uint8Array
					| number[],
			};

			console.log(loginResponse);

			return loginResponse;
		},
		[],
	);

	const getDelegation = useCallback(
		async (sessionId: string, actor: ActorSubclass<_SERVICE>) => {
			setStatus("delegating");

			console.log("Getting delegation with session ID:", sessionId);
			const delegationResponse = await actor.siwo_delegation(sessionId);
			console.log("Raw delegation response:", delegationResponse);

			if ("Err" in delegationResponse) {
				throw new Error(
					`Failed to get delegation: ${JSON.stringify(delegationResponse.Err)}`,
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
			console.log("Starting Oisy login process");

			if (!actor) throw new Error("Actor not available");

			const transport = new PostMessageTransport({
				url: "https://oisy.com/sign",
				windowOpenerFeatures: "width=400,height=650,left=100,top=100",
			});

			const signer = new Signer({ transport , derivationOrigin: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io"});

			const owner = await connectWallet(signer);

			const sessionIdentity = await ECDSAKeyIdentity.generate();
			const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

			// const request = IDL.encode([IDL.Vec(IDL.Nat8)], [sessionPublicKey]);
			// Create the SIWOLoginRequest
			const loginRequest: SIWOLoginRequest = {
				session_key: sessionPublicKey,
			};

			const request = IDL.encode(
				[IDL.Record({ session_key: IDL.Vec(IDL.Nat8) })],
				[loginRequest],
			);

			const { session_id, user_canister_pubkey } = await authenticate(
				signer,
				owner,
				request,
			);

			const delegation = await getDelegation(session_id, actor);

			const { identity, delegationChain } = await createIdentity(
				sessionIdentity,
				delegation,
				user_canister_pubkey,
			);

			await storeIdentity(sessionIdentity, delegationChain);
			setIdentity(identity);
			setStatus("success");
		} catch (error) {
			console.error("Oisy login error:", error);
			setError(error instanceof Error ? error.message : "Login failed");
		}
	}, [
		actor,
		connectWallet,
		authenticate,
		getDelegation,
		createIdentity,
		storeIdentity,
	]);

	return {
		// Individual functions
		connectWallet,
		authenticate,
		getDelegation,
		createIdentity,
		storeIdentity,

		// Full login flow
		login,
	};
}
