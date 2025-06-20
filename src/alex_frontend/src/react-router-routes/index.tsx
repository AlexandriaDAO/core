// import React, { lazy, Suspense } from "react";
// import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";

// import TopProgressBar from "@/components/TopProgressBar";
// import LayoutSkeleton from "@/layouts/skeletons/LayoutSkeleton";

// import BaseLayout from "@/layouts/BaseLayout";
// import MainLayout from "@/layouts/MainLayout";
// const AuthGuard = lazy(()=>import("@/guards/AuthGuard"));
// import MainPageSkeleton from "@/layouts/skeletons/MainPageSkeleton";
// import PinaxSkeleton from "@/layouts/skeletons/PinaxSkeleton";
// const UnauthorizedPage = lazy(()=>import("@/pages/UnauthorizedPage"));
// import Protected from "@/guards/Protected";
// import LibrarianGuard from "@/guards/LibrarianGuard";
// import RouteFallback from "@/components/fallbacks/RouteFallback";
// import { ROUTES } from "./routeConfig";

// import MarketSkeleton from "@/layouts/skeletons/emporium/MarketSkeleton";
// import GeneralSkeleton from "@/layouts/skeletons/emporium/GeneralSkeleton";
// import MyNftsSkeleton from "@/layouts/skeletons/emporium/MyNftsSkeleton";
// const Imporium = lazy(()=>import("@/pages/emporium"));
// const HomePage = lazy(()=>import("@/pages/HomePage"));

// const DashboardLayout = lazy(()=>import("@/layouts/DashboardLayout"));
// const NotFoundPage = lazy(()=>import("@/pages/NotFoundPage"));
// const UpgradePage = lazy(()=>import("@/pages/dashboard/UpgradePage"));
// // const LibrarianLayout = lazy(()=>import("@/layouts/LibrarianLayout"));
// const LibrarianPage = lazy(()=>import("@/pages/librarian/"));
// const WalletsPage = lazy(()=>import("@/pages/librarian/WalletsPage"));
// // const AssetSyncPage = lazy(()=>import("@/pages/dashboard/AssetSyncPage"));
// const ArweaveAssetsPage = lazy(()=>import("@/pages/dashboard/ArweaveAssetsPage"));
// const ICPAssetsPage = lazy(()=>import("@/pages/dashboard/ICPAssetsPage"));
// // const FileUploadPage = lazy(()=>import("@/pages/dashboard/FileUploadPage"));
// const PinaxPage = lazy(()=>import("@/pages/PinaxPage"));
// // const UploadPage = lazy(()=>import("@/pages/dashboard/UploadPage"));

// const ManagerPage = lazy(()=>import("@/pages/ManagerPage"));
// // const WhitepaperPage = lazy(()=>import("@/pages/WhitepaperPage"));
// // const FAQPage = lazy(()=>import("@/pages/FAQPage"));
// const InfoPage = lazy(()=>import("@/pages/InfoPage"));
// const Bibliotheca = lazy(()=>import("@/apps/app/Bibliotheca"));
// const Alexandrian = lazy(()=>import("@/apps/app/Alexandrian"));
// const Syllogos = lazy(()=>import("@/apps/app/Syllogos"));
// const Perpetua = lazy(()=>import("@/apps/app/Perpetua"));
// const Dialectica = lazy(()=>import("@/apps/app/Dialectica"));
// const Permasearch = lazy(()=>import("@/apps/app/Permasearch"));
// const Emporium = lazy(()=>import("@/apps/app/Emporium"));

// const NftsPage = lazy(()=>import("@/pages/emporium/NftsPage"));
// const MyLogsPage = lazy(()=>import("@/pages/emporium/MyLogsPage"));
// const MarketLogsPage = lazy(()=>import("@/pages/emporium/MarketLogsPage"));
// const MyListingsPage = lazy(()=>import("@/pages/emporium/MyListingsPage"));
// const MarketPlacePage = lazy(()=>import("@/pages/emporium/MarketPlacePage"));

// const SwapPage = lazy(()=>import("@/pages/swap"));
// const DetailTransaction = lazy(()=>import("@/features/swap/components/transactionHistory/detailTransaction"));
// // const DashboardPage = lazy(()=>import("@/pages/dashboard"));
// const ProfilePage = lazy(()=>import("@/pages/dashboard/ProfilePage"));
// const SettingsPage = lazy(()=>import("@/pages/dashboard/SettingsPage"));
// // const EnginesPage = lazy(()=>import("@/pages/dashboard/EnginesPage"));
// // const EngineOverviewPage = lazy(()=>import("@/pages/dashboard/EngineOverviewPage"));
// // const PublicEnginesPage = lazy(()=>import("@/pages/dashboard/PublicEnginesPage"));
// // const AssetsPage = lazy(()=>import("@/pages/dashboard/AssetsPage"));
// // const CollectionPage = lazy(()=>import("@/pages/dashboard/CollectionPage"));
// const SingleTokenView = lazy(() => import("@/apps/Modules/AppModules/blinks/SingleTokenView"));

