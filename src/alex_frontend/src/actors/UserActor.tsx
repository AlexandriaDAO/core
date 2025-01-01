import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/user";

import { _SERVICE } from "../../../declarations/user/user.did";

import { ReactNode } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { UserContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";
import { AnonymousIdentity } from "@dfinity/agent";

export default function UserActor({ children }: { children: ReactNode }) {
	const { identity, clear, isInitializing, isLoggingIn } = useIdentity();
    const { errorToast, handleRequest , handleResponse, handleResponseError} = useActorErrorHandler(clear);

	// Don't render the ActorProvider until we know the identity state
    if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={UserContext}
			identity={identity || new AnonymousIdentity()}
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

