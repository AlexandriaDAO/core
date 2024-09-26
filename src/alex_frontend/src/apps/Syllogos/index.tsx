import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Types from "@/features/home-types";
import Filter from "@/features/filter";
import SearchResult from "@/features/search/SearchResult";
import Search from "@/features/search";
import AppLayout from "@/layouts/AppLayout";

function Syllogos() {
	const { searchText } = useAppSelector((state) => state.search);
	const { filter } = useAppSelector(state => state.home);

	return (
		<AppLayout>
			<div className="flex flex-col">
				{filter && <Filter />}
				<div className="mt-4">
					<Search />
					{searchText.length > 0 ? <SearchResult /> : <Types />}
				</div>
			</div>
		</AppLayout>
	);
}

export default Syllogos;
