import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/alex_wallet";

import { _SERVICE } from "../../../declarations/alex_wallet/alex_wallet.did";

import { ReactNode } from "react";
import { AlexWalletContext } from "@/contexts/actors";
import { useActor } from "@/hooks/useActor";

export default function AlexWalletActor({ children }: { children: ReactNode }) {
	const { identity, errorToast, handleResponseError, handleRequest, handleResponse } = useActor();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AlexWalletContext}
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

