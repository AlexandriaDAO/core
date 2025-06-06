import React from "react";
import { ActorProvider, InterceptorErrorData, InterceptorRequestData, InterceptorResponseData } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/alex_wallet";

import { _SERVICE } from "../../../declarations/alex_wallet/alex_wallet.did";

import { ReactNode } from "react";
import { AlexWalletContext } from "@/contexts/actors";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { errorToast, isIdentityExpired } from "@/utils/general";

export default function AlexWalletActor({ children }: { children: ReactNode }) {
	const { identity, clear } = useAuth();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AlexWalletContext}
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

