import React from "react";
import { useIdentity } from "@/lib/ic-use-identity";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Loading from "@/components/Loading";
import { FullPageSignup } from "@/features/signup";
import Login from "@/features/login";
import { Outlet } from "@tanstack/react-router";


const AuthGuard = () => {
	const {identity, status} = useIdentity();

	const {user} = useAppSelector(state=>state.auth);
	const {loading, error} = useAppSelector(state=>state.login);

    if (status === 'initializing' || loading ) return <Loading />;

    if (!identity) return <Login fullpage/>;

    if(!user){
        if(error){
            return <FullPageSignup />;
        }else{
            return <Loading />;
        }
    }

    return <Outlet/>
};

export default AuthGuard;