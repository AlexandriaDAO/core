import React from "react";
import IIUserProvider from "./IIUserProvider";
import OISYUserProvider from "./OISYUserProvider";
import useAuth from "@/hooks/useAuth";
import NFIDUserProvider from "./NFIDUserProvider";

interface UserProviderProps {
	children: React.ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

    const {provider} = useAuth();

    if (provider === 'II') return <IIUserProvider>{children}</IIUserProvider>

    if (provider === 'NFID') return <NFIDUserProvider>{children}</NFIDUserProvider>

    if (provider === 'OISY') return <OISYUserProvider>{children}</OISYUserProvider>

    return <> {children} </>;
}

export default UserProvider