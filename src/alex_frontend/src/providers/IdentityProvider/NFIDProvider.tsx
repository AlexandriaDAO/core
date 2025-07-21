import React from "react";
import { NfidIdentityProvider } from "ic-use-nfid-identity";

interface NFIDProviderProps {
	children: React.ReactNode;
}

const NFIDProvider: React.FC<NFIDProviderProps> = ({ children }) => {
	return (
		<NfidIdentityProvider loginOptions={{
			derivationOrigin: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io",
			maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
			// maxTimeToLive: BigInt(60_000_000_000), // 1 minute
			// windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
		}}>
			{children}
		</NfidIdentityProvider>
	)
}

export default NFIDProvider;



