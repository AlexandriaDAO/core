import { KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from "@dfinity/auth-client";
import {
	type DelegationChain,
	DelegationIdentity,
	Ed25519KeyIdentity,
} from "@dfinity/identity";
import { Signer } from "@slide-computer/signer";
import { PostMessageTransport } from "@slide-computer/signer-web";
import { useCallback } from "react";
import { createAuthClient } from "../init";
import { storage } from "../store";
import { setError, setIdentity, setStatus } from "../store/mutators";

export function useNfid() {
	const storeIdentity = useCallback(
		async (
			sessionIdentity: Ed25519KeyIdentity,
			delegationChain: DelegationChain,
		) => {
			try {
				storage.set(
					KEY_STORAGE_KEY,
					JSON.stringify(
						(sessionIdentity as Ed25519KeyIdentity).toJSON(),
					),
				);
				const delegationJson = delegationChain.toJSON();
				await storage.set(
					KEY_STORAGE_DELEGATION,
					JSON.stringify(delegationJson),
				);
			} catch (storageError) {
				console.error("Error storing delegation chain:", storageError);
				throw new Error(
					`Failed to store delegation: ${
						storageError instanceof Error
							? storageError.message
							: "Unknown error"
					}`,
				);
			}
		},
		[],
	);

	const login = useCallback(async () => {
		try {
			setStatus("connecting");

			const transport = new PostMessageTransport({
				url: "https://nfid.one/rpc",
				windowOpenerFeatures: "width=400,height=650,left=100,top=100",
			});

			const signer = new Signer({ transport, derivationOrigin: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io" });

			// Request delegation permission for NFID
			await signer.requestPermissions([
				{ method: "icrc34_delegation" },
			]);

			setStatus("delegating");
			// Generate session identity for delegation
			const sessionIdentity = Ed25519KeyIdentity.generate();
			const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

			// Request delegation for our session key
			const delegationChain = await signer.delegation({
				publicKey: sessionPublicKey,
				targets: [],
				maxTimeToLive: BigInt(8 * 60 * 60 * 1_000_000_000), // 8 hours
			});

			const identity = DelegationIdentity.fromDelegation(
				sessionIdentity,
				delegationChain,
			);

			await storeIdentity(sessionIdentity, delegationChain);
			await createAuthClient();
			setIdentity(identity); // This automatically sets status to "success"
		} catch (error) {
			console.error("NFID login error:", error);
			setError(
				error instanceof Error ? error.message : "NFID login failed",
			);
		}
	}, [storeIdentity]);

	return {
		login,
	};
}
