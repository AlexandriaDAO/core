import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Categories from "@/features/categories";
import SearchResult from "@/features/search/SearchResult";
import Loading from "@/features/loading";
import MainLayout from "@/layouts/MainLayout";

function HomePage() {
	const { searchResults, loading: searchLoading } = useAppSelector(
		(state) => state.search
	);
	return (
		<MainLayout>
			{searchResults.length > 0 ? (
				<SearchResult />
			) : (
				<Categories />
			)}
		</MainLayout>
	);
}

export default HomePage;
