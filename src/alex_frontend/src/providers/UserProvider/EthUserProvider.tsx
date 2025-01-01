import React, { useCallback, useEffect } from "react";
import { setUser } from "@/features/auth/authSlice";
import login from "@/features/login/thunks/login";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { useChainId, useAccount } from "wagmi";
import { isChainIdSupported } from "../AuthProvider/wagmi.config";
import { toast } from "sonner";

interface EthUserProviderProps {
	children: React.ReactNode;
}

const EthUserProvider: React.FC<EthUserProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();

	const {actor} = useUser();

	const {user} = useAppSelector(state=>state.auth);

	const { isConnected, address } = useAccount();
	const chainId = useChainId();
	const { clear, isInitializing, identity, identityAddress, prepareLoginError, loginError} = useSiweIdentity();

    const logout = useCallback(() => {
        dispatch(setUser(null));
        clear();
    }, [dispatch, clear]);

	// If the user is not connected, clear the session.
	useEffect(() => {
		if (!isConnected && identity) {
            logout();
		}
	}, [isConnected, identity, logout]);

	// If user switches to an unsupported network, clear the session.
	useEffect(() => {
		if (!isChainIdSupported(chainId)) {
			logout();
		}
	}, [chainId, logout]);

	// If the user switches to a different address, clear the session.
	useEffect(() => {
		if (identityAddress && address && address !== identityAddress) {
			logout();
		}
	}, [address, identityAddress, logout]);

	// Handle authentication state changes and user synchronization
	useEffect(()=>{
		// Skip any auth checks while SIWE Identity is initializing
		if(isInitializing) return;

		// Clear user data when there's no identity (user logged out)
		if(!identity){
			dispatch(setUser(null));
			return;
		}

		// Wait for the user actor to be available before proceeding
		if(!actor) return;

        // Attempt to login only if we don't have user data in the store
        // This prevents unnecessary login attempts if the user is already authenticated
        if(!user){
            dispatch(login(actor));
        }

	}, [actor, identity, user, dispatch]);




	// Login actions

	/**
	 * Show an error toast if the prepareLogin() call fails.
	 */
	useEffect(() => {
		// console.log("prepareLoginError", prepareLoginError);
		if (prepareLoginError) {
			toast.error(prepareLoginError.message);
		}
	}, [prepareLoginError]);

	/**
	 * Show an error toast if the login call fails.
	 */
	useEffect(() => {
		if (loginError) {
			toast.error(loginError.message);
		}
	}, [loginError]);

	return <> {children} </>
};

export default EthUserProvider;
