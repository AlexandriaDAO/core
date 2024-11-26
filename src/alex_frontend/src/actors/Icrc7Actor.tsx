import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/icrc7";

import { _SERVICE } from "../../../declarations/icrc7/icrc7.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { Icrc7Context } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";

export default function Icrc7Actor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
    const { errorToast, handleResponseError, handleRequest } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={Icrc7Context}
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

