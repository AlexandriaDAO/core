import React from "react";
import IIUserProvider from "./IIUserProvider";
import { UserActor } from "@/actors";
// import EthUserProvider from "./EthUserProvider";
// import useAuth from "@/hooks/useAuth";
// import SolUserProvider from "./SolUserProvider";

interface UserProviderProps {
	children: React.ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

    // const {provider} = useAuth();

    // if (provider === 'II') return <IIUserProvider>{children}</IIUserProvider>;

    // if (provider === 'ETH') return <EthUserProvider>{children}</EthUserProvider>;

    // if (provider === 'SOL') return <SolUserProvider>{children}</SolUserProvider>;

    // return <> {children} </>

    return (
        <UserActor>
            <IIUserProvider>{children}</IIUserProvider>
        </UserActor>
    );
}

export default UserProvider