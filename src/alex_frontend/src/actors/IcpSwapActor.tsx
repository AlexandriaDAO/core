import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/icp_swap";

import { _SERVICE } from "../../../declarations/icp_swap/icp_swap.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { IcpSwapContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";

export default function IcpSwapActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
    const { errorToast, handleResponseError, handleRequest } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={IcpSwapContext}
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

