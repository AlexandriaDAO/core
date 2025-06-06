import React from "react";
import { ActorProvider, InterceptorErrorData, InterceptorRequestData, InterceptorResponseData } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/ALEX";

import { _SERVICE } from "../../../declarations/ALEX/ALEX.did";

import { ReactNode } from "react";
import { AlexContext } from "@/contexts/actors";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { errorToast, isIdentityExpired } from "@/utils/general";

export default function AlexActor({ children }: { children: ReactNode }) {
    const { identity, clear } = useAuth();

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={AlexContext}
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

