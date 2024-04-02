import FilterButton from "@/components/ui/FilterButton";
import SearchField from "@/components/ui/SearchField";
import React from "react";
import Filter from "./Filter";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Auth from "@/features/auth";

function Header() {
	const {filter} = useAppSelector(state=>state.home);

	return (
		<div className={`flex-grow-0 flex-shrink-0 ${filter ? 'basis-80 bg-[#717171]':'basis-40'} flex flex-col justify-center items-stretch px-10`}>
			<div className="flex-grow-0 flex-shrink-0 flex basis-40 justify-between items-center">
				<FilterButton />
				<SearchField />
				<Auth />
			</div>
			{filter && <Filter />}
		</div>
	);
}

export default Header;
