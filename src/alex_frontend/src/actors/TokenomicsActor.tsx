import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/tokenomics";

import { _SERVICE } from "../../../declarations/tokenomics/tokenomics.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { TokenomicsContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";

export default function TokenomicsActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
    const { errorToast, handleResponseError, handleRequest } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={TokenomicsContext}
			identity={identity}
			idlFactory={idlFactory}
			onRequest={handleRequest}
			onRequestError={(error) => errorToast(error)}
			onResponseError={handleResponseError}
		>
			{children}
		</ActorProvider>
	);
}

