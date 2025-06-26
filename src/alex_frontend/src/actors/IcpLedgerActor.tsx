import React from "react";
import { ActorProvider, InterceptorErrorData, InterceptorRequestData, InterceptorResponseData } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/icp_ledger_canister";

// Debug imports
console.log('[IcpLedgerActor Import] canisterId:', canisterId);
console.log('[IcpLedgerActor Import] idlFactory:', idlFactory);

import { _SERVICE } from "../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

import { ReactNode } from "react";
import { IcpLedgerContext } from "@/contexts/actors";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { errorToast, isIdentityExpired } from "@/utils/general";

export default function IcpLedgerActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useAuth();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

    // Debug logging for mainnet
    console.log('[IcpLedgerActor] canisterId:', canisterId);
    console.log('[IcpLedgerActor] idlFactory:', idlFactory);
    console.log('[IcpLedgerActor] identity:', identity);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={IcpLedgerContext}
			identity={identity}
			idlFactory={idlFactory}
			onRequest={(data: InterceptorRequestData) => data.args}
			onRequestError={(error) => errorToast(error)}
			onResponse={(data: InterceptorResponseData) => data.response}
			onResponseError={(data: InterceptorErrorData) => {
				console.error("onResponseError", data);
				if (isIdentityExpired(data.error)) {
					toast.error("Session expired.");
					setTimeout(() => {
						clear();
						window.location.reload();
					}, 2000);
					return;
				}
				errorToast(data);
			}}
		>
			{children}
		</ActorProvider>
	);
}

