import React from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Loading from "@/components/Loading";
import { FullPageSignup } from "@/features/signup";
import { FullPageLogin } from "@/features/login";
import { Outlet } from "react-router";


const AuthGuard = () => {
	const {identity, isInitializing} = useIdentity();

	const {user} = useAppSelector(state=>state.auth);
	const {loading, error} = useAppSelector(state=>state.login);

    if (isInitializing || loading ) return <Loading />;

    if (!identity) return <FullPageLogin/>;

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