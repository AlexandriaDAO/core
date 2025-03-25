import React, { lazy, Suspense } from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";

import TopProgressBar from "@/components/TopProgressBar";
import LayoutSkeleton from "@/layouts/skeletons/LayoutSkeleton";

import BaseLayout from "@/layouts/BaseLayout";
import MainLayout from "@/layouts/MainLayout";
import AuthGuard from "@/guards/AuthGuard";
import MainPageSkeleton from "@/layouts/skeletons/MainPageSkeleton";
import PinaxSkeleton from "@/layouts/skeletons/PinaxSkeleton";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import Protected from "@/guards/Protected";
import LibrarianGuard from "@/guards/LibrarianGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ROUTES } from "./routeConfig";

const HomePage = lazy(()=>import("@/pages/HomePage"));

const DashboardLayout = lazy(()=>import("@/layouts/DashboardLayout"));
const NotFoundPage = lazy(()=>import("@/pages/NotFoundPage"));
const UpgradePage = lazy(()=>import("@/pages/dashboard/UpgradePage"));
// const LibrarianLayout = lazy(()=>import("@/layouts/LibrarianLayout"));
const LibrarianPage = lazy(()=>import("@/pages/librarian/"));
const WalletsPage = lazy(()=>import("@/pages/librarian/WalletsPage"));
const AssetSyncPage = lazy(()=>import("@/pages/dashboard/AssetSyncPage"));
const ArweaveAssetsPage = lazy(()=>import("@/pages/dashboard/ArweaveAssetsPage"));
const ICPAssetsPage = lazy(()=>import("@/pages/ICPAssetsPage"));
// const FileUploadPage = lazy(()=>import("@/pages/dashboard/FileUploadPage"));
const PinaxPage = lazy(()=>import("@/pages/PinaxPage"));
// const UploadPage = lazy(()=>import("@/pages/dashboard/UploadPage"));

