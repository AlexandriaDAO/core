import React from "react";
import { InternetIdentityProvider } from "ic-use-internet-identity";

interface IIProviderProps {
	children: React.ReactNode;
}

const IIProvider: React.FC<IIProviderProps> = ({ children }) => {
	return (
		<InternetIdentityProvider loginOptions={{
			derivationOrigin: process.env.DFX_NETWORK !== "ic"
				? undefined
				: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io",
			maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
			// maxTimeToLive: BigInt(60_000_000_000), // 1 minute
			windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
		}} createOptions={{
			idleOptions: {
				// by default, the idle manager is disabled by ic-use-internet-identity
				// we need to enable it here
				disableDefaultIdleCallback: false,
				disableIdle: false,

				// default behaviours

				// @default 10 minutes [600_000]
				// idleTimeout: 1 * 60 * 1000, // 1 minute in milliseconds

				// @default logout and refresh the page
				// onIdle: () => {
				// 	// Clear identity and redirect to home page when idle
				// 	// window.location.href = '/';
				// }
			},
		}}>
			{children}
		</InternetIdentityProvider>
	)
}

export default IIProvider;