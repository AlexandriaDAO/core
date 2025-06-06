import React from "react";
import { ActorProvider, InterceptorErrorData, InterceptorRequestData, InterceptorResponseData } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../declarations/user";

import { _SERVICE } from "../../../declarations/user/user.did";

import { ReactNode } from "react";
import { UserContext } from "@/contexts/actors";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { errorToast, isIdentityExpired } from "@/utils/general";

export default function UserActor({ children }: { children: ReactNode }) {
	const { identity, clear } = useAuth();

	// Don't render the ActorProvider until we know the identity state
    // if (isInitializing || isLoggingIn) return <>{children}</>;

	return (
		<ActorProvider<_SERVICE>
			// if host is undefined, the dfinity/agent will use the default host
			// it would be localhost and for mainnet it would be ic0.app
			
			// httpAgentOptions={{
			// // 	host: isLocal ? "http://localhost:4943" : "https://ic0.app"
			// // or
			// 	host: isLocal ? "http://localhost:8080" : "https://ic0.app"
			// }}

			// nfid is available only on ic0.app
			// can't be tested locally as it creates actor for https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=yo4hu-nqaaa-aaaap-qkmoq-cai
			// which is a mainnet replica for user canister

			// in order to use nfid we have to specify identity provider to be nfid.one/authenticate

			// open source project nfid wallet client can be found here
			// usable independently as seperate project runs on localhost:9090
			// https://github.com/internet-identity-labs/nfid-wallet-client


			// usable independently as seperate project runs on localhost:8000

			// can't be used as host url because of different port
			// same dfx canister id as ugd or anyother locally running dfx project but port is different

			// might be usable if the canisters are deployed in the same project.

			// open source project nfid wallet server can be found here
			// https://github.com/internet-identity-labs/nfid-wallet-server

			// in that case we can use the following httpAgentOptions
			// httpAgentOptions={{
			// 	host: provider === 'NFID' ? "http://bnz7o-iuaaa-aaaaa-qaaaa-cai.localhost:8000/" : undefined
			// }}


			// for mainnet no need to pass this option

			// httpAgentOptions={{
			// 	host: provider === 'NFID' ? "https://icp-api.io" : undefined
			// }}

			canisterId={canisterId}
			context={UserContext}
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

