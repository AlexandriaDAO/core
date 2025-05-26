import React, { useEffect } from "react";
import { setUser } from "@/features/auth/authSlice";
import getCanisters from "@/features/auth/thunks/getCanisters";
import login from "@/features/login/thunks/login";
import { useAssetManager, useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useIdentity } from "@/hooks/useIdentity";

interface OISYUserProviderProps {
	children: React.ReactNode;
}

const OISYUserProvider: React.FC<OISYUserProviderProps> = ({ children }) => {
	const {identity, isInitializing} = useIdentity();
    const {actor} = useUser();
    const {actor: assetManagerActor} = useAssetManager();

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


    // fetch authenticated user's canister
    useEffect(()=>{
        // Wait for the asset manager actor to be available before proceeding
        if(!assetManagerActor || !user) return;

        // Attempt to login only if we don't have user data in the store
        // This prevents unnecessary login attempts if the user is already authenticated
        dispatch(getCanisters({actor: assetManagerActor}));
    }, [assetManagerActor, user]);

	return <> {children} </>
}


export default OISYUserProvider