// const EmporiumActor = lazy(() => import("@/actors").then(module => ({ default: module.EmporiumActor })));
// const LbryActor = lazy(() => import("@/actors").then(module => ({ default: module.LbryActor })));
// const NftManagerActor = lazy(() => import("@/actors").then(module => ({ default: module.NftManagerActor })));
// const AlexWalletActor = lazy(() => import("@/actors").then(module => ({ default: module.AlexWalletActor })));
// const AlexBackendActor = lazy(() => import("@/actors").then(module => ({ default: module.AlexBackendActor })));

// const router = createBrowserRouter(
// 	createRoutesFromElements(
// 		<Route element={<BaseLayout />}>
// 			<Route path={ROUTES.HOME} element={<MainLayout />}>
// 				<Route index element={<Suspense key="home" fallback={<TopProgressBar />}><HomePage /></Suspense>} />
// 				<Route path={ROUTES.NFT} element={<Suspense key="nft" fallback={<TopProgressBar />}><SingleTokenView /></Suspense>} />
// 				<Route path={ROUTES.MANAGER} element={<Suspense key="manager" fallback={<TopProgressBar />}><ManagerPage /></Suspense>} />

// 				<Route path={ROUTES.INFO}>
// 					<Route index element={<Suspense key="info" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
// 					<Route path="faq" element={<Suspense key="faq" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
// 					<Route path="whitepaper" element={<Suspense key="whitepaper" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
// 					<Route path="audit" element={<Suspense key="audit" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
// 				</Route>

// 				<Route path="app">
// 					<Route path="bibliotheca" element={<Suspense key="bibliotheca" fallback={<TopProgressBar />}><Bibliotheca /></Suspense>} />

// 					<Route path="alexandrian" element={
// 						<Suspense key="alexandrian" fallback={<TopProgressBar />}>
// 							<LbryActor>
// 								<NftManagerActor>
// 									<Alexandrian />
// 								</NftManagerActor>
// 							</LbryActor>
// 						</Suspense>
// 					} />
					
// 					<Route path="syllogos" element={<Suspense key="syllogos" fallback={<TopProgressBar />}><Syllogos /></Suspense>} />
					
// 					<Route
// 						path="perpetua"
// 						element={
// 							<Suspense key="perpetua" fallback={<TopProgressBar />}>
// 								<Perpetua />
// 							</Suspense>
// 						}
// 					>
// 						<Route index element={<Suspense key="perpetua-home" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
// 						<Route path="shelf/:shelfId" element={<Suspense key="perpetua-shelf" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
// 						<Route path="item/:itemId" element={<Suspense key="perpetua-item" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
// 						<Route path="user/:userId" element={<Suspense key="perpetua-user" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
// 						<Route path="user/:userId/shelf/:shelfId" element={<Suspense key="perpetua-user-shelf" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
// 						<Route path="user/:userId/item/:itemId" element={<Suspense key="perpetua-user-item" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
// 					</Route>
					
// 					<Route path="dialectica" element={
// 						<Suspense key="dialectica" fallback={<TopProgressBar />}>
// 							<LbryActor>
// 								<NftManagerActor>
// 									<EmporiumActor>
// 										<Dialectica />
// 									</EmporiumActor>
// 								</NftManagerActor>
// 							</LbryActor>
// 						</Suspense>
// 					} />
// 					<Route path="permasearch" element={
// 						<Suspense key="permasearch" fallback={<TopProgressBar />}>
// 							<LbryActor>
// 								<NftManagerActor>
// 									<AlexBackendActor>
// 										<Permasearch />
// 									</AlexBackendActor>
// 								</NftManagerActor>
// 							</LbryActor>
// 						</Suspense>
// 					} />
// 					<Route path="emporium" element={
// 						<Suspense key="emporium" fallback={<TopProgressBar />}>
// 							<LbryActor>
// 								<NftManagerActor>
// 									<EmporiumActor>
// 										<Emporium />
// 									</EmporiumActor>
// 								</NftManagerActor>
// 							</LbryActor>
// 						</Suspense>
// 					} />

// 					<Route path="imporium">
// 						<Route index element={<Suspense key="imporium" fallback={<MarketSkeleton />}><Imporium /></Suspense>} />
// 					</Route>
// 				</Route>
				
