import React from "react";
import IIProvider from "./IIProvider";
import NFIDProvider from "./NFIDProvider";
import OISYProvider from "./OISYProvider";
// import EthProvider from "./EthProvider";
// import SolProvider from "./SolProvider";

interface IdentityProviderProps {
	children: React.ReactNode;
}

const IdentityProvider: React.FC<IdentityProviderProps> = ({ children }) => {
	return (
		<IIProvider>
			<NFIDProvider>
				<OISYProvider>
					{children}
				</OISYProvider>
			</NFIDProvider>
		</IIProvider>
	);
};

export default IdentityProvider;