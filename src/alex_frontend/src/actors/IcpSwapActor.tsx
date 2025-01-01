import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/icp_swap";

import { _SERVICE } from "../../../declarations/icp_swap/icp_swap.did";

import { ReactNode } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { IcpSwapContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";
import { AnonymousIdentity } from "@dfinity/agent";

export default function IcpSwapActor({ children }: { children: ReactNode }) {
    const { identity, clear, isInitializing, isLoggingIn } = useIdentity();
    const { errorToast, handleRequest , handleResponse, handleResponseError} = useActorErrorHandler(clear);

	// Don't render the ActorProvider until we know the identity state
    if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={IcpSwapContext}
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

