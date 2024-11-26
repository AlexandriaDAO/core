import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/LBRY";

import { _SERVICE } from "../../../declarations/LBRY/LBRY.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { LbryContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";

export default function LbryActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
    const { errorToast, handleResponseError, handleRequest } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={LbryContext}
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