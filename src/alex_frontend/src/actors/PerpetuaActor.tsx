import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/perpetua";

import { _SERVICE } from "../../../declarations/perpetua/perpetua.did";

import { ReactNode } from "react";
import { useActor } from "@/hooks/useActor";
import { PerpetuaContext } from "@/contexts/actors";

export default function PerpetuaActor({ children }: { children: ReactNode }) {
    const { identity, errorToast, handleResponseError, handleRequest, handleResponse } = useActor();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={PerpetuaContext}
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
