import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
import homeReducer from "@/features/home/homeSlice";
import authReducer from "@/features/auth/authSlice";
import searchReducer from "@/features/search/searchSlice";
import filterReducer from "@/features/filter/filterSlice";

import myEnginesReducer from "@/features/my-engines/myEnginesSlice";
import engineBooksReducer from "@/features/engine-books/engineBooksSlice";
import publicEnginesReducer from "@/features/public-engines/publicEnginesSlice";
import engineOverviewReducer from "@/features/engine-overview/engineOverviewSlice";
import portalCategoryReducer from "@/features/portal-category/portalCategorySlice";
import portalLanguageReducer from "@/features/portal-language/portalLanguageSlice";
import portalTypeReducer from "@/features/portal-type/portalTypeSlice";
import portalEraReducer from "@/features/portal-era/portalEraSlice";
import portalFilterReducer from "@/features/portal-filter/portalFilterSlice";
import librarianReducer from "@/features/librarian/librarianSlice";
import librarianProfileReducer from "@/features/librarian-profile/librarianProfileSlice";
import myNodesReducer from "@/features/my-nodes/myNodesSlice";
import swapReducer from "@/features/swap/swapSlice"
import icpLedgerReducer from "@/features/icp-ledger/icpLedgerSlice";
import tokenomicsReducer from "@/features/swap/tokenomicsSilce";
import alexReducer from "@/features/swap/alexSlice";

import contentDisplayReducer from "@/apps/LibModules/contentDisplay/redux/contentDisplaySlice";
import arweaveReducer from "@/apps/LibModules/arweaveSearch/redux/arweaveSlice";
import libraryReducer from "@/apps/LibModules/nftSearch/redux/librarySlice";

const rootReducer = combineReducers({
	home: homeReducer,
	auth: authReducer,
	search: searchReducer,
	filter: filterReducer,

	myEngines: myEnginesReducer,
	engineBooks: engineBooksReducer,
	publicEngines: publicEnginesReducer,
	engineOverview: engineOverviewReducer,

	portalCategory: portalCategoryReducer,
	portalLanguage: portalLanguageReducer,
	portalType: portalTypeReducer,
	portalEra: portalEraReducer,

	portalFilter: portalFilterReducer,

	librarian: librarianReducer,
	librarianProfile: librarianProfileReducer,
	myNodes: myNodesReducer,

	swap:swapReducer,
	icpLedger:icpLedgerReducer,
	tokenomics:tokenomicsReducer,
	portal: portalReducer,
	alex:alexReducer,

	arweave: arweaveReducer,
	contentDisplay: contentDisplayReducer,
	library: libraryReducer,
});

export default rootReducer;
