import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/alex_wallet";

import { _SERVICE } from "../../../declarations/alex_wallet/alex_wallet.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { AlexWalletContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";

export default function AlexWalletActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
    const { errorToast, handleResponseError, handleRequest } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AlexWalletContext}
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

