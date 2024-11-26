import React from "react";
import Auth from "@/features/auth";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Login from "@/features/login";
import Logo from "@/components/Logo";
import Tabs from "@/components/Tabs";
import { useInternetIdentity } from "ic-use-internet-identity";
import Signup from "@/features/signup";

function Header() {
	const {identity} = useInternetIdentity();
	const {user} = useAppSelector(state=>state.auth)

	return (
		<div className="flex-grow-0 flex-shrink-0 bg-[#353535] basis-24 flex flex-col justify-center items-stretch px-10">
			<div className="flex-grow-0 flex-shrink-0 flex basis-24 justify-between items-center w-full">
				<Logo />
				<Tabs />
				<div>
					{ identity ? (user ? <Auth /> : <Signup />): <Login/> }
				</div>
			</div>
		</div>
	);
}

export default Header;
