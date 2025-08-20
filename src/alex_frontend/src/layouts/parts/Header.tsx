import React, { Suspense, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Logo from "@/components/Logo";
import Tabs from "@/components/Tabs";
import { useIdentity } from "@/hooks/useIdentity";
import { InlineLogin } from "@/features/login";
import Processing from "@/components/Processing";
import { useUser } from "@/hooks/actors";

import { lazy } from "react";
import { ModeToggle } from "@/lib/components/mode-toggle";

import { LoaderCircle } from "lucide-react";

const InlineSignup = lazy(() =>
	import("@/features/signup").then((module) => ({
		default: module.InlineSignup,
	}))
);

const Auth = lazy(() => import("@/features/auth"));

const BalanceButton = lazy(() => import("@/features/balance").then(module=>({
	default: module.BalanceButton
})));

const AccountButton = lazy(() => import("@/features/account").then((module) => ({
	default: module.AccountButton,
})));

export const Entry = () => {
	const { actor } = useUser();
	const { identity, isInitializing, isLoggingIn } = useIdentity();
	const { user } = useAppSelector((state) => state.auth);
	const { loading } = useAppSelector((state) => state.login);
	// const [countdown, setCountdown] = useState(60);

	// // relevant logic in /src/providers/UserProvider/IIUserProvider.tsx
	// // Handle countdown timer and page refresh
	// useEffect(() => {
	// 	let timerInterval = null;

	// 	// Only start countdown if in a loading state
	// 	if (isLoggingIn) {
	// 		timerInterval = setInterval(() => {
	// 		setCountdown(prev => {
	// 			if (prev <= 1) { 
	// 				return 0;
	// 			}
	// 			return prev - 1;
	// 		});
	// 		}, 1000);
	// 	} else {
	// 		// Reset countdown when not in loading state
	// 		setCountdown(60);
	// 	}

	// 	return () => {
	// 		if (timerInterval) clearInterval(timerInterval);
	// 	};
	// }, [isLoggingIn]);

	// sequence matters

	// First, check initialization state
	if (isInitializing) return <Processing message="Initializing..." />;

	// Show loading state during login on frontend
	if (isLoggingIn) return <Processing message="Logging in..." />;

	// // Show loading state during login on frontend with countdown
	// if (isLoggingIn) return (
	// 	<>
	// 		<div className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] rounded-full cursor-not-allowed">
	// 			<span className="w-max text-base font-normal font-roboto-condensed tracking-wider">Page refreshes in {countdown}s</span>
	// 		</div>
	// 		<Processing message={`Logging in...`} />
	// 	</>
	// );

	// Then check if we have an identity
	if (!identity) return <InlineLogin />;

	// Show loading state while waiting for actor
	if (!actor) return <Processing message="Loading Actor..." />;

	// Show loading state during login with backend
	if (loading) return <Processing message="Authenticating..." />;

	// If we have identity and actor but no user, show signup
	if (!user)
		return (
			// load signup module only when needed
			<Suspense fallback={<Processing message="Loading User..." />}>
				<InlineSignup />
			</Suspense>
		);

	// Finally, show the authenticated component
	// load auth module only when needed
	return (
		<>
			{/* Desktop layout - show all buttons */}
			<div className="hidden sm:flex gap-2 items-stretch">
				<Suspense fallback={
					<div className="w-28 h-[42px] bg-gradient-to-r from-gray-800 to-gray-500 border border-gray-600 text-white hover:border-white rounded-full cursor-not-allowed duration-800 transition-all animate-pulse">
					</div>
				}>
					<BalanceButton />
				</Suspense>
				<Suspense fallback={
					<div className="w-36 h-[42px] bg-gradient-to-r from-gray-800 to-gray-500 border border-gray-600 text-white hover:border-white rounded-full cursor-not-allowed duration-800 transition-all animate-pulse">
					</div>
				}>
					<AccountButton/>
				</Suspense>
				<Suspense fallback={
					<div className="w-[42px] h-[42px] border border-white rounded-full cursor-not-allowed overflow-hidden flex justify-center items-center">
						<LoaderCircle color="white" className="w-[18px] h-[18px] animate animate-spin"/>
					</div>
				}>
					<Auth />
				</Suspense>
			</div>
			
			{/* Mobile layout - just Auth button with integrated account info */}
			<div className="sm:hidden">
				<Suspense fallback={
					<div className="w-[32px] h-[32px] border border-white rounded-full cursor-not-allowed overflow-hidden flex justify-center items-center">
						<LoaderCircle color="white" className="w-4 h-4 animate animate-spin"/>
					</div>
				}>
					<Auth />
				</Suspense>
			</div>
		</>
	);
};

function Header() {

	// bg-gray-900

	return (
		<div className="flex-grow-0 flex-shrink-0 bg-gray-900 basis-16 sm:basis-24 flex flex-col justify-center items-stretch px-4 sm:px-6 md:px-8 lg:px-10 relative z-50">
			<div className="flex-grow-0 flex-shrink-0 flex basis-16 sm:basis-24 justify-between items-center w-full">
				<div className="flex items-center flex-shrink-0">
					<Logo />
				</div>
				<div className="flex-1 flex justify-center px-4">
					<Tabs />
				</div>
				<div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
					<Entry />
					<ModeToggle />
				</div>
			</div>
		</div>
	);
}

export default Header;
