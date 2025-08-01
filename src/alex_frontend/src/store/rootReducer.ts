import { combineReducers } from "@reduxjs/toolkit";
import portalReducer from "@/features/portal/portalSlice";
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
import walletsReducer from "@/features/wallets/walletsSlice";
import addWalletReducer from "@/features/add-wallet/addWalletSlice";
import swapReducer from "@/features/swap/swapSlice"
import icpLedgerReducer from "@/features/icp-ledger/icpLedgerSlice";
import tokenomicsReducer from "@/features/swap/tokenomicsSilce";
import alexReducer from "@/features/swap/alexSlice";
import pinaxReducer from "@/features/pinax/pinaxSlice";
import perpetuaReducer from "@/apps/app/Perpetua/state/perpetuaSlice";

import transactionsReducer from "@/apps/Modules/shared/state/transactions/transactionSlice";

import arweaveReducer from "@/apps/Modules/shared/state/arweave/arweaveSlice";
import libraryReducer from "@/apps/Modules/shared/state/librarySearch/librarySlice";
import nftDataReducer from "@/apps/Modules/shared/state/nftData/nftDataSlice";
import assetManagerReducer from "@/apps/Modules/shared/state/assetManager/assetManagerSlice";

import emporiumReducer from "@/apps/app/Emporium/emporiumSlice";

import arweaveAssetsReducer from '@/features/arweave-assets/arweaveAssetsSlice';
import icpAssetsReducer from '@/features/icp-assets/icpAssetsSlice';
import marketplaceReducer from '@/features/marketplace/marketplaceSlice';
import userDisplayReducer from './slices/userDisplaySlice';
import balanceReducer from '@/features/balance/balanceSlice';
import insightsReducer from '@/features/insights/insightsSlice';
import historyReducer from '@/features/history/historySlice';
import stakeReducer from '@/features/stake/stakeSlice';
import permasearchReducer from '@/features/permasearch/store/slice';
import alexandrianReducer from '@/features/alexandrian/alexandrianSlice';

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
	wallets: walletsReducer,
	addWallet: addWalletReducer,
	pinax: pinaxReducer,

	swap:swapReducer,
	icpLedger:icpLedgerReducer,
	tokenomics:tokenomicsReducer,
	portal: portalReducer,
	alex:alexReducer,
	perpetua: perpetuaReducer,

	arweave: arweaveReducer,
	transactions: transactionsReducer,
	library: libraryReducer,
	nftData: nftDataReducer,
	emporium: emporiumReducer,
	assetManager:assetManagerReducer,
	marketplace: marketplaceReducer,

	arweaveAssets: arweaveAssetsReducer,
	icpAssets: icpAssetsReducer,
	userDisplay: userDisplayReducer,
	balance: balanceReducer,
	insights: insightsReducer,
	history: historyReducer,
	stake: stakeReducer,
	permasearch: permasearchReducer,
	alexandrian: alexandrianReducer,
});

export default rootReducer;
