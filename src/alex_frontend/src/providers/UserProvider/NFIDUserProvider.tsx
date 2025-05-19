import { setUser } from "@/features/auth/authSlice";
import getCanister from "@/features/auth/thunks/getCanister";
import login from "@/features/login/thunks/login";
import { useUser } from "@/hooks/actors";
import { useAssetManager } from "@/hooks/actors";
import { useIdentity } from "@/hooks/useIdentity";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

interface NFIDUserProviderProps {
	children: React.ReactNode;
}

const NFIDUserProvider: React.FC<NFIDUserProviderProps> = ({ children }) => {
	// const {identity, isInitializing, isLoggingIn, loginStatus, loginError, clear} = useInternetIdentity();
	const {identity, isInitializing} = useIdentity();
    const {actor} = useUser();
    const {actor: assetManagerActor} = useAssetManager();

    const dispatch = useAppDispatch();
    const {user, canister} = useAppSelector(state=>state.auth);

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

    // fetch authenticated user's canister
    useEffect(()=>{
        // Wait for the asset manager actor to be available before proceeding
        if(!assetManagerActor || !user) return;

        // Attempt to login only if we don't have user data in the store
        // This prevents unnecessary login attempts if the user is already authenticated
        dispatch(getCanister({actor: assetManagerActor}));
    }, [assetManagerActor, user]);


	return <> {children} </>
}


export default NFIDUserProvider;