import React, { ReactNode } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { useUser } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Loading from "@/components/Loading";
import Signup from "@/features/signup";
import BaseLayout from "./BaseLayout";
import Login from "@/features/login";

interface AuthLayoutProps {
	children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
	const {identity} = useInternetIdentity();

	const {user} = useAppSelector(state=>state.auth);
	const {loading, error} = useAppSelector(state=>state.login);

    const renderContent = () => {
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


        return (
            <>
                {children}
            </>
        );
    };

    return (
        <BaseLayout>
            {renderContent()}
        </BaseLayout>
    )
};

export default AuthLayout;