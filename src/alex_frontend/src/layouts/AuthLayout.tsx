import React, { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { useUser } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Loading from "@/components/Loading";
import Signup from "@/features/signup";
import BaseLayout from "./BaseLayout";
import Login from "@/features/login";
import { Outlet } from "react-router";


const AuthLayout = () => {
	const {identity} = useInternetIdentity();

	const {user} = useAppSelector(state=>state.auth);
	const {loading, error} = useAppSelector(state=>state.login);

    if (loading) {
        return <Loading />;
    }

    if (!identity) {
        return <Login fullpage/>;
    }

    if(!user){
        if(error){
            return <Signup fullpage/>;
        }else{
            return <Loading />;
        }
    }

    return <Outlet/>
};

export default AuthLayout;