import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import TopProgressBar from "@/components/TopProgressBar";
// import { lazyLoad, wait } from "@/utils/lazyLoad";
import LayoutSkeleton from "@/layouts/skeletons/LayoutSkeleton";

import BaseLayout from "@/layouts/BaseLayout";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MainPageSkeleton from "@/layouts/skeletons/MainPageSkeleton";
import { wait } from "@/utils/lazyLoad";

const HomePage = lazy(() => wait(2000).then(()=>import("@/pages/HomePage")));


const DashboardLayout = lazy(() => wait(5000).then(()=>import("@/layouts/DashboardLayout")));
const NotFoundPage = lazy(() => wait(2000).then(()=>import("@/pages/NotFoundPage")));
const UpgradePage = lazy(() => wait(2000).then(()=>import("@/pages/dashboard/UpgradePage")));
const LibrarianLayout = lazy(() => wait(2000).then(()=>import("@/layouts/LibrarianLayout")));
const LibrarianPage = lazy(() => wait(2000).then(()=>import("@/pages/librarian/")));
const NodesPage = lazy(() => wait(2000).then(()=>import("@/pages/librarian/NodesPage")));
const UploadPage = lazy(() => wait(2000).then(()=>import("@/pages/dashboard/UploadPage")));
const InsightsPage = lazy(() => wait(2000).then(()=>import("@/pages/swap/insightsPage")));

const ManagerPage = lazy(() => wait(2000).then(()=>import("@/pages/ManagerPage")));
const LegacyLibrarianPage = lazy(() => wait(2000).then(()=>import("@/pages/LegacyLibrarianPage")));
const WhitepaperPage = lazy(() => wait(2000).then(()=>import("@/pages/WhitepaperPage")));
const Bibliotheca = lazy(() => wait(2000).then(()=>import("@/apps/app/Bibliotheca")));
const Alexandrian = lazy(() => wait(2000).then(()=>import("@/apps/app/Alexandrian")));
const Syllogos = lazy(() => wait(2000).then(()=>import("@/apps/app/Syllogos")));
const Lexigraph = lazy(() => wait(2000).then(()=>import("@/apps/app/Lexigraph")));
const Dialectica = lazy(() => wait(2000).then(()=>import("@/apps/app/Dialectica")));
const Permasearch = lazy(() => wait(2000).then(()=>import("@/apps/app/Permasearch")));
const Emporium = lazy(() => wait(2000).then(()=>import("@/apps/app/Emporium")));
const LegacyCollectionPage = lazy(() => wait(2000).then(()=>import("@/apps/app/Emporium/CollectionPage")));
const SwapPage = lazy(() => wait(2000).then(()=>import("@/pages/swap")));
const DetailTransaction = lazy(() => wait(2000).then(()=>import("@/features/swap/components/transactionHistory/detailTransaction")));
const MintPage = lazy(() => wait(2000).then(()=>import("@/pages/MintPage")));
const DashboardPage = lazy(() => wait(10000).then(()=>import("@/pages/dashboard")));
const ProfilePage = lazy(() => wait(2000).then(()=>import("@/pages/dashboard/ProfilePage")));
const EnginesPage = lazy(() => wait(2000).then(()=>import("@/pages/dashboard/EnginesPage")));
const EngineOverviewPage = lazy(() => wait(2000).then(()=>import("@/pages/dashboard/EngineOverviewPage")));
const PublicEnginesPage = lazy(() => wait(2000).then(()=>import("@/pages/dashboard/PublicEnginesPage")));
const AssetsPage = lazy(() => wait(2000).then(()=>import("@/pages/dashboard/AssetsPage")));
const CollectionPage = lazy(() => wait(2000).then(()=>import("@/pages/dashboard/CollectionPage")));

