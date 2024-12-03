import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/alex_backend";

import { _SERVICE } from "../../../declarations/alex_backend/alex_backend.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { AlexBackendContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";
import { AnonymousIdentity } from "@dfinity/agent";

export default function AlexBackendActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
	const { errorToast, handleResponseError, handleRequest, handleResponse } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AlexBackendContext}
			identity={identity|| new AnonymousIdentity()}
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
