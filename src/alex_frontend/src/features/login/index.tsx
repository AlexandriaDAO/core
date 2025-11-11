import React, { lazy, Suspense, useState } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/lib/components/dialog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setOpen } from "./loginSlice";
import { Shield, Wallet, Globe, ArrowRight, XIcon } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Processing from "@/components/Processing";
import { Button } from "@/lib/components/button";
import { Alert } from "@/components/Alert";
import { useAR, useETH, useIdentity, useInternetIdentity, useNfid, useOisy, usePlug, useSOL } from "@/lib/ic-use-identity";

// DialogContent will be loaded when it can be loaded, not blocking the ui
const DialogContent = lazy(() =>
	import("@/lib/components/dialog").then((module) => ({
		default: module.DialogContent,
	}))
);

interface LoginProps {
	fullpage?: boolean;
}

const Login:React.FC<LoginProps> = ({ fullpage = false }) => {
	const dispatch = useAppDispatch();
	const { open } = useAppSelector((state) => state.login);
	const {status, error} = useIdentity();

	const ii = useInternetIdentity();
	const nfid = useNfid();
	const oisy = useOisy();
	const plug = usePlug();
	const ethereum = useETH();
	const solana = useSOL();
	const arweave = useAR();

	const isInitializing = status === 'initializing';
	const isLoggingIn = status === 'connecting' || status === 'preparing' || status === 'signing' || status === 'authenticating' || status === 'delegating'

	// sequence matters
	return (
		<Suspense fallback={<Processing message="Opening..." />}>
			<Dialog open={open || fullpage}>
				<DialogTrigger>
					<div
						onClick={() => dispatch(setOpen(true))}
						className="flex-shrink h-auto flex justify-between gap-1 px-3 py-1.5 sm:px-4 sm:py-2 items-center bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white hover:text-white hover:border-white hover:from-gray-600 hover:to-gray-500 rounded-full cursor-pointer transition-all duration-300 font-medium"
					>
						<span className="text-sm sm:text-base font-normal font-roboto-condensed tracking-wider">
							{isInitializing ? 'Initializing...' : isLoggingIn ? 'Logging in...':'Login'}
						</span>
					</div>
				</DialogTrigger>
				<DialogContent
					onOpenAutoFocus={(e) => e.preventDefault()}
					className="bg-transparent backdrop-filter backdrop-blur-lg place-content-center max-w-full w-full h-full max-h-full font-roboto-condensed px-6 py-3 animate-in animate-out "
					closeIcon={
						fullpage ? null : <XIcon
							size={30}
							onClick={() => dispatch(setOpen(false))}
							className="text-muted dark:text-muted-foreground"
						/>
					}
				>
					<div className="space-y-10">
						<DialogHeader className="space-y-1">
							<DialogTitle className="flex items-center justify-center gap-2">
								<span className="text-white text-3xl font-semibold">
									Let's connect
								</span>
							</DialogTitle>
							{/* DialogDescription is a p tag, don't put div inside DialogDescription it will throw console error */}
							<DialogDescription className="text-center text-muted dark:text-muted-foreground">
								We support multiple secure authentication
								methods including Internet Identity, NFID, and
								OISY. Choose how you would like to authenticate
								yourself.
							</DialogDescription>
						</DialogHeader>

						{error && <Alert variant="danger" title="Error" className="max-w-5xl">{error.message}</Alert>}
						{status === 'connecting' && <Alert title="Connecting">Please wait while we are connecting to your wallet</Alert>}
						{status === 'preparing' && <Alert title="Getting Message">Please wait while we are preparing a secure msessage</Alert>}
						{status === 'signing' && <Alert title="Awaiting Signing">Please Sign the message with your wallet</Alert>}
						{status === 'authenticating' && <Alert title="Authenticating">Please wait while we are authenticating you</Alert>}
						{status === 'delegating' && <Alert title="Delegating">Please wait while we are requesting a delegation for you</Alert>}

						<div className="space-y-6 w-full">
							{/* Native Wallets Section */}
							<div className="space-y-3">
								<div className="space-y-1">
									<div className="flex items-center gap-2 text-muted dark:text-primary ">
										<Wallet className="w-5 h-5" />
										<h2 className="text-lg font-semibold">
											Native Wallets
										</h2>
									</div>
									<p className="text-sm text-muted-foreground">
										Internet Computer native authentication methods with seamless integration
									</p>
								</div>

								<div className="flex gap-3">
									<Button
										onClick={() =>
											ii.login({
												derivationOrigin: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io",
												identityProvider: process.env.DFX_NETWORK === "local" ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`: "https://id.ai",
											})
										}
										variant="outline"
										className="flex-1 h-12 flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
									>
										<img
											src="/images/ic.svg"
											alt="Internet Identity 2.0"
											className="w-5 h-5"
										/>
										<span className="text-sm font-medium">
											Internet Identity 2.0
										</span>
									</Button>

									<Button
										onClick={() =>
											ii.login({
												derivationOrigin: "https://yj5ba-aiaaa-aaaap-qkmoa-cai.icp0.io",
												identityProvider: process.env.DFX_NETWORK === "local" ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`: "https://identity.ic0.app",
											})
										}
										variant="outline"
										className="flex-1 h-12 flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
									>
										<img
											src="/images/ic.svg"
											alt="Internet Identity Legacy"
											className="w-5 h-5"
										/>
										<span className="text-sm font-medium">
											Internet Identity (Legacy)
										</span>
									</Button>

									<Button
										onClick={() => nfid.login()}
										variant="outline"
										className="flex-1 h-12 flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
									>
										<img
											src="/images/nfid-logo.png"
											alt="NFID"
											className="w-5 h-5"
										/>
										<span className="text-sm font-medium">
											NFID
										</span>
									</Button>

									<Button
										onClick={() => plug.login()}
										variant="outline"
										className="flex-1 h-12 flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
									>
										<img
											src="/images/plug-logo.png"
											alt="Plug"
											className="dark:bg-white w-5 h-5"
										/>
										<span className="text-sm font-medium">
											Plug
										</span>
									</Button>
								</div>
							</div>

							{/* External Wallets Section */}
							<div className="space-y-4">
								<div className="space-y-1">
									<div className="text-muted dark:text-primary flex items-center gap-2">
										<Globe className="w-5 h-5" />
										<h2 className="text-lg font-semibold">
											External Wallets
										</h2>
									</div>
									<p className="text-sm text-muted-foreground">
										Connect with external wallets through secure identity delegation.<br />
										<span className="text-xs text-muted-foreground/80 italic">
											Tip: If nothing happens, make sure your wallet extension (e.g. MetaMask, Phantom, or Wander) is installed, unlocked, and allowed to open pop-ups.
										</span>
									</p>
								</div>

								<div className="flex gap-3">
									<Button
										onClick={() => oisy.login()}
										variant="outline"
										className="flex-1 h-12 flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
									>
										<img
											src="/images/oisy-logo.svg"
											alt="OISY"
											className="w-5 h-5"
										/>
										<span className="text-sm font-medium">
											OISY
										</span>
									</Button>

									<Button
										onClick={() => ethereum.login()}
										variant="outline"
										className="flex-1 h-12 flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
									>
										<img
											src="/images/ethereum.svg"
											alt="Ethereum"
											className="w-5 h-5"
										/>
										<span className="text-sm font-medium">
											Ethereum
										</span>
									</Button>

									<Button
										onClick={() => solana.login()}
										variant="outline"
										className="flex-1 h-12 flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
									>
										<svg
											width="17"
											height="14"
											viewBox="0 0 17 14"
											className="w-5 h-5 text-foreground"
											fill="currentColor"
										>
											<path
												d="M2.76352 10.2206C2.86776 10.1158 3.00783 10.0569 3.15442 10.0569H16.722C16.9695 10.0569 17.0933 10.3581 16.9174 10.5316L14.2365 13.2258C14.1322 13.3306 13.9922 13.3895 13.8456 13.3895H0.278033C0.030462 13.3895 -0.0933235 13.0883 0.0825823 12.9148L2.76352 10.2206Z"
												fill="currentColor"
											/>
											<path
												d="M2.76352 0.163685C2.86776 0.0589267 3.00783 0 3.15442 0H16.722C16.9695 0 17.0933 0.301181 16.9174 0.474687L14.2365 3.16567C14.1322 3.27043 13.9922 3.32936 13.8456 3.32936H0.278033C0.030462 3.32936 -0.0933235 3.02818 0.0825823 2.85467L2.76352 0.163685Z"
												fill="currentColor"
											/>
											<path
												d="M14.2365 5.15929C14.1322 5.05453 13.9922 4.99561 13.8456 4.99561H0.278033C0.030462 4.99561 -0.0933235 5.29679 0.0825823 5.47029L2.76352 8.16128C2.86776 8.26604 3.00783 8.32496 3.15442 8.32496H16.722C16.9695 8.32496 17.0933 8.02378 16.9174 7.85028L14.2365 5.15929Z"
												fill="currentColor"
											/>
										</svg>
										<span className="text-sm font-medium">
											Solana
										</span>
									</Button>

									<Button
										onClick={() => arweave.login()}
										variant="outline"
										className="flex-1 h-12 flex items-center justify-center gap-2 border border-border hover:border-primary transition-colors"
									>
										<svg
											viewBox="0 0 31.8 31.8"
											className="w-5 h-5 text-foreground"
											fill="currentColor"
										>
											<circle
												fill="none"
												stroke="currentColor"
												strokeWidth="2.5"
												cx="15.9"
												cy="15.9"
												r="14.7"
											/>
											<path
												fill="currentColor"
												d="M18.7,21.2c-0.1-0.1-0.1-0.3-0.2-0.5c0-0.2-0.1-0.4-0.1-0.6c-0.2,0.2-0.4,0.3-0.6,0.5c-0.2,0.2-0.5,0.3-0.7,0.4c-0.3,0.1-0.5,0.2-0.9,0.3c-0.3,0.1-0.7,0.1-1,0.1c-0.6,0-1.1-0.1-1.6-0.3c-0.5-0.2-0.9-0.4-1.3-0.7c-0.4-0.3-0.6-0.7-0.8-1.1c-0.2-0.4-0.3-0.9-0.3-1.4c0-1.2,0.5-2.2,1.4-2.8c0.9-0.7,2.3-1,4.1-1h1.7v-0.7c0-0.6-0.2-1-0.5-1.3c-0.4-0.3-0.9-0.5-1.6-0.5c-0.6,0-1,0.1-1.3,0.4c-0.3,0.3-0.4,0.6-0.4,1h-3c0-0.5,0.1-1,0.3-1.4c0.2-0.4,0.5-0.8,1-1.2c0.4-0.3,0.9-0.6,1.5-0.8c0.6-0.2,1.3-0.3,2.1-0.3c0.7,0,1.3,0.1,1.9,0.3c0.6,0.2,1.1,0.4,1.6,0.8c0.4,0.3,0.8,0.8,1,1.3c0.2,0.5,0.4,1.1,0.4,1.8v5c0,0.6,0,1.1,0.1,1.5c0.1,0.4,0.2,0.8,0.3,1v0.2H18.7z M15.8,19.1c0.3,0,0.6,0,0.8-0.1c0.3-0.1,0.5-0.2,0.7-0.3c0.2-0.1,0.4-0.2,0.5-0.4c0.1-0.1,0.3-0.3,0.4-0.4v-2h-1.5c-0.5,0-0.9,0-1.2,0.1c-0.3,0.1-0.6,0.2-0.8,0.4c-0.2,0.2-0.4,0.3-0.5,0.6c-0.1,0.2-0.1,0.5-0.1,0.7c0,0.4,0.1,0.7,0.4,1C14.8,19,15.3,19.1,15.8,19.1z"
											/>
										</svg>
										<span className="text-sm font-medium">
											Arweave
										</span>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Suspense>
	);
};

export default Login;
