// This will be a refactor of the emporium app migrated to use shared app modules. 

import React, { useCallback, useEffect } from "react";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import EmporiumSearch from "./components/EmporiumSearch";
import getMarketListing from "../Emporium/thunks/getMarketListing";
import getUserIcrc7Tokens from "../Emporium/thunks/getUserIcrc7Tokens";
import getSpendingBalance from "@/features/swap/thunks/lbryIcrc/getSpendingBalance";
import { setTransactions } from "@/apps/Modules/shared/state/transactions/transactionSlice";

function Dialectica() {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const emporium = useAppSelector((state) => state.emporium);
	const [activeButton, setActiveButton] = React.useState("marketPlace");

	const handleSearch = useCallback(async () => {
		if (activeButton === "marketPlace") {
			await dispatch(getMarketListing({
				page: 1,
				searchStr: emporium.search.search,
				pageSize: emporium.search.pageSize.toString(),
				sort: emporium.search.sort,
				type: "marketPlace",
				userPrincipal: user?.principal || ""
			}));
		} else if (activeButton === "userListings" && user?.principal) {
			await dispatch(getMarketListing({
				page: 1,
				searchStr: emporium.search.search,
				pageSize: emporium.search.pageSize.toString(),
				sort: emporium.search.sort,
				type: "userListings",
				userPrincipal: user.principal
			}));
		}
	}, [dispatch, activeButton, emporium.search, user?.principal]);

	const handleShowMore = useCallback(async () => {
		// Implement show more logic here similar to original Emporium
	}, []);

	useEffect(() => {
		dispatch(setTransactions([])); // Clear any existing data
		handleSearch();
	}, [dispatch, handleSearch]);

	useEffect(() => {
		if (user?.principal) {
			dispatch(getSpendingBalance(user.principal));
		}
	}, [dispatch, user]);

	const topComponent = (
		<div className="pb-4 text-center">
			<Button
				className={`bg-gray-900lg:h-14 xs:h-10 lg:px-7 xs-px-5 text-white lg:text-xl md:text-lg sm:text-base xs:text-sm border border-2 border-[#353535] rounded-[30px] lg:me-5 md:me-3 xs:me-2 hover:bg-white hover:text-[#353535] mb-2 ${activeButton === "userNfts" ? "bg-white text-[#353535]" : ""}`}
				disabled={!user?.principal}
				onClick={() => {
					if (user) {
						dispatch(getUserIcrc7Tokens(user.principal));
						setActiveButton("userNfts");
					}
				}}
			>
				My Nfts
			</Button>
			<Button
				className={`bg-gray-900lg:h-14 xs:h-10 lg:px-7 xs-px-5 text-white lg:text-xl md:text-lg sm:text-base xs:text-sm border border-2 border-[#353535] rounded-[30px] lg:me-5 md:me-3 xs:me-2 hover:bg-white hover:text-[#353535] mb-2 ${activeButton === "marketPlace" ? "bg-white text-[#353535]" : ""}`}
				onClick={() => {
					setActiveButton("marketPlace");
					handleSearch();
				}}
			>
				MarketPlace
			</Button>
			<Button
				className={`bg-gray-900lg:h-14 xs:h-10 lg:px-7 xs-px-5 text-white lg:text-xl md:text-lg sm:text-base xs:text-sm border border-2 border-[#353535] rounded-[30px] lg:me-5 md:me-3 xs:me-2 hover:bg-white hover:text-[#353535] ${activeButton === "userListings" ? "bg-white text-[#353535]" : ""}`}
				disabled={!user?.principal}
				onClick={() => {
					setActiveButton("userListings");
					handleSearch();
				}}
			>
				My Listing
			</Button>
		</div>
	);

	return (
		<SearchContainer
			title="Emporium"
			description="MarketPlace"
			onSearch={handleSearch}
			onShowMore={handleShowMore}
			isLoading={emporium.loading}
			topComponent={topComponent}
			filterComponent={activeButton !== "userNfts" ? <EmporiumSearch /> : undefined}
			showMoreEnabled={true}
		/>
	);
}

export default React.memo(Dialectica);
