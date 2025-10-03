import React from 'react';
import { useCallback, useEffect, useMemo } from "react";
import { type DelegationIdentity, isDelegationValid } from "@dfinity/identity";
import {
	authenticateAll,
	ensureAllInitialized,
	type InterceptorErrorData,
	type InterceptorRequestData,
	type InterceptorResponseData,
} from "ic-use-actor";

import { getIdentity, useIdentity } from "../lib/ic-use-identity";
import { toast } from "sonner";
import {
	useAlex,
	useAuthentication,
	useAlexBackend,
	useAssetManager,
	useUser,
	useAlexWallet,
	useIcpLedger,
	useIcpSwap,
	useIcrc7,
	useLbry,
	useNftManager,
	useTokenomics,
	useVetkd,
	usePerpetua,
	useIcpSwapFactory,
	useLogs,
	useEmporium,
} from "@/hooks/actors";
import { Button } from "@/lib/components/button";

// Component using multiple actors
export default function ActorProvider() {
	const { identity, clear } = useIdentity();

	const alex = useAlex();
	const authentication = useAuthentication();
	const alexBackend = useAlexBackend();
	const assetManager = useAssetManager();
	const user = useUser();
	const alexWallet = useAlexWallet();
	const icpLedger = useIcpLedger();
	const icpSwap = useIcpSwap();
	const icrc7 = useIcrc7();
	const lbry = useLbry();
	const nftManager = useNftManager();
	const tokenomics = useTokenomics();
	const vetkd = useVetkd();
	const perpetua = usePerpetua();
	const icpSwapFactory = useIcpSwapFactory();
	const logs = useLogs();
	const emporium = useEmporium();

	const onRequest = useCallback(
		(data: InterceptorRequestData) => {
			const id = getIdentity();
			console.log("onRequest", data.args, data.methodName);
			if (
				id &&
				!isDelegationValid(
					(id as DelegationIdentity).getDelegation()
				)
			) {
				toast.error("Login expired.", {
					id: "login-expired",
					position: "bottom-right",
				});
				setTimeout(() => {
					clear(); // Clears the identity from the state and local storage. Effectively "logs the user out".
					window.location.reload(); // Reloads the page to reset the UI.
				}, 1000);
			}
			return data.args;
		},
		[clear, getIdentity]
	);

	const onRequestError = useCallback((data: InterceptorErrorData) => {
		console.log("onRequestError", data.args, data.methodName, data.error);
		return data.error;
	}, []);

	const onResponse = useCallback((data: InterceptorResponseData) => {
		console.log("onResponse", data.args, data.methodName, data.response);
		return data.response;
	}, []);

	const onResponseError = useCallback((data: InterceptorErrorData) => {
		console.log("onResponseError", data.args, data.methodName, data.error);
		return data.error;
	}, []);

	const interceptors = useMemo(
		() => ({
			onRequest,
			onResponse,
			onRequestError,
			onResponseError,
		}),
		[onRequest, onResponse, onRequestError, onResponseError]
	);

	useEffect(() => {
		if (!identity) return;
		ensureAllInitialized().then(() => {
			authenticateAll(identity);
		});
	}, [identity]);

	useEffect(() => {
		ensureAllInitialized().then(() => {
			alex.setInterceptors(interceptors);
			authentication.setInterceptors(interceptors);
			alexBackend.setInterceptors(interceptors);
			assetManager.setInterceptors(interceptors);
			user.setInterceptors(interceptors);
			alexWallet.setInterceptors(interceptors);
			icpLedger.setInterceptors(interceptors);
			icpSwap.setInterceptors(interceptors);
			icrc7.setInterceptors(interceptors);
			lbry.setInterceptors(interceptors);
			nftManager.setInterceptors(interceptors);
			tokenomics.setInterceptors(interceptors);
			vetkd.setInterceptors(interceptors);
			perpetua.setInterceptors(interceptors);
			icpSwapFactory.setInterceptors(interceptors);
			logs.setInterceptors(interceptors);
			emporium.setInterceptors(interceptors);
		});
	}, [interceptors]);

	return null;
}