const ManagerPage = lazy(()=>import("@/pages/ManagerPage"));
// const WhitepaperPage = lazy(()=>import("@/pages/WhitepaperPage"));
// const FAQPage = lazy(()=>import("@/pages/FAQPage"));
const InfoPage = lazy(()=>import("@/pages/InfoPage"));
const Bibliotheca = lazy(()=>import("@/apps/app/Bibliotheca"));
const Alexandrian = lazy(()=>import("@/apps/app/Alexandrian"));
const Syllogos = lazy(()=>import("@/apps/app/Syllogos"));
const Perpetua = lazy(()=>import("@/apps/app/Perpetua"));
const Dialectica = lazy(()=>import("@/apps/app/Dialectica"));
const Permasearch = lazy(()=>import("@/apps/app/Permasearch"));
const Emporium = lazy(()=>import("@/apps/app/Emporium"));
const SwapPage = lazy(()=>import("@/pages/swap"));
const DetailTransaction = lazy(()=>import("@/features/swap/components/transactionHistory/detailTransaction"));
// const DashboardPage = lazy(()=>import("@/pages/dashboard"));
const ProfilePage = lazy(()=>import("@/pages/dashboard/ProfilePage"));
const SettingsPage = lazy(()=>import("@/pages/dashboard/SettingsPage"));
// const EnginesPage = lazy(()=>import("@/pages/dashboard/EnginesPage"));
// const EngineOverviewPage = lazy(()=>import("@/pages/dashboard/EngineOverviewPage"));
// const PublicEnginesPage = lazy(()=>import("@/pages/dashboard/PublicEnginesPage"));
// const AssetsPage = lazy(()=>import("@/pages/dashboard/AssetsPage"));
// const CollectionPage = lazy(()=>import("@/pages/dashboard/CollectionPage"));
const SingleTokenView = lazy(() => import("@/apps/Modules/AppModules/blinks/SingleTokenView"));

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<ErrorBoundary><BaseLayout /></ErrorBoundary>}>
			<Route path={ROUTES.HOME} element={<MainLayout />}>
				<Route index element={<Suspense key="home" fallback={<TopProgressBar />}><HomePage /></Suspense>} />
				<Route path={ROUTES.NFT} element={<Suspense key="nft" fallback={<TopProgressBar />}><SingleTokenView /></Suspense>} />
				<Route path={ROUTES.MANAGER} element={<Suspense key="manager" fallback={<TopProgressBar />}><ManagerPage /></Suspense>} />

				<Route path={ROUTES.INFO}>
					<Route index element={<Suspense key="info" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
					<Route path="faq" element={<Suspense key="faq" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
					<Route path="whitepaper" element={<Suspense key="whitepaper" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
					<Route path="audit" element={<Suspense key="audit" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
				</Route>

				<Route path="app">
					<Route path="bibliotheca" element={<Suspense key="bibliotheca" fallback={<TopProgressBar />}><Bibliotheca /></Suspense>} />
					<Route path="alexandrian" element={<Suspense key="alexandrian" fallback={<TopProgressBar />}><Alexandrian /></Suspense>} />
					<Route path="syllogos" element={<Suspense key="syllogos" fallback={<TopProgressBar />}><Syllogos /></Suspense>} />
					<Route path="perpetua" element={<Suspense key="perpetua" fallback={<TopProgressBar />}><Perpetua /></Suspense>}>
						<Route index element={<Suspense key="perpetua-home" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
						<Route path="shelf/:shelfId" element={<Suspense key="perpetua-shelf" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
						<Route path="item/:itemId" element={<Suspense key="perpetua-item" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
						<Route path="user/:userId" element={<Suspense key="perpetua-user" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
						<Route path="user/:userId/shelf/:shelfId" element={<Suspense key="perpetua-user-shelf" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
						<Route path="user/:userId/item/:itemId" element={<Suspense key="perpetua-user-item" fallback={<TopProgressBar />}><Perpetua /></Suspense>} />
					</Route>
					<Route path="dialectica" element={<Suspense key="dialectica" fallback={<TopProgressBar />}><Dialectica /></Suspense>} />
					<Route path="permasearch" element={<Suspense key="permasearch" fallback={<TopProgressBar />}><Permasearch /></Suspense>} />

					<Route path="emporium" element={<Suspense key="emporium" fallback={<TopProgressBar />}><Emporium /></Suspense>} />
				</Route>
				<Route path="swap">
					<Route index element={<Suspense key="swap" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="balance" element={<Suspense key="swap-balance" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="swap" element={<Suspense key="swap-swap" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="topup" element={<Suspense key="swap-topup" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="send" element={<Suspense key="swap-send" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="receive" element={<Suspense key="swap-receive" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="burn" element={<Suspense key="swap-burn" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="stake" element={<Suspense key="swap-stake" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="redeem" element={<Suspense key="swap-redeem" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="history" element={<Suspense key="swap-history" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="insights" element={<Suspense key="swap-insights" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
					<Route path="transaction" element={<Suspense key="transaction" fallback={<TopProgressBar />}><DetailTransaction /></Suspense>} />
				</Route>

				<Route path={ROUTES.UNAUTHORIZED} element={<Suspense key="401" fallback={<TopProgressBar />}><UnauthorizedPage /></Suspense>} />
				<Route path={ROUTES.NOT_FOUND} element={<Suspense key="404" fallback={<TopProgressBar />}><NotFoundPage /></Suspense>} />
			</Route>

			<Route element={<AuthGuard />}>
				<Route element={<MainLayout />}>
					<Route path={ROUTES.PINAX} element={<Suspense key="pinax" fallback={<PinaxSkeleton />}><PinaxPage /></Suspense>} />
				</Route>
				<Route element={<Protected route />}>
					<Route path={ROUTES.DASHBOARD_ROUTES.BASE} element={<Suspense key="dashboard_layout" fallback={<LayoutSkeleton />}><DashboardLayout /></Suspense>}>
						<Route element={<LibrarianGuard />}>
							<Route index element={<Suspense key="dashboard_page" fallback={<MainPageSkeleton />}><LibrarianPage /></Suspense>} />
							<Route path="wallets" element={<Suspense key="wallets" fallback={<MainPageSkeleton />}><WalletsPage /></Suspense>} />
						</Route>

						<Route path="asset-sync" element={<Suspense key="asset-sync" fallback={<MainPageSkeleton />}><AssetSyncPage /></Suspense>} />
						<Route path="arweave-assets" element={<Suspense key="arweave-assets" fallback={<MainPageSkeleton />}><ArweaveAssetsPage /></Suspense>} />
						<Route path="icp-assets" element={<Suspense key="icp-assets" fallback={<MainPageSkeleton />}><ICPAssetsPage /></Suspense>} />
						<Route path="profile">
							<Route index element={<Suspense key="profile" fallback={<MainPageSkeleton />}><ProfilePage /></Suspense>} />
							<Route path="upgrade" element={<Suspense key="upgrade" fallback={<MainPageSkeleton />}><UpgradePage /></Suspense>} />
						</Route>
						<Route path="settings" element={<Suspense key="settings" fallback={<MainPageSkeleton />}><SettingsPage /></Suspense>} />
					</Route>
				</Route>
			</Route>
		</Route>
	)
);
  
export const AppRoutes = ()=>{
	return <RouterProvider router={router} />;
}
