import React from "react";
import { ActorProvider } from "ic-use-actor";
import { idlFactory } from "../../../asset_canister";

import { _SERVICE } from "../../../asset_canister/asset_canister.did";

import { ReactNode } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { AssetCanisterContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";
import { AnonymousIdentity } from "@dfinity/agent";

export default function AssetCanisterActor({ children, canisterId }: { children: ReactNode, canisterId: string }) {
	const { identity, clear, isInitializing, isLoggingIn } = useIdentity();
    const { errorToast, handleRequest , handleResponse, handleResponseError} = useActorErrorHandler(clear);

	// Don't render the ActorProvider until we know the identity state
    if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AssetCanisterContext}
			identity={identity || new AnonymousIdentity()}
			idlFactory={idlFactory}
			onRequest={handleRequest}
			onRequestError={(error) => errorToast(error)}
			onResponse={handleResponse}
			onResponseError={handleResponseError}
		>
			{children}
		</ActorProvider>
	);
}

