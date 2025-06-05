import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/asset_manager";

import { _SERVICE } from "../../../declarations/asset_manager/asset_manager.did";

import { ReactNode } from "react";
import { AssetManagerContext } from "@/contexts/actors";
import { useActor } from "@/hooks/useActor";

export default function AssetManagerActor({ children }: { children: ReactNode }) {
	const { identity, errorToast, handleResponseError, handleRequest, handleResponse } = useActor();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AssetManagerContext}
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

