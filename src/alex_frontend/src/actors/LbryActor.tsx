import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/LBRY";

import { _SERVICE } from "../../../declarations/LBRY/LBRY.did";

import { ReactNode } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { LbryContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";
import { AnonymousIdentity } from "@dfinity/agent";

export default function LbryActor({ children }: { children: ReactNode }) {
    const { identity, clear, isInitializing, isLoggingIn } = useIdentity();
    const { errorToast, handleRequest , handleResponse, handleResponseError} = useActorErrorHandler(clear);

	// Don't render the ActorProvider until we know the identity state
    if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={LbryContext}
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