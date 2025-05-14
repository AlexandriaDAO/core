import React from "react";
import { idlFactory } from "../../../../declarations/ic_siwo";
import { SiwoIdentityProvider } from "ic-use-siwo-identity";

interface OISYProviderProps {
	children: React.ReactNode;
}

const OISYProvider: React.FC<OISYProviderProps> = ({ children }) => {
	return (
		<SiwoIdentityProvider
			idlFactory={idlFactory}
			canisterId="p3dep-3iaaa-aaaap-qp2kq-cai"
			httpAgentOptions={{ host: "https://icp-api.io" }}
		>
			{children}
		</SiwoIdentityProvider>
	);
};

export default OISYProvider;
