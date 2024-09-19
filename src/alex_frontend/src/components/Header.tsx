import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Auth from "@/features/auth";
import Filter from "@/features/filter";
import Logo from "./ui/Logo";
import Tabs from "./ui/Tabs";

function Header() {
	const {filter} = useAppSelector(state=>state.home);

	return (
		<div className={`flex-grow-0 flex-shrink-0 bg-black ${filter ? 'basis-44':'basis-24'} flex flex-col justify-center items-stretch px-10`}>
			<div className="flex-grow-0 flex-shrink-0 flex basis-24 justify-between items-center">
				<Logo />
				<Tabs />
				<Auth />
			</div>
			{filter && <Filter />}
		</div>
	);
}

export default Header;
