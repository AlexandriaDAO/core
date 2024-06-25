import React from "react";
import { useAppSelector } from "src/ucg_frontend/src/store/hooks/useAppSelector";
import Auth from "src/ucg_frontend/src/features/auth";
import Filter from "src/ucg_frontend/src/features/filter";
import Search from "src/ucg_frontend/src/features/search";
import Logo from "./ui/Logo";
import Tabs from "./ui/Tabs";

function Header() {
	const {filter} = useAppSelector(state=>state.home);

	return (
		<div className={`flex-grow-0 flex-shrink-0 bg-black ${filter ? 'basis-44':'basis-24'} flex flex-col justify-center items-stretch px-10`}>
			<div className="flex-grow-0 flex-shrink-0 flex basis-24 justify-between items-center">
				<Logo />
				<Search />
				<Tabs />
				<Auth />
			</div>
			{filter && <Filter />}
		</div>
	);
}

export default Header;
