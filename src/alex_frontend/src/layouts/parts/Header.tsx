import React, { Suspense } from "react";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Logo from "@/components/Logo";
import Tabs from "@/components/Tabs";
import { useIdentity } from "@/hooks/useIdentity";
import { InlineLogin } from "@/features/login";
import Processing from "@/components/Processing";
import { useUser } from "@/hooks/actors";

import { lazy } from "react";
import { ModeToggle } from "@/lib/components/mode-toggle";

const InlineSignup = lazy(() =>
	import("@/features/signup").then((module) => ({
		default: module.InlineSignup,
	}))
);
const Auth = lazy(() => import("@/features/auth"));

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
		<Suspense fallback={<Processing message="Loading Auth..." />}>
			<Auth />
		</Suspense>
	);
};

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	// bg-gray-900

	return (
		<div className="flex-grow-0 flex-shrink-0 bg-gray-900 basis-24 flex flex-col justify-center items-stretch lg:px-10 md:px-8 sm:px-6 xs:px-4 relative z-50">
			<div className="flex-grow-0 flex-shrink-0 flex basis-24 justify-between items-center w-full">
				<Logo />
				<div className="md:flex sm:hidden xs:hidden w-full justify-between">
					{/* expensive component */}
					<Tabs />

					<div className="flex gap-2 justify-between items-center">
						<Entry />
						<ModeToggle />
					</div>
				</div>
				<div className="hidden md:hidden sm:block xs:block">
					<button className="w-6 text-foreground" onClick={toggleMenu}>
						<img src="images/menu.svg" alt="menu-icon" />
					</button>
				</div>
			</div>
			{isMenuOpen && (
				<div className="flex flex-col pb-4">
					<Tabs />
					<div className="flex gap-2 justify-between">
						<Entry />
						<ModeToggle />
					</div>
				</div>
			)}
		</div>
	);
}

export default Header;
