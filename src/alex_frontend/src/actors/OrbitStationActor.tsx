import React from "react";
import { ActorProvider, InterceptorErrorData, InterceptorRequestData, InterceptorResponseData } from "ic-use-actor";
import { AnonymousIdentity } from "@dfinity/agent";
import { canisterId, idlFactory } from "../../../declarations/orbit_station";

import { _SERVICE } from "../../../declarations/orbit_station/orbit_station.did";

import { ReactNode } from "react";
import { OrbitStationContext } from "@/contexts/actors";
import { toast } from "sonner";
import { errorToast } from "@/utils/general";

export default function OrbitStationActor({ children }: { children: ReactNode }) {
    // Use anonymous identity for read-only access
    const anonymousIdentity = new AnonymousIdentity();

    console.log("[OrbitStationActor] Initializing with canister ID:", canisterId);

	return (
		<ActorProvider<_SERVICE>
			canisterId={canisterId}
			context={OrbitStationContext}
			identity={anonymousIdentity}
			idlFactory={idlFactory}
			httpAgentOptions={{
				host: process.env.DFX_NETWORK !== 'ic' ? "http://localhost:8080" : "https://ic0.app"
			}}

			onRequest={(data: InterceptorRequestData) => {
				console.log("[OrbitStationActor] Request:", data);
				return data.args;
			}}
			onRequestError={(error) => {
				console.error("[OrbitStationActor] Request error:", error);
				errorToast(error);
			}}
			onResponse={(data: InterceptorResponseData) => {
				console.log("[OrbitStationActor] Response:", data);
				return data.response;
			}}
			onResponseError={(data: InterceptorErrorData) => {
				console.error("[OrbitStationActor] Response error:", data);
				errorToast(data);
			}}
		>
			{children}
		</ActorProvider>
	);
}