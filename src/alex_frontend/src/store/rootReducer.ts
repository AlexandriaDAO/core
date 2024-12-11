import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
import collectionReducer from "@/features/collection/collectionSlice";
import homeReducer from "@/features/home/homeSlice";
import authReducer from "@/features/auth/authSlice";
import loginReducer from "@/features/login/loginSlice";
import signupReducer from "@/features/signup/signupSlice";
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
import myNodesReducer from "@/features/my-nodes/myNodesSlice";
import swapReducer from "@/features/swap/swapSlice"
import icpLedgerReducer from "@/features/icp-ledger/icpLedgerSlice";
import tokenomicsReducer from "@/features/swap/tokenomicsSilce";
import alexReducer from "@/features/swap/alexSlice";

import contentDisplayReducer from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import arweaveReducer from "@/apps/Modules/shared/state/arweave/arweaveSlice";
import libraryReducer from "@/apps/Modules/shared/state/librarySearch/librarySlice";
import nftDataReducer from "@/apps/Modules/shared/state/nftData/nftDataSlice";

import emporiumReducer from "@/apps/app/Emporium/emporiumSlice";

import uploadBookReducer from "@/features/upload-book/uploadBookSlice";

const rootReducer = combineReducers({
	home: homeReducer,
	auth: authReducer,
	login: loginReducer,
	signup: signupReducer,
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
	myNodes: myNodesReducer,

	uploadBook: uploadBookReducer,

	swap:swapReducer,
	icpLedger:icpLedgerReducer,
	tokenomics:tokenomicsReducer,
	portal: portalReducer,
	collection: collectionReducer,
	alex:alexReducer,

	arweave: arweaveReducer,
	contentDisplay: contentDisplayReducer,
	library: libraryReducer,
	nftData: nftDataReducer,
	emporium:emporiumReducer,
});

export default rootReducer;
