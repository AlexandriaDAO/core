import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/alex_backend";

import { _SERVICE } from "../../../declarations/alex_backend/alex_backend.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { AlexBackendContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";

export default function AlexBackendActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
	const { errorToast, handleResponseError, handleRequest } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AlexBackendContext}
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
