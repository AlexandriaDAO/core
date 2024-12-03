import { setUser } from "@/features/auth/authSlice";
import login from "@/features/login/thunks/login";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useInternetIdentity } from "ic-use-internet-identity";
import React, { useEffect } from "react";

interface UserProviderProps {
	children: React.ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const {identity} = useInternetIdentity();
    const {actor} = useUser();

    const dispatch = useAppDispatch();
    const {user} = useAppSelector(state=>state.auth);

    // Handle auth state changes
    useEffect(()=>{

        if(!actor) return;

        if(!identity){
            dispatch(setUser(null));
            return;
        }

        // if(user?.principal !== identity.getPrincipal().toString()){
        if(!user){
            dispatch(login(actor));
        };

    }, [actor, identity, user, dispatch]);

	return <> {children} </>
}


export default UserProvider