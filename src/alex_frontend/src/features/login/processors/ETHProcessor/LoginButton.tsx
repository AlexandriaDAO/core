import { useAccount, useChainId } from "wagmi";

import { useSiweIdentity } from "ic-use-siwe-identity";
import { isChainIdSupported } from "@/providers/AuthProvider/wagmi.config";
import { Button } from "@/lib/components/button";
import React, { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function LoginButton() {
	const { setProvider } = useAuth();
	const { isConnected, address } = useAccount();
	const chainId = useChainId();
	const { login, isLoggingIn, isPreparingLogin, prepareLogin, prepareLoginStatus } = useSiweIdentity();

	/**
	 * Preload a Siwe message on every address change.
	 */
	useEffect(() => {
		if (prepareLoginStatus !== "idle" || !isConnected || !address) return;
		prepareLogin();
	}, [isConnected, address, prepareLogin, prepareLoginStatus]);

	const text = () => {
		if (isLoggingIn) return "Signing in with Ethereum";

		if (isPreparingLogin) return "Preparing Signin Request";

		return "Sign in with Ethereum";
	};

	const disabled =
		!isChainIdSupported(chainId) ||
		isLoggingIn ||
		!isConnected ||
		isPreparingLogin;

	const handleLogin = async () => {
		try {
			setProvider('ETH');
			// calling login directly without try catch throws uncatchable error
			await login();
		} catch (error) {
			console.error("Error during login:", error);
		}
	};

	return (
		<Button
			className="w-full gap-2 justify-start items-center"
			disabled={disabled}
			onClick={handleLogin}
		>
			<>
				{(isLoggingIn || isPreparingLogin) && (
					<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
				)}
				{text()}
			</>
		</Button>
	);
}
