import React, { useCallback, useEffect } from "react";
import { setUser } from "@/features/auth/authSlice";
import login from "@/features/login/thunks/login";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSiwsIdentity } from "ic-use-siws-identity";
import { toast } from "sonner";

interface SolUserProviderProps {
	children: React.ReactNode;
}

const SolUserProvider: React.FC<SolUserProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();

	const {actor} = useUser();

	const {user} = useAppSelector(state=>state.auth);

	const { publicKey, connected } = useWallet();
	const { clear, isInitializing, identity, identityAddress, prepareLoginError, loginError  } = useSiwsIdentity();

    const logout = useCallback(() => {
        dispatch(setUser(null));
        clear();
    }, [dispatch, clear]);

	// If the user is not connected, clear the session.
	useEffect(() => {
		if (identity && connected && !publicKey) {
			logout();
		}
	}, [connected, publicKey, logout, identity]);

	// If the user switches to a different address, clear the session.
	useEffect(() => {
		if (identityAddress && publicKey && !identityAddress.equals(publicKey)) {
			logout();
		}
	}, [publicKey, logout, identityAddress]);


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

export default SolUserProvider;
