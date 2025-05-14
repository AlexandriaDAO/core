import React from "react";
import IIUserProvider from "./IIUserProvider";
import OISYUserProvider from "./OISYUserProvider";
import { AssetManagerActor, UserActor } from "@/actors";
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
            <AssetManagerActor>
                <IIUserProvider>{children}</IIUserProvider>
            </AssetManagerActor>
        </UserActor>
    )

    // if (provider === 'SOL') return <SolUserProvider>{children}</SolUserProvider>;

    if (provider === 'OISY') return (
        <UserActor>
            <AssetManagerActor>
                <OISYUserProvider>{children}</OISYUserProvider>
            </AssetManagerActor>
        </UserActor>
    )


    return <> {children} </>;
}

export default UserProvider