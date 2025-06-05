import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/icrc7_scion";

import { _SERVICE } from "../../../declarations/icrc7_scion/icrc7_scion.did";

import { ReactNode } from "react";
import { Icrc7ScionContext } from "@/contexts/actors";
import { useActor } from "@/hooks/useActor";

export default function Icrc7ScionActor({ children }: { children: ReactNode }) {
    const { identity, errorToast, handleResponseError, handleRequest, handleResponse } = useActor();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={Icrc7ScionContext}
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

