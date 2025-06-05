import React from "react";
import { UserActor, AssetManagerActor } from "@/actors";
import ActorContext from "@/contexts/ActorContext";
import useAuth from "@/hooks/useAuth";
import { useInternetIdentity } from "ic-use-internet-identity";
import { useNfidIdentity } from "ic-use-nfid-identity";
import { useSiwoIdentity } from "ic-use-siwo-identity";
import { toast } from "sonner";
import { InterceptorErrorData, InterceptorRequestData, InterceptorResponseData } from "ic-use-actor";
import { isIdentityExpired } from "@/utils/general";

interface ActorProviderProps {
	children: React.ReactNode;
}

const ActorProvider: React.FC<ActorProviderProps> = ({ children }) => {
	const { provider } = useAuth();

    const {identity: iiIdentity, isInitializing: iiIsInitializing, isLoggingIn: iiIsLoggingIn, clear: iiClear, login: iiLogin} = useInternetIdentity();
    const {identity: nfidIdentity, isInitializing: nfidIsInitializing, isLoggingIn: nfidIsLoggingIn, clear: nfidClear, login: nfidLogin} = useNfidIdentity();
    const {identity: oisyIdentity, isInitializing: oisyIsInitializing, isLoggingIn: oisyIsLoggingIn, clear: oisyClear, login: oisyLogin} = useSiwoIdentity();

	// Select the appropriate identity state based on provider
	const getIdentityState = () => {
		switch (provider) {
			case 'II':
				return {
					identity: iiIdentity,
					isInitializing: iiIsInitializing,
					isLoggingIn: iiIsLoggingIn,
					clear: iiClear,
					login: iiLogin
				};
			case 'NFID':
				return {
					identity: nfidIdentity,
					isInitializing: nfidIsInitializing,
					isLoggingIn: nfidIsLoggingIn,
					clear: nfidClear,
					login: nfidLogin
				};
			case 'OISY':
				return {
					identity: oisyIdentity,
					isInitializing: oisyIsInitializing,
					isLoggingIn: oisyIsLoggingIn,
					clear: oisyClear,
					login: oisyLogin
				};
			// Add other providers as needed
			default:
				return {
					identity: undefined,
					isInitializing: false,
					isLoggingIn: false,
					clear: () => {},
					login: () => {},
				};
		}
	};

	const { identity, isInitializing, isLoggingIn, clear, login } = getIdentityState();


	const errorToast = (error: unknown) => {
        if (typeof error === "object" && error !== null && "message" in error) {
            toast.error(error.message as string);
        }
    };

	const handleResponseError = (data: InterceptorErrorData) => {
		console.error("onResponseError", data);
		if (isIdentityExpired(data.error)) {
			toast.error("Session expired.");
			setTimeout(() => {
				clear();
				window.location.reload();
			}, 2000);
			return;
		}

		if (typeof data === "object" && data !== null && "message" in data) {
			errorToast(data);
		}
	};

	const handleRequest = (data: InterceptorRequestData) => {
		// console.log("onRequest", data.args, data.methodName);
		return data.args;
	};

	const handleResponse = (data: InterceptorResponseData) => {
		// console.log("onResponse", data.args, data.methodName, data.response);
		return data.response;
	};

	return (
		<ActorContext.Provider value={{
			errorToast,
			handleResponseError,
			handleRequest,
			handleResponse,
			identity,
			isInitializing,
			isLoggingIn,
			clear,
			login
		 }}>
			<UserActor>
				<AssetManagerActor>
					{children}
				</AssetManagerActor>
			</UserActor>
		</ActorContext.Provider>
	);
};

export default ActorProvider;