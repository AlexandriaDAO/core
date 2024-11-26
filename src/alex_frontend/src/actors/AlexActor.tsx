import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/ALEX";

import { _SERVICE } from "../../../declarations/ALEX/ALEX.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { AlexContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";

export default function AlexActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
    const { errorToast, handleResponseError, handleRequest } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AlexContext}
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

