import { Button } from "@/lib/components/button";
import React, { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useSiwoIdentity } from "ic-use-siwo-identity";

export default function LoginButton() {
	const { setProvider } = useAuth();
	const { login, isLoggingIn, isPreparingChallenge, prepareChallenge, challengeStatus, account } = useSiwoIdentity();

	/**
	 * Preload a Siwe message on every address change.
	 */
	useEffect(() => {
		if (challengeStatus !== "idle" || !account) return;
		prepareChallenge();
	}, [account, challengeStatus, prepareChallenge]);

	const text = () => {
		if (isLoggingIn) {
			if (isPreparingChallenge) return "Preparing Challenge";
			return "Signing in with OISY";
		}
		return "Sign in with OISY";
	};

	const disabled = isLoggingIn || !account || isPreparingChallenge;

	const handleLogin = async () => {
		try {
			setProvider('OISY');
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
				{(isLoggingIn || isPreparingChallenge) && (
					<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
				)}
				{text()}
			</>
		</Button>
	);
}
