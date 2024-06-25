import React, { useEffect } from "react";
import { useAppSelector } from "src/ucg_frontend/src/store/hooks/useAppSelector";
import Categories from "src/ucg_frontend/src/features/categories";
import SearchResult from "src/ucg_frontend/src/features/search/SearchResult";
import Loading from "src/ucg_frontend/src/features/loading";
import MainLayout from "src/ucg_frontend/src/layouts/MainLayout";

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
