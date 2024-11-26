import React from "react";
import { ActorProvider } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/icp_ledger_canister";

import { _SERVICE } from "../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

import { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { IcpLedgerContext } from "@/contexts/actors";
import { useActorErrorHandler } from "@/hooks/actors";

export default function IcpLedgerActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useInternetIdentity();
    const { errorToast, handleResponseError, handleRequest } = useActorErrorHandler(clear);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={IcpLedgerContext}
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

