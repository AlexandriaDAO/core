import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Types from "@/features/home-types";
import SearchResult from "@/features/search/SearchResult";
import MainLayout from "@/layouts/MainLayout";

function HomePage() {
	const { searchText } = useAppSelector((state) => state.search);

	return (
		<MainLayout>
			{searchText.length > 0 ? <SearchResult /> : <Types />}
		</MainLayout>
	);
}

export default HomePage;
