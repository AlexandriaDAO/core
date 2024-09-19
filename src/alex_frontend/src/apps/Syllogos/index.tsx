import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Types from "@/features/home-types";
import SearchResult from "@/features/search/SearchResult";
import Search from "@/features/search";
import MainLayout from "@/layouts/MainLayout";

function Syllogos() {
	const { searchText } = useAppSelector((state) => state.search);

	return (
		<MainLayout>
			<div>
				<Search />
				{searchText.length > 0 ? <SearchResult /> : <Types />}
			</div>
		</MainLayout>
	);
}

export default Syllogos;
