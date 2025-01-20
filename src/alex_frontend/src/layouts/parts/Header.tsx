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

const InlineSignup = lazy(()=>import("@/features/signup").then(module => ({ default: module.InlineSignup })));
const Auth = lazy(()=>import("@/features/auth"));

export const Entry = () => {
	const { actor } = useUser();
	const { identity, isInitializing, isLoggingIn } = useIdentity();
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
	if (!user) return (
		// load signup module only when needed
		<Suspense fallback={<Processing message="Loading..." />}>
			<InlineSignup />;
		</Suspense>
	)

	// Finally, show the authenticated component
	// load auth module only when needed
	return <Suspense fallback={<Processing message="Loading..." />}>
		<Auth />
	</Suspense>
};

function Header() {
		const [isMenuOpen, setIsMenuOpen] = useState(false);
	  
		const toggleMenu = () => {
		  setIsMenuOpen(!isMenuOpen);
		};

	return (
		<div className="flex-grow-0 flex-shrink-0 bg-[#353535] basis-24 flex flex-col justify-center items-stretch lg:px-10 md:px-8 sm:px-6 xs:px-4">
      <div className="flex-grow-0 flex-shrink-0 flex basis-24 justify-between items-center w-full ">
        <Logo />
		<div className="md:flex sm:hidden xs:hidden w-full justify-between ">
		<Tabs />
		
        <Entry  />
		</div>
        <div className="hidden md:hidden sm:block xs:block">
          <button className="w-6" onClick={toggleMenu}>
            <img src="images/menu.svg" alt="menu-icon" />
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="flex flex-col pb-4">
		   <Tabs />
		   <Entry />
        </div>
      )}
    </div>
	);
}

export default Header;
