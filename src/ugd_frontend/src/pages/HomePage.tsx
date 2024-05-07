import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Categories from "@/features/categories";
import SearchResult from "@/features/search/SearchResult";
import Loading from "@/features/loading";
import MainLayout from "@/layouts/MainLayout";

function HomePage() {
	const { searchText } = useAppSelector(
		(state) => state.search
	);
	useEffect(()=>{
		console.log(searchText);
	},[searchText])

	return (
		<MainLayout>
			{searchText.length > 0 ? (
				<SearchResult />
			) : (
				<Categories />
			)}
		</MainLayout>
	);
}

export default HomePage;
