import React, { useEffect } from "react";
import { Button } from "@/lib/components/button";
import { LoaderCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useSiwsIdentity } from "ic-use-siws-identity";
import { useWallet } from "@solana/wallet-adapter-react";

export default function LoginButton() {
	const { setProvider } = useAuth();
	const { publicKey, connected } = useWallet();
	const { login, isLoggingIn, isPreparingLogin, prepareLogin, isPrepareLoginIdle } = useSiwsIdentity();

	/**
	 * Preload a Siws message on every address change.
	 */
	useEffect(() => {
		if (!isPrepareLoginIdle || !publicKey) return;
		prepareLogin();
	}, [publicKey, prepareLogin, isPrepareLoginIdle]);


	const text = () => {
		if (isLoggingIn) return "Signing in with Solana";

		if (isPreparingLogin) return "Preparing Signin Request";

		return "Sign in with Solana";
	};

	const disabled = isLoggingIn || !connected || isPreparingLogin;

	const handleLogin = async () => {
		try {
			setProvider('SOL');
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
