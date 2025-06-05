import React from "react";
import { ActorProvider } from "ic-use-actor";
import { idlFactory } from "../../../asset_canister";

import { _SERVICE } from "../../../asset_canister/asset_canister.did";

import { ReactNode } from "react";
import { AssetCanisterContext } from "@/contexts/actors";
import { useActor } from "@/hooks/useActor";

export default function AssetCanisterActor({ children, canisterId }: { children: ReactNode, canisterId: string }) {
	const { identity, errorToast, handleResponseError, handleRequest, handleResponse } = useActor();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AssetCanisterContext}
			identity={identity}
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

