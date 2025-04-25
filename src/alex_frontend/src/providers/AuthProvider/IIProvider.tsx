// import React from "react";
// import { InternetIdentityProvider } from "ic-use-internet-identity";

// interface IIProviderProps {
// 	children: React.ReactNode;
// }

// const IIProvider: React.FC<IIProviderProps> = ({ children }) => {
// 	return (
// 		<InternetIdentityProvider loginOptions={{
// 			derivationOrigin: process.env.DFX_NETWORK !== "ic"
// 				? undefined
// 				: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io",
// 			maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
// 			// maxTimeToLive: BigInt(60_000_000_000), // 1 minute
// 			// windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
// 		}}>
// 			{children}
// 		</InternetIdentityProvider>
// 	)
// }

// export default IIProvider;






import React from "react";
import { InternetIdentityProvider } from "ic-use-internet-identity";

interface IIProviderProps {
	children: React.ReactNode;
}

const IIProvider: React.FC<IIProviderProps> = ({ children }) => {
	return (
		<InternetIdentityProvider
			loginOptions={{
				derivationOrigin: process.env.DFX_NETWORK !== "ic"
					? undefined
					: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io",
				// maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
				// maxTimeToLive: BigInt(60_000_000_000), // 1 minute
				// maxTimeToLive: BigInt(1 * 60 * 1000 * 1000 * 1000), // 1 minute
				// maxTimeToLive: BigInt(60 * 60 * 1000 * 1000 * 1000), // 1 hour or 60 minutes
				// maxTimeToLive: BigInt(8 * 60 * 1000 * 1000 * 1000), // 8 hours
				// maxTimeToLive: BigInt(24 * 60 * 1000 * 1000 * 1000), // 1 day or 24 hours
				maxTimeToLive: BigInt(7 * 24 * 60 * 1000 * 1000 * 1000), // 7 days or 1 week
				// time for the identity to be valid after which identity will be expired

				// windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
			}}
			createOptions={{
				idleOptions: {
					disableDefaultIdleCallback: false,
					disableIdle: false,
					// in milliseconds
					// idleTimeout: 1 * 60 * 1000, // 1 minute
					// idleTimeout: 30 * 60 * 1000, // 30 minutes default
					// idleTimeout: 60 * 60 * 1000, // 1 hour or 60 minutes
					// idleTimeout: 24 * 60 * 60 * 1000, // 1 day or 24 hours
					idleTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days or 1 week

					// onIdle: () => {
					// 	console.log("onIdle");
					// },
				},
			}}
		>
			{children}
		</InternetIdentityProvider>
	)
}

export default IIProvider;