// 				<Route path="swap">
// 					<Route index element={<Suspense key="swap" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="balance" element={<Suspense key="swap-balance" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="swap" element={<Suspense key="swap-swap" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="topup" element={<Suspense key="swap-topup" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="send" element={<Suspense key="swap-send" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="receive" element={<Suspense key="swap-receive" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="burn" element={<Suspense key="swap-burn" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="stake" element={<Suspense key="swap-stake" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="redeem" element={<Suspense key="swap-redeem" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="history" element={<Suspense key="swap-history" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="insights" element={<Suspense key="swap-insights" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
// 					<Route path="transaction" element={<Suspense key="transaction" fallback={<TopProgressBar />}><DetailTransaction /></Suspense>} />
// 				</Route>

// 				<Route path={ROUTES.UNAUTHORIZED} element={<Suspense key="401" fallback={<TopProgressBar />}><UnauthorizedPage /></Suspense>} />
// 				<Route path={ROUTES.NOT_FOUND} element={<Suspense key="404" fallback={<TopProgressBar />}><NotFoundPage /></Suspense>} />
// 			</Route>

// 			<Route element={<Suspense key="auth-guard" fallback={<TopProgressBar />}><AuthGuard /></Suspense>}>
// 				<Route element={<MainLayout />}>
// 					<Route path={ROUTES.PINAX} element={
// 						<Suspense key="pinax" fallback={<PinaxSkeleton />}>
// 							<AlexWalletActor>
// 								<NftManagerActor>
// 									<LbryActor>
// 										<PinaxPage />
// 									</LbryActor>
// 								</NftManagerActor>
// 							</AlexWalletActor>
// 						</Suspense>} />
// 					<Route path="app/imporium/nfts" element={<Suspense key="imporium-nfts" fallback={<MyNftsSkeleton />}><NftsPage /></Suspense>} />
// 					<Route path="app/imporium/marketplace" element={<Suspense key="imporium-marketplace" fallback={<GeneralSkeleton />}><EmporiumActor><MarketPlacePage /></EmporiumActor></Suspense>} />
// 					<Route path="app/imporium/listings" element={<Suspense key="imporium-listing" fallback={<GeneralSkeleton />}><EmporiumActor><MyListingsPage /></EmporiumActor></Suspense>} />
// 					<Route path="app/imporium/market-logs" element={
// 						<Suspense key="imporium-market-logs" fallback={<MyNftsSkeleton />}>
// 							<MarketLogsPage />
// 						</Suspense>
// 					} />
// 					<Route path="app/imporium/my-logs" element={
// 						<Suspense key="imporium-my-logs" fallback={<MyNftsSkeleton />}>
// 							<EmporiumActor><MyLogsPage /></EmporiumActor>
// 						</Suspense>
// 					} />
// 				</Route>
// 				{/* <Route element={<Protected route />}> */}
// 					<Route path={ROUTES.DASHBOARD_ROUTES.BASE} element={<Suspense key="dashboard_layout" fallback={<LayoutSkeleton />}><DashboardLayout /></Suspense>}>
// 						<Route element={<LibrarianGuard />}>
// 							<Route index element={<Suspense key="dashboard_page" fallback={<MainPageSkeleton />}><LibrarianPage /></Suspense>} />
// 							{/* <Route path="wallets" element={<Suspense key="wallets" fallback={<MainPageSkeleton />}><WalletsPage /></Suspense>} /> */}
// 							<Route path="wallets" element={<Protected unauthorizedComponent={
// 								<div className="p-4 text-center">
// 									<p className="text-lg font-semibold">Experimental Feature</p>
// 									<p className="mt-2 text-sm text-gray-600">
// 										This is an experimental VetKey feature to provide Arweave Wallet Private Keys to be used in-app. 
// 										If you'd like to participate in adding a wallet as a volunteer, please ask an admin.
// 									</p>
// 								</div>
// 							}><WalletsPage /></Protected>} />
// 						</Route>
// 						<Route path="arweave-assets" element={<Suspense key="arweave-assets" fallback={<MainPageSkeleton />}><ArweaveAssetsPage /></Suspense>} />
// 						<Route path="icp-assets" element={<Suspense key="icp-assets" fallback={<MainPageSkeleton />}><ICPAssetsPage /></Suspense>} />
// 						<Route path="profile">
// 							<Route index element={<Suspense key="profile" fallback={<MainPageSkeleton />}><ProfilePage /></Suspense>} />
// 							<Route path="upgrade" element={<Suspense key="upgrade" fallback={<MainPageSkeleton />}><UpgradePage /></Suspense>} />
// 						</Route>
// 						<Route path="settings" element={<Suspense key="settings" fallback={<MainPageSkeleton />}><SettingsPage /></Suspense>} />
// 					</Route>
// 				{/* </Route> */}
// 			</Route>
// 		</Route>
// 	)
// );
  
// export const AppRoutes = ()=> {
// 	return <RouterProvider router={router} />;
// }
