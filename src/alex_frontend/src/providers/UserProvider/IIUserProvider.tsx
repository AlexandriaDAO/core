import { setUser } from "@/features/auth/authSlice";
import login from "@/features/login/thunks/login";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useInternetIdentity } from "ic-use-internet-identity";
import React, { useEffect } from "react";

interface IIUserProviderProps {
	children: React.ReactNode;
}

const IIUserProvider: React.FC<IIUserProviderProps> = ({ children }) => {
	const {identity, isInitializing} = useInternetIdentity();
    const {actor} = useUser();

    const dispatch = useAppDispatch();
    const {user} = useAppSelector(state=>state.auth);

    // Handle authentication state changes and user synchronization
    useEffect(()=>{
        // Skip any auth checks while Internet Identity is initializing
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
    }, [isInitializing, actor, identity, user, dispatch]);

	return <> {children} </>
}


export default IIUserProvider