export const AppRoutes = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<BaseLayout />}>
					<Route path="/" element={<MainLayout />}>
						<Route index element={<Suspense key="home" fallback={<TopProgressBar />}><HomePage /></Suspense>} />
						<Route path="manager" element={<Suspense key="manager" fallback={<TopProgressBar />}><ManagerPage /></Suspense>} />
						<Route path="legacy_librarian" element={<Suspense key="legacy_librarian" fallback={<TopProgressBar />}><LegacyLibrarianPage /></Suspense>} />
						<Route path="whitepaper" element={<Suspense key="" fallback={<TopProgressBar />}><WhitepaperPage /></Suspense>} />

						<Route path="app">
							<Route path="bibliotheca" element={<Suspense key="bibliotheca" fallback={<TopProgressBar />}><Bibliotheca /></Suspense>} />
							<Route path="alexandrian" element={<Suspense key="alexandrian" fallback={<TopProgressBar />}><Alexandrian /></Suspense>} />
							<Route path="syllogos" element={<Suspense key="syllogos" fallback={<TopProgressBar />}><Syllogos /></Suspense>} />
							<Route path="lexigraph" element={<Suspense key="lexigraph" fallback={<TopProgressBar />}><Lexigraph /></Suspense>} />
							<Route path="dialectica" element={<Suspense key="dialectica" fallback={<TopProgressBar />}><Dialectica /></Suspense>} />
							<Route path="permasearch" element={<Suspense key="permasearch" fallback={<TopProgressBar />}><Permasearch /></Suspense>} />

							<Route path="emporium">
								<Route index element={<Suspense key="emporium" fallback={<TopProgressBar />}><Emporium /></Suspense>} />
								<Route
									path="collection"
									element={<Suspense key="collection" fallback={<TopProgressBar />}><LegacyCollectionPage /></Suspense>}
								/>
							</Route>
						</Route>
						<Route path="swap">
							<Route index element={<Suspense key="swap" fallback={<TopProgressBar />}><SwapPage /></Suspense>} />
							<Route path="transaction" element={<Suspense key="transaction" fallback={<TopProgressBar />}><DetailTransaction /></Suspense>} />
							<Route path="insights" element={<Suspense key="insights" fallback={<TopProgressBar />}><InsightsPage /></Suspense>} />
						</Route>
						<Route path="mint" element={<Suspense key="mint" fallback={<TopProgressBar />}><MintPage /></Suspense>} />

						<Route path="*" element={<Suspense key="not_found" fallback={<TopProgressBar />}><NotFoundPage /></Suspense>} />
					</Route>

          			<Route element={<AuthLayout />}>
						<Route path="dashboard" element={<Suspense key="dashboard_layout" fallback={<TopProgressBar />}><DashboardLayout /></Suspense>}>
							<Route index element={<Suspense key="dashboard_page" fallback={<TopProgressBar />}><DashboardPage /></Suspense>} />
							<Route path="profile">
								<Route index element={<Suspense key="profile" fallback={<TopProgressBar />}><ProfilePage /></Suspense>} />
								<Route path="upgrade" element={<Suspense key="upgrade" fallback={<TopProgressBar />}><UpgradePage /></Suspense>} />
							</Route>
							<Route path="engines">
								<Route index element={<Suspense key="engines" fallback={<TopProgressBar />}><EnginesPage /></Suspense>} />
								<Route path=":id" element={<Suspense key="engine_overview" fallback={<TopProgressBar />}><EngineOverviewPage /></Suspense>} />
								<Route path="public" element={<Suspense key="public_engines" fallback={<TopProgressBar />}><PublicEnginesPage /></Suspense>} />
							</Route>
							<Route path="assets">
								<Route index element={<Suspense key="assets" fallback={<TopProgressBar />}><AssetsPage /></Suspense>} />
								<Route path="upload" element={<Suspense key="upload" fallback={<TopProgressBar />}><UploadPage /></Suspense>} />
							</Route>
							<Route path="collection" element={
								<Suspense key="collection" fallback={<TopProgressBar />}>
									<CollectionPage />
								</Suspense>
							} />
						</Route>

						<Route path="librarian" element={<Suspense key="librarian" fallback={<LayoutSkeleton />}><LibrarianLayout /></Suspense>}>
							<Route index element={<Suspense key="librarian" fallback={<MainPageSkeleton />}><LibrarianPage /></Suspense>} />
							<Route path="nodes" element={<Suspense key="nodes" fallback={<MainPageSkeleton />}><NodesPage /></Suspense>} />

							<Route path="profile" element={<Suspense key="profile" fallback={<MainPageSkeleton />}><ProfilePage /></Suspense>} />
						</Route>

					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
