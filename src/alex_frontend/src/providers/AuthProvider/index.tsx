import React, { useState, useEffect } from "react";
import IIProvider from "./IIProvider";
import NFIDProvider from "./NFIDProvider";
import OISYProvider from "./OISYProvider";
// import EthProvider from "./EthProvider";
import AuthContext, { Authenticator } from "@/contexts/AuthContext";
// import SolProvider from "./SolProvider";

interface AuthProviderProps {
	children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const preffered = localStorage.getItem('provider');

    const [provider, setProvider] = useState<Authenticator>( preffered ? preffered as Authenticator : 'II');

	useEffect(() => {
		localStorage.setItem('provider', provider);
	}, [provider]);

	// const renderProvider = () => {
	// 	switch (provider) {
	// 		case 'II':
	// 			return <IIProvider>{children}</IIProvider>;
	// 		case 'ETH':
	// 			return <EthProvider>{children}</EthProvider>;
	// 		default:
	// 			return children;
	// 	}
	// };

	// return (
	// 	<AuthContext.Provider value={{ provider, setProvider }}>
	// 		{/* {renderProvider()} */}
	// 		<IIProvider>
	// 			{/* <EthProvider>
	// 				<SolProvider> */}
	// 					{children}
	// 				{/* </SolProvider>
	// 			</EthProvider> */}
	// 		</IIProvider>
	// 	</AuthContext.Provider>
	// );
	return (
		<AuthContext.Provider value={{ provider, setProvider }}>
			<IIProvider>
				<NFIDProvider>
					<OISYProvider>
						{children}
					</OISYProvider>
				</NFIDProvider>
			</IIProvider>
		</AuthContext.Provider>
	);
};

export default AuthProvider;