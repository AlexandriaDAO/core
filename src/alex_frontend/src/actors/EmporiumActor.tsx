import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/emporium";

import { _SERVICE } from "../../../declarations/emporium/emporium.did";

import { ReactNode } from "react";
import { EmporiumContext } from "@/contexts/actors";
import { useActor } from "@/hooks/useActor";

export default function EmporiumActor({ children }: { children: ReactNode }) {
	const { identity, errorToast, handleResponseError, handleRequest, handleResponse } = useActor();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={EmporiumContext}
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

