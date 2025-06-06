import React, { useState, useEffect, useMemo } from "react";
import AuthContext, { AuthContextProps, Authenticator } from "@/contexts/AuthContext";
import { useInternetIdentity } from "ic-use-internet-identity";
import { useNfidIdentity } from "ic-use-nfid-identity";
import { useSiwoIdentity } from "ic-use-siwo-identity";

interface AuthProviderProps {
	children: React.ReactNode;
}

const STORAGE_KEY = 'provider';

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	// Get initial provider from localStorage with error handling
	const getInitialProvider = (): Authenticator => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return (stored as Authenticator) || 'II';
		} catch (error) {
			console.error('Failed to read provider from localStorage:', error);
			return 'II';
		}
	};

	const [provider, setProvider] = useState<Authenticator>(getInitialProvider);

	// Identity hooks
	const {
		identity: iiIdentity,
		isInitializing: iiIsInitializing,
		isLoggingIn: iiIsLoggingIn,
		clear: iiClear,
		login: iiLogin
	} = useInternetIdentity();

	const {
		identity: nfidIdentity,
		isInitializing: nfidIsInitializing,
		isLoggingIn: nfidIsLoggingIn,
		clear: nfidClear,
		login: nfidLogin
	} = useNfidIdentity();

	const {
		identity: oisyIdentity,
		isInitializing: oisyIsInitializing,
		isLoggingIn: oisyIsLoggingIn,
		clear: oisyClear,
		login: oisyLogin
	} = useSiwoIdentity();

	// Memoized auth state map
	const authStates = useMemo(() => ({
		II: {
			identity: iiIdentity,
			isInitializing: iiIsInitializing,
			isLoggingIn: iiIsLoggingIn,
			clear: iiClear,
			login: iiLogin
		},
		NFID: {
			identity: nfidIdentity,
			isInitializing: nfidIsInitializing,
			isLoggingIn: nfidIsLoggingIn,
			clear: nfidClear,
			login: nfidLogin
		},
		OISY: {
			identity: oisyIdentity,
			isInitializing: oisyIsInitializing,
			isLoggingIn: oisyIsLoggingIn,
			clear: oisyClear,
			login: oisyLogin
		}
	}), [
		iiIdentity, iiIsInitializing, iiIsLoggingIn, iiClear, iiLogin,
		nfidIdentity, nfidIsInitializing, nfidIsLoggingIn, nfidClear, nfidLogin,
		oisyIdentity, oisyIsInitializing, oisyIsLoggingIn, oisyClear, oisyLogin
	]);

	// Memoized current auth state
	const currentAuthState = useMemo(() => 
		(provider === 'II' || provider === 'NFID' || provider === 'OISY') 
			? authStates[provider] 
			: authStates.II
	, [authStates, provider]);

	// Persist provider changes to localStorage
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, provider);
		} catch (error) {
			console.error('Failed to save provider to localStorage:', error);
		}
	}, [provider]);

	// Memoized context value to prevent unnecessary re-renders
	const contextValue = useMemo<AuthContextProps>(() => ({
		provider,
		setProvider,
		...currentAuthState
	}), [provider, currentAuthState]);

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;