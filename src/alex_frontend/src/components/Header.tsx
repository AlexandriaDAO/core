import React from "react";
import Auth from "@/features/auth";
import Logo from "./ui/Logo";
import Tabs from "./ui/Tabs";

function Header() {
	return (
		<div className="flex-grow-0 flex-shrink-0 bg-black basis-24 flex flex-col justify-center items-stretch px-10">
			<div className="flex-grow-0 flex-shrink-0 flex basis-24 justify-between items-center w-full">
				<Logo />
				<Tabs />
				<Auth />
			</div>
		</div>
	);
}

export default Header;
