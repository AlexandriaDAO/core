import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Types from "@/features/home-types";
import SearchResult from "@/features/search/SearchResult";
import MainLayout from "@/layouts/MainLayout";
import useSession from "@/hooks/useSession";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import fetchBooks from "@/features/portal/thunks/fetchBooks";

function HomePage() {
	const {actor} = useSession();
    const dispatch = useAppDispatch();

	const { searchText } = useAppSelector(
		(state) => state.search
	);

	const { books } = useAppSelector(
		(state) => state.portal
	);

	useEffect(() => {
		if(books.length > 0 || !actor) return;
		dispatch(fetchBooks(actor));
	}, [books, actor, dispatch]);

	return (
		<MainLayout>
			{searchText.length > 0 ? (
				<SearchResult />
			) : (
				<Types />
			)}
		</MainLayout>
	);
}

export default HomePage;
