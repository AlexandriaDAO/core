import { AnonymousIdentity, Identity } from '@dfinity/agent';
import { DelegationIdentity } from '@dfinity/identity';
import { InterceptorErrorData, InterceptorRequestData, InterceptorResponseData } from 'ic-use-actor';
import { createContext } from 'react';

interface ActorContextProps {
	errorToast: (error: unknown) => void;
	handleResponseError: (data: InterceptorErrorData) => void;
	handleRequest: (data: InterceptorRequestData) => any;
	handleResponse: (data: InterceptorResponseData) => any;
	identity: Identity | DelegationIdentity | undefined;
	isInitializing: boolean;
	isLoggingIn: boolean;
	clear: () => void;
	login: () => void;
}

const ActorContext = createContext<ActorContextProps | null>(null);

export default ActorContext;