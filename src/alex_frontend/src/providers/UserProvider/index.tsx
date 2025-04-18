import React from "react";
import IIUserProvider from "./IIUserProvider";
import { UserActor } from "@/actors";
// import EthUserProvider from "./EthUserProvider";
import useAuth from "@/hooks/useAuth";
// import SolUserProvider from "./SolUserProvider";
// import NFIDUserProvider from "./NFIDUserProvider";

interface UserProviderProps {
	children: React.ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

    const {provider} = useAuth();

    if (provider === 'II' || provider === 'NFID') return (
        <UserActor>
            <IIUserProvider>{children}</IIUserProvider>
        </UserActor>
    )

    // if (provider === 'SOL') return <SolUserProvider>{children}</SolUserProvider>;

    return <> {children} </>;
}

export default UserProvider