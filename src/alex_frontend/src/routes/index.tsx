import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import TopProgressBar from "@/components/TopProgressBar";
import LayoutSkeleton from "@/layouts/skeletons/LayoutSkeleton";

import BaseLayout from "@/layouts/BaseLayout";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MainPageSkeleton from "@/layouts/skeletons/MainPageSkeleton";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import Protected from "@/components/Protected";

const HomePage = lazy(()=>import("@/pages/HomePage"));

const DashboardLayout = lazy(()=>import("@/layouts/DashboardLayout"));
const NotFoundPage = lazy(()=>import("@/pages/NotFoundPage"));
const UpgradePage = lazy(()=>import("@/pages/dashboard/UpgradePage"));
const LibrarianLayout = lazy(()=>import("@/layouts/LibrarianLayout"));
const LibrarianPage = lazy(()=>import("@/pages/librarian/"));
const NodesPage = lazy(()=>import("@/pages/librarian/NodesPage"));
const UploadPage = lazy(()=>import("@/pages/dashboard/UploadPage"));
const InsightsPage = lazy(()=>import("@/pages/swap/insightsPage"));

const ManagerPage = lazy(()=>import("@/pages/ManagerPage"));
const LegacyLibrarianPage = lazy(()=>import("@/pages/LegacyLibrarianPage"));
const WhitepaperPage = lazy(()=>import("@/pages/WhitepaperPage"));
const FAQPage = lazy(()=>import("@/pages/FAQPage"));
const InfoPage = lazy(()=>import("@/pages/InfoPage"));
const Bibliotheca = lazy(()=>import("@/apps/app/Bibliotheca"));
const Alexandrian = lazy(()=>import("@/apps/app/Alexandrian"));
const Syllogos = lazy(()=>import("@/apps/app/Syllogos"));
const Lexigraph = lazy(()=>import("@/apps/app/Lexigraph"));
const Dialectica = lazy(()=>import("@/apps/app/Dialectica"));
const Permasearch = lazy(()=>import("@/apps/app/Permasearch"));
const Emporium = lazy(()=>import("@/apps/app/Emporium"));
const LegacyCollectionPage = lazy(()=>import("@/apps/app/Emporium/CollectionPage"));
const SwapPage = lazy(()=>import("@/pages/swap"));
const DetailTransaction = lazy(()=>import("@/features/swap/components/transactionHistory/detailTransaction"));
const MintPage = lazy(()=>import("@/pages/MintPage"));
const DashboardPage = lazy(()=>import("@/pages/dashboard"));
const ProfilePage = lazy(()=>import("@/pages/dashboard/ProfilePage"));
const EnginesPage = lazy(()=>import("@/pages/dashboard/EnginesPage"));
const EngineOverviewPage = lazy(()=>import("@/pages/dashboard/EngineOverviewPage"));
const PublicEnginesPage = lazy(()=>import("@/pages/dashboard/PublicEnginesPage"));
const AssetsPage = lazy(()=>import("@/pages/dashboard/AssetsPage"));
const CollectionPage = lazy(()=>import("@/pages/dashboard/CollectionPage"));
const SingleTokenView = lazy(() => import("@/apps/Modules/AppModules/contentGrid/SingleTokenView"));

export const AppRoutes = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<BaseLayout />}>
					<Route path="/" element={<MainLayout />}>
						<Route index element={<Suspense key="home" fallback={<TopProgressBar />}><HomePage /></Suspense>} />
						<Route path="nft/:tokenId" element={<Suspense key="nft" fallback={<TopProgressBar />}><SingleTokenView /></Suspense>} />
						<Route path="manager" element={<Suspense key="manager" fallback={<TopProgressBar />}><ManagerPage /></Suspense>} />
						<Route path="legacy_librarian" element={<Suspense key="legacy_librarian" fallback={<TopProgressBar />}><LegacyLibrarianPage /></Suspense>} />
						
						<Route path="info">
							<Route index element={<Suspense key="info" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
							<Route path="faq" element={<Suspense key="faq" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
							<Route path="whitepaper" element={<Suspense key="whitepaper" fallback={<TopProgressBar />}><InfoPage /></Suspense>} />
						</Route>

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

						<Route path="401" element={<Suspense key="401" fallback={<TopProgressBar />}><UnauthorizedPage /></Suspense>} />
						<Route path="*" element={<Suspense key="404" fallback={<TopProgressBar />}><NotFoundPage /></Suspense>} />
					</Route>

					<Route element={<AuthLayout />}>
						<Route element={<Protected route />}>
							<Route path="dashboard" element={<Suspense key="dashboard_layout" fallback={<LayoutSkeleton />}><DashboardLayout /></Suspense>}>
								<Route index element={<Suspense key="dashboard_page" fallback={<MainPageSkeleton />}><DashboardPage /></Suspense>} />
								<Route path="profile">
									<Route index element={<Suspense key="profile" fallback={<MainPageSkeleton />}><ProfilePage /></Suspense>} />
									<Route path="upgrade" element={<Suspense key="upgrade" fallback={<MainPageSkeleton />}><UpgradePage /></Suspense>} />
								</Route>
								<Route path="engines">
									<Route index element={<Suspense key="engines" fallback={<MainPageSkeleton />}><EnginesPage /></Suspense>} />
									<Route path=":id" element={<Suspense key="engine_overview" fallback={<MainPageSkeleton />}><EngineOverviewPage /></Suspense>} />
									<Route path="public" element={<Suspense key="public_engines" fallback={<MainPageSkeleton />}><PublicEnginesPage /></Suspense>} />
								</Route>
								<Route path="assets">
									<Route index element={<Suspense key="assets" fallback={<MainPageSkeleton />}><AssetsPage /></Suspense>} />
									<Route path="upload" element={<Suspense key="upload" fallback={<MainPageSkeleton />}><UploadPage /></Suspense>} />
								</Route>
								<Route path="collection" element={
									<Suspense key="collection" fallback={<MainPageSkeleton />}>
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
				</Route>
			</Routes>
		</BrowserRouter>
	);
};
