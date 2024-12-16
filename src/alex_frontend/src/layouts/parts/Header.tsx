import React from "react";
import Auth from "@/features/auth";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Logo from "@/components/Logo";
import Tabs from "@/components/Tabs";
import { useInternetIdentity } from "ic-use-internet-identity";
import { InlineLogin } from "@/features/login";
import { InlineSignup } from "@/features/signup";
import Processing from "@/components/Processing";
import { useUser } from "@/hooks/actors";

const Entry = () => {
	const { actor } = useUser();
	const { identity, isInitializing, isLoggingIn } = useInternetIdentity();
	const { user } = useAppSelector(state => state.auth);
	const { loading } = useAppSelector(state => state.login);

	// sequence matters

	// First, check initialization state
	if (isInitializing) return <Processing message="Initializing..." />;

	// Show loading state during login on frontend
	if (isLoggingIn) return <Processing message="Logging in..." />;

	// Then check if we have an identity
	if (!identity) return <InlineLogin />;

	// Show loading state while waiting for actor
	if (!actor) return <Processing message="Loading..." />;

	// Show loading state during login with backend
	if (loading) return <Processing message="Authenticating..." />;

	// If we have identity and actor but no user, show signup
	if (!user) return <InlineSignup />;

	// Finally, show the authenticated component
	return <Auth />;
};

function Header() {
	return (
		<div className="flex-grow-0 flex-shrink-0 bg-[#353535] basis-24 flex flex-col justify-center items-stretch px-10">
			<div className="flex-grow-0 flex-shrink-0 flex basis-24 justify-between items-center w-full">
				<Logo />
				<Tabs />
				<Entry />
			</div>
		</div>
	);
}

export default Header;
