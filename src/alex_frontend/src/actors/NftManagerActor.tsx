import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/nft_manager";

import { _SERVICE } from "../../../declarations/nft_manager/nft_manager.did";

import { ReactNode } from "react";
import { NftManagerContext } from "@/contexts/actors";
import { useActor } from "@/hooks/useActor";

export default function NftManagerActor({ children }: { children: ReactNode }) {
    const { identity, errorToast, handleResponseError, handleRequest, handleResponse } = useActor();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={NftManagerContext}
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

