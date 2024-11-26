import React from "react";
import AuthMenu from "./components/AuthMenu";
import Account from "./components/Account";

const Auth = () => {
	return (
        <div className="flex gap-2 justify-center items-center">
            <Account />
            <AuthMenu />
        </div>

	);
}

export default Auth;