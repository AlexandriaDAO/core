import React from "react";
import AuthMenu from "./components/AuthMenu";
import ETHAccount from "./components/ETHAccount";
import useAuth from "@/hooks/useAuth";
import ICPAccount from "./components/ICPAccount";

const Auth = () => {
    const {provider} = useAuth();
	return (
        <div className="flex gap-2 justify-center items-center">
            <ICPAccount />
            {provider === "ETH" && <ETHAccount />}
            <AuthMenu />
        </div>

	);
}

export default Auth;