import { KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from "@dfinity/auth-client";
import {
	type DelegationChain,
	DelegationIdentity,
	Ed25519KeyIdentity,
} from "@dfinity/identity";
import { Signer } from "@slide-computer/signer";
import { BrowserExtensionTransport } from "@slide-computer/signer-extension";
import { useCallback } from "react";
import { createAuthClient } from "../init";
import { storage } from "../store";
import { setError, setIdentity, setStatus } from "../store/mutators";

export function usePlug() {
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
			const transport = await BrowserExtensionTransport.findTransport({
				uuid: "71edc834-bab2-4d59-8860-c36a01fee7b8",
			});

			const signer = new Signer({ transport, derivationOrigin: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io" });

			await signer.requestPermissions([
				{ method: "icrc34_delegation" },
				// { method: "icrc27_accounts" },
			]);

			setStatus("delegating");

			// Generate session identity for delegation
			const sessionIdentity = Ed25519KeyIdentity.generate();
			const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

			// Request delegation for our session key
			const delegationChain = await signer.delegation({
				publicKey: sessionPublicKey,
				targets: [],
				maxTimeToLive: BigInt(8 * 60 * 60 * 1_000_000_000),
			});

			const identity = DelegationIdentity.fromDelegation(
				sessionIdentity,
				delegationChain,
			);

			await storeIdentity(sessionIdentity, delegationChain);
			await createAuthClient();
			setIdentity(identity); // This automatically sets status to "success"
		} catch (error) {
			console.error("Plug login error:", error);
			setError(error instanceof Error ? error.message : "Login failed");
		}
	}, [storeIdentity]);

	return {
		login,
	